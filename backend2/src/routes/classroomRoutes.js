const express = require('express');
const router = express.Router();
const {
    createClassroom,
    joinClassroom,
    getClassroomById,
    getUserClassrooms,
    addStudent
} = require('../controllers/classroomController');
const { protect, teacherOnly } = require('../middleware/auth');

router.post('/create', protect, teacherOnly, createClassroom);
router.post('/join', protect, joinClassroom);
router.get('/my-classes', protect, getUserClassrooms);
router.get('/:classId', protect, getClassroomById);
router.post('/:classId/add-student', protect, teacherOnly, addStudent);

module.exports = router;
