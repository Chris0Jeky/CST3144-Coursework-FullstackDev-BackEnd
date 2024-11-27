const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// Route to get all lessons, possibly with filters
router.get('/lessons', lessonController.getAllLessons);

// Route to update a lesson by ID
router.put('/lessons/:id', lessonController.updateLesson);

module.exports = router;
