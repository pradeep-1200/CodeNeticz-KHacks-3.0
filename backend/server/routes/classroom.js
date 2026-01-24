const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const crypto = require('crypto');

// Create a new classroom
router.post('/create', async (req, res) => {
    const { className, description } = req.body;

    try {
        // Generate a random 6-character unique join code
        let joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Ensure uniqueness
        let existingClassroom = await Classroom.findOne({ joinCode });
        while (existingClassroom) {
            joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
            existingClassroom = await Classroom.findOne({ joinCode });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const joinLink = `${frontendUrl}/join?code=${joinCode}`;

        const classroom = await Classroom.create({
            className,
            description,
            teacherId: "mock-teacher-id", // For demo purposes
            joinCode,
            joinLink,
        });

        res.status(201).json(classroom);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all classrooms for the logged in user
router.get('/my-classes', async (req, res) => {
    try {
        // For demo, return empty array or mock data
        const classrooms = [];
        res.json(classrooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get classroom by ID
router.get('/:classId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classId)
            .populate('teacherId', 'name email')
            .populate('students', 'name email');

        if (classroom) {
            res.json(classroom);
        } else {
            res.status(404).json({ message: 'Classroom not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;