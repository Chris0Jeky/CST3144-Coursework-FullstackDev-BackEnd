const { ObjectId } = require('mongodb');
const { getOrdersCollection } = require('../models/orderModel');
const { getLessonsCollection } = require('../models/lessonModel');

async function createOrder(req, res) {
    const db = req.app.locals.db; // Access the db instance from app.locals
    const ordersCollection = getOrdersCollection(db);
    const lessonsCollection = getLessonsCollection(db);
    const { name, phone, lessons } = req.body;

    // Basic validation
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    const phoneRegex = /^[0-9]{10}$/; // Adjust regex as needed
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
        return res.status(400).json({ error: 'At least one lesson is required' });
    }

    for (const item of lessons) {
        if (!item.lessonId || !ObjectId.isValid(item.lessonId)) {
            return res.status(400).json({ error: 'Valid lesson ID is required' });
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive integer' });
        }
    }

    // Start a session for transaction
    const session = db.client.startSession();

    try {
        await session.withTransaction(async () => {
            // Check and update each lesson
            for (const item of lessons) {
                const lessonId = item.lessonId;
                const quantity = item.quantity;

                const lesson = await lessonsCollection.findOne(
                    { _id: new ObjectId(lessonId) },
                    { session }
                );

                if (!lesson) {
                    throw new Error(`Lesson not found: ${lessonId}`);
                }

                if (lesson.space < quantity) {
                    throw new Error(`Not enough spaces for lesson: ${lesson.topic}`);
                }

                // Update lesson spaces
                await lessonsCollection.updateOne(
                    { _id: new ObjectId(lessonId) },
                    { $inc: { space: -quantity } },
                    { session }
                );
            }

            // Create the order
            const orderData = {
                name,
                phone,
                lessons,
                createdAt: new Date(),
            };

            await ordersCollection.insertOne(orderData, { session });

            res.status(201).json({ message: 'Order created successfully' });
        });
    } catch (err) {
        await session.abortTransaction();
        console.error('Transaction error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.endSession();
    }
}

async function getAllOrders(req, res) {
    const db = req.app.locals.db;
    const ordersCollection = getOrdersCollection(db);

    try {
        const orders = await ordersCollection.find({}).toArray();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createOrder,
    getAllOrders,
};
