const { ObjectId } = require('mongodb');
const { getLessonsCollection } = require('../models/lessonModel');

// Controller function to get all lessons
function getAllLessons(req, res) {
    const db = req.app.locals.db; // Access db from app locals
    const lessonsCollection = getLessonsCollection(db);

    // Extract query parameters
    const { topic, location, price, search, sortAttribute, sortOrder } = req.query;
    let filter = {};

    // Apply filters based on query parameters
    if (topic) filter.topic = topic;
    if (location) filter.location = location;
    if (price) filter.price = parseFloat(price);

    // If search query is present, add regex filters
    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        filter.$or = [
            { topic: { $regex: searchRegex } },
            { location: { $regex: searchRegex } },
            { price: { $regex: searchRegex } },
            { space: { $regex: searchRegex } }
        ];
    }

    // Apply sorting options
    let sortOptions = {};
    if (sortAttribute) {
        const order = sortOrder === 'desc' ? -1 : 1;
        sortOptions[sortAttribute] = order;
    }

    // Fetch lessons from the database
    lessonsCollection.find(filter).sort(sortOptions).toArray()
        .then((lessons) => {
            res.json(lessons); // Send lessons as JSON response
        })
        .catch((err) => {
            res.status(500).json({ error: err.message }); // Handle errors
        });
}

// Controller function to update a lesson
function updateLesson(req, res) {
    const db = req.app.locals.db;
    const lessonsCollection = getLessonsCollection(db);
    const lessonId = req.params.id;
    const updateData = req.body;

    // Validate if updateData is provided
    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided' });
    }

    // Ensure that 'space' is a number if it's being updated
    if (updateData.space && typeof updateData.space !== 'number') {
        return res.status(400).json({ error: 'Space must be a number' });
    }

    // Update the lesson in the database
    lessonsCollection.updateOne(
        { _id: new ObjectId(lessonId) },
        { $set: updateData } // Use $set operator to update fields
    )
        .then((result) => {
            if (result.matchedCount === 0) {
                res.status(404).json({ error: 'Lesson not found' }); // Handle not found
            } else {
                res.json({ message: 'Lesson updated successfully' }); // Success message
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err.message }); // Handle errors
        });
}

module.exports = {
    getAllLessons,
    updateLesson,
};
