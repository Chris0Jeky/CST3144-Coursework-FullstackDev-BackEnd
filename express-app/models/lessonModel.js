const db = require('../index');

function getLessonsCollection() {
    return db.collection('lessons');
}

module.exports = { getLessonsCollection };