const { ObjectId } = require('mongodb');
const { getLessonsCollection } = require('../models/lessonModel');

function getAllLessons(req, res) {
    const db = req.app.locals.db; // Access db from app locals
    const lessonsCollection = getLessonsCollection(db);

    const { topic, location, price, search } = req.query;
    let filter = {};

    if (topic) filter.topic = topic;
    if (location) filter.location = location;
    if (price) filter.price = parseFloat(price);

    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        filter.$or = [
            { topic: { $regex: searchRegex } },
            { location: { $regex: searchRegex } },
            { price: { $regex: searchRegex } },
            { space: { $regex: searchRegex } }
        ];
    }

    lessonsCollection.find(filter).toArray()
        .then((lessons) => {
            res.json(lessons);
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
}


function updateLesson(req, res) {
    const db = req.app.locals.db;
    const lessonsCollection = getLessonsCollection(db);
    const lessonId = req.params.id;
    const updateData = req.body;

    // Validate if updateData is provided
    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
    }

    // Ensure that updateData uses valid MongoDB operators
    const validOperators = ['$set', '$inc'];
    const hasValidOperator = Object.keys(updateData).some(key => validOperators.includes(key));

    if (!hasValidOperator) {
        return res.status(400).json({ error: 'Invalid update operator. Use $set or $inc.' });
    }

    lessonsCollection.updateOne(
        { _id: new ObjectId(lessonId) },
        updateData // Use the updateData as is
    )
        .then((result) => {
            if (result.matchedCount === 0) {
                res.status(404).json({ error: 'Lesson not found' });
            } else {
                res.json({ message: 'Lesson updated successfully' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
}

module.exports = {
    getAllLessons,
    updateLesson,
};