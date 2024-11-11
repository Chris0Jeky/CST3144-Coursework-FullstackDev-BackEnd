const { ObjectId } = require('mongodb');

function createOrder(req, res) {
    const ordersCollection = db.collection('orders');
    const lessonsCollection = db.collection('lessons');
    const { name, phone, lessons } = req.body;

    if (!name || !phone || !lessons || !Array.isArray(lessons)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    // Start a session for transaction
    const session = db.client.startSession();

    session.withTransaction(async () => {
        try {
            // Check and update each lesson
            for (const item of lessons) {
                const lessonId = item.lessonId;
                const quantity = item.quantity;

                const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) }, { session });

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
        } catch (err) {
            await session.abortTransaction();
            res.status(500).json({ error: err.message });
        } finally {
            await session.endSession();
        }
    });
}

module.exports = {
    createOrder,
};


function createOrder(req, res) {

    // Basic validation
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    const phoneRegex = /^[0-9]{10}$/; // Adjust regex as needed
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Valid phone number is required' });
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

}
