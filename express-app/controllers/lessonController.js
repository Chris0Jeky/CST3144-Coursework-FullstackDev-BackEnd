const { ObjectId } = require('mongodb');

function getAllLessons(req, res) {
    const lessonsCollection = db.collection('lessons');

    // Extract query parameters for filtering and sorting
    const { topic, location, price } = req.query;

    let filter = {};
    if (topic) filter.topic = topic;
    if (location) filter.location = location;
    if (price) filter.price = parseFloat(price);

    lessonsCollection
        .find(filter)
        .toArray()
        .then((lessons) => {
            res.json(lessons);
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
}

function updateLesson(req, res) {
    const lessonsCollection = db.collection('lessons');
    const lessonId = req.params.id;
    const updateData = req.body;

    lessonsCollection
        .updateOne(
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
