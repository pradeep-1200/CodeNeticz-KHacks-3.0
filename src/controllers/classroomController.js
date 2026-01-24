const Classroom = require('../models/Classroom');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Create a new classroom
// @route   POST /api/classrooms
// @access  Private/Teacher
const createClassroom = async (req, res) => {
    const { name, description } = req.body;

    // Generate a random 6-character unique join code
    let joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Ensure uniqueness (simple check)
    let existingClassroom = await Classroom.findOne({ joinCode });
    while (existingClassroom) {
        joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        existingClassroom = await Classroom.findOne({ joinCode });
    }

    const classroom = await Classroom.create({
        name,
        description,
        teacher: req.user._id,
        joinCode,
    });

    res.status(201).json(classroom);
};

// @desc    Join a classroom
// @route   POST /api/classrooms/join
// @access  Private/Student
const joinClassroom = async (req, res) => {
    const { joinCode } = req.body;

    const classroom = await Classroom.findOne({ joinCode });

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // Check if already joined via students array or if it is the teacher
    if (classroom.teacher.toString() === req.user._id.toString()) {
        res.status(400).json({ message: 'You are the teacher of this classroom' });
        return;
    }

    if (classroom.students.includes(req.user._id)) {
        res.status(400).json({ message: 'You are already a member of this classroom' });
        return;
    }

    classroom.students.push(req.user._id);
    await classroom.save();

    res.json({ message: 'Classroom joined successfully', classroom });
};

// @desc    Get all classrooms for the logged in user
// @route   GET /api/classrooms
// @access  Private
const getClassrooms = async (req, res) => {
    let classrooms;

    if (req.user.role === 'teacher') {
        classrooms = await Classroom.find({ teacher: req.user._id });
    } else {
        classrooms = await Classroom.find({ students: req.user._id });
    }

    res.json(classrooms);
};

// @desc    Get classroom by ID
// @route   GET /api/classrooms/:id
// @access  Private
const getClassroomById = async (req, res) => {
    const classroom = await Classroom.findById(req.params.id)
        .populate('teacher', 'name email')
        .populate('students', 'name email');

    if (classroom) {
        // Check if user is part of the classroom
        const isTeacher = classroom.teacher._id.toString() === req.user._id.toString();
        const isStudent = classroom.students.some(student => student._id.toString() === req.user._id.toString());

        if (isTeacher || isStudent) {
            res.json(classroom);
        } else {
            res.status(403).json({ message: 'Not authorized to view this classroom' });
        }
    } else {
        res.status(404).json({ message: 'Classroom not found' });
    }
};

module.exports = { createClassroom, joinClassroom, getClassrooms, getClassroomById };
