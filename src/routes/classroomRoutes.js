const express = require('express');
const router = express.Router();
const {
    createClassroom,
    joinClassroom,
    getClassrooms,
    getClassroomById,
} = require('../controllers/classroomController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, teacher, createClassroom)
    .get(protect, getClassrooms);

router.post('/join', protect, joinClassroom);
router.get('/:id', protect, getClassroomById);

module.exports = router;
