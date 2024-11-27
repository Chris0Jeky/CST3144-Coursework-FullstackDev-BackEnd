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

    lessonsCollection.updateOne(
        { _id: new ObjectId(lessonId) },
        { $set: updateData }
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