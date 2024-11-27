// Function to get the lessons collection from the database
function getLessonsCollection(db) {
    return db.collection('lessons');
}

module.exports = { getLessonsCollection };