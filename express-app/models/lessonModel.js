function getLessonsCollection(db) {
    return db.collection('lessons');
}

module.exports = { getLessonsCollection };