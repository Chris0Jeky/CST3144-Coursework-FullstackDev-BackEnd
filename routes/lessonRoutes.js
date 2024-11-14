const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.get('/lessons', lessonController.getAllLessons);
router.put('/lessons/:id', lessonController.updateLesson);

module.exports = router;
