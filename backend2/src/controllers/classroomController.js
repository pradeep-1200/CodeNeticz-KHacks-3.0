const Classroom = require('../models/Classroom');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Create a new classroom
// @route   POST /api/class/create
// @access  Private/Teacher
const createClassroom = async (req, res) => {
    const { className, description } = req.body;

    // Generate a random 6-character unique join code
    let joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Ensure uniqueness
    let existingClassroom = await Classroom.findOne({ joinCode });
    while (existingClassroom) {
        joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        existingClassroom = await Classroom.findOne({ joinCode });
    }

    // Base URL for invite links (fallback to localhost if not set)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const joinLink = `${frontendUrl}/join?code=${joinCode}`;

    const classroom = await Classroom.create({
        className,
        description,
        teacherId: req.user._id,
        joinCode,
        joinLink,
    });

    res.status(201).json(classroom);
};

// @desc    Join a classroom
// @route   POST /api/class/join
// @access  Private/Student
const joinClassroom = async (req, res) => {
    const { joinCode } = req.body;

    const classroom = await Classroom.findOne({ joinCode });

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // Check if teacher
    if (classroom.teacherId.toString() === req.user._id.toString()) {
        res.status(400).json({ message: 'You are the teacher of this classroom' });
        return;
    }

    // Check if already student
    if (classroom.students.includes(req.user._id)) {
        res.status(400).json({ message: 'You are already a member of this classroom' });
        return;
    }

    classroom.students.push(req.user._id);
    await classroom.save();

    res.json({ message: 'Classroom joined successfully', classroom });
};

// @desc    Get classroom by ID
// @route   GET /api/class/:classId
// @access  Private
const getClassroomById = async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId)
        .populate('teacherId', 'name email')
        .populate('students', 'name email');

    if (classroom) {
        // Check if user is part of the classroom
        const isTeacher = classroom.teacherId._id.toString() === req.user._id.toString();
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

// @desc    Get all classrooms for the logged in user
// @route   GET /api/class/my-classes
// @access  Private
const getUserClassrooms = async (req, res) => {
    let classrooms;

    if (req.user.role === 'teacher') {
        classrooms = await Classroom.find({ teacherId: req.user._id });
    } else {
        classrooms = await Classroom.find({ students: req.user._id });
    }

    res.json(classrooms);
};

// @desc    Add a student to a classroom by email
// @route   POST /api/class/:classId/add-student
// @access  Private/Teacher
const addStudent = async (req, res) => {
    const { email } = req.body;
    const { classId } = req.params;

    const classroom = await Classroom.findById(classId);

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // specific authorization check
    if (classroom.teacherId.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized to add students to this classroom' });
        return;
    }

    const student = await User.findOne({ email });

    if (!student) {
        res.status(404).json({ message: 'User with this email not found' });
        return;
    }

    if (classroom.students.includes(student._id)) {
        res.status(400).json({ message: 'Student already in classroom' });
        return;
    }

    classroom.students.push(student._id);
    await classroom.save();

    res.json({
        message: 'Student added successfully', student: {
            _id: student._id,
            name: student.name,
            email: student.email
        }
    });
};

module.exports = { createClassroom, joinClassroom, getClassroomById, getUserClassrooms, addStudent };
