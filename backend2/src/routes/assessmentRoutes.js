const express = require('express');
const router = express.Router();
const { getAssessments, createAssessment, updateAssessment } = require('../controllers/assessmentController');
const { protect, teacherOnly } = require('../middleware/auth');

router.get('/', protect, getAssessments);
router.post('/', protect, teacherOnly, createAssessment);
router.put('/:id', protect, teacherOnly, updateAssessment);

module.exports = router;
