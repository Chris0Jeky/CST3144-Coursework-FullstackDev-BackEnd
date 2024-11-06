function getLessonsCollection() {
    return db.collection('lessons');
}

module.exports = { getLessonsCollection };