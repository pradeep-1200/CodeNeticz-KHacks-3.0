const express = require('express');
const router = express.Router();
const {
    createClassroom,
    joinClassroom,
    getClassroomById,
} = require('../controllers/classroomController');
const { protect, teacherOnly } = require('../middleware/auth');

router.post('/create', protect, teacherOnly, createClassroom);
router.post('/join', protect, joinClassroom);
router.get('/:classId', protect, getClassroomById);

module.exports = router;
