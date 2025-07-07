const { ObjectId } = require('mongodb');
const { getOrdersCollection } = require('../models/orderModel');
const { getLessonsCollection } = require('../models/lessonModel');
const { AppError } = require('../middleware/errorHandler');

// Create a new order with transaction support
async function createOrder(req, res) {
    const db = req.app.locals.db;
    const client = req.app.locals.client;
    const ordersCollection = getOrdersCollection(db);
    const lessonsCollection = getLessonsCollection(db);
    const { name, phone, lessons } = req.body;

    // Start a session for transaction
    const session = client.startSession();

    try {
        let orderResult;
        
        await session.withTransaction(async () => {
            // Track total amount
            let totalAmount = 0;
            const lessonDetails = [];

            // Validate and update each lesson
            for (const item of lessons) {
                const lessonId = new ObjectId(item.lessonId);
                const quantity = item.quantity;

                // Find and lock the lesson
                const lesson = await lessonsCollection.findOne(
                    { _id: lessonId },
                    { session }
                );

                if (!lesson) {
                    throw new AppError(`Lesson not found: ${item.lessonId}`, 404);
                }

                if (lesson.spaces < quantity) {
                    throw new AppError(
                        `Not enough spaces available for ${lesson.topic}. Available: ${lesson.spaces}, Requested: ${quantity}`,
                        400
                    );
                }

                // Update lesson spaces
                const updateResult = await lessonsCollection.updateOne(
                    { _id: lessonId, spaces: { $gte: quantity } },
                    { $inc: { spaces: -quantity } },
                    { session }
                );

                if (updateResult.modifiedCount === 0) {
                    throw new AppError('Failed to update lesson spaces', 500);
                }

                // Calculate amount and store details
                const lessonAmount = lesson.price * quantity;
                totalAmount += lessonAmount;
                lessonDetails.push({
                    lessonId: lessonId,
                    topic: lesson.topic,
                    location: lesson.location,
                    price: lesson.price,
                    quantity: quantity,
                    amount: lessonAmount
                });
            }

            // Create the order with enhanced details
            const orderData = {
                name: name.trim(),
                phone: phone.trim(),
                lessons: lessonDetails,
                totalAmount: totalAmount,
                status: 'confirmed',
                paymentStatus: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const insertResult = await ordersCollection.insertOne(orderData, { session });
            orderResult = {
                _id: insertResult.insertedId,
                ...orderData
            };
        });

        // Send confirmation response
        res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            data: {
                order: orderResult,
                confirmationNumber: orderResult._id.toString().substr(-8).toUpperCase()
            }
        });

    } catch (err) {
        await session.abortTransaction();
        if (err instanceof AppError) throw err;
        throw new AppError('Failed to create order', 500);
    } finally {
        await session.endSession();
    }
}

// Get all orders with pagination and filtering
async function getAllOrders(req, res) {
    const db = req.app.locals.db;
    const ordersCollection = getOrdersCollection(db);
    
    const { 
        page = 1, 
        limit = 20,
        status,
        paymentStatus,
        sortBy = 'createdAt',
        order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Sorting
    const sortOptions = {
        [sortBy]: order === 'desc' ? -1 : 1
    };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const totalCount = await ordersCollection.countDocuments(filter);
        
        const orders = await ordersCollection
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    total: totalCount,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(totalCount / parseInt(limit))
                }
            }
        });
    } catch (err) {
        throw new AppError('Failed to fetch orders', 500);
    }
}

// Get order by ID
async function getOrderById(req, res) {
    const db = req.app.locals.db;
    const ordersCollection = getOrdersCollection(db);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        throw new AppError('Invalid order ID format', 400);
    }

    try {
        const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        res.json({
            status: 'success',
            data: {
                order,
                confirmationNumber: order._id.toString().substr(-8).toUpperCase()
            }
        });
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError('Failed to fetch order', 500);
    }
}

// Get order statistics
async function getOrderStats(req, res) {
    const db = req.app.locals.db;
    const ordersCollection = getOrdersCollection(db);

    try {
        const stats = await ordersCollection.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' },
                    totalLessons: { $sum: { $size: '$lessons' } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalOrders: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    avgOrderValue: { $round: ['$avgOrderValue', 2] },
                    totalLessons: 1
                }
            }
        ]).toArray();

        // Orders by status
        const byStatus = await ordersCollection.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Recent orders trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyOrders = await ordersCollection.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]).toArray();

        res.json({
            status: 'success',
            data: {
                overview: stats[0] || {},
                byStatus,
                dailyTrend: dailyOrders
            }
        });
    } catch (err) {
        throw new AppError('Failed to fetch order statistics', 500);
    }
}

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderStats
};