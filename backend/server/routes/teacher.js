const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const Material = require('../models/Material');
const Assessment = require('../models/Assessment');
const Classroom = require('../models/Classroom');

// Create a new class
router.post('/create-class', async (req, res) => {
    try {
        const { className, description } = req.body;
        
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newClass = new Classroom({
            name: className,
            className: className,
            teacher: '507f1f77bcf86cd799439011', // temporary teacher ID
            teacherId: '507f1f77bcf86cd799439011',
            description: description || '',
            joinCode: joinCode,
            students: [],
            materials: [],
            announcements: []
        });
        
        await newClass.save();
        
        res.json({
            success: true,
            class: newClass,
            message: 'Class created successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error creating class' });
    }
});

// Get all classes for a teacher
router.get('/classes', async (req, res) => {
    try {
        const classes = await Classroom.find().sort({ createdAt: -1 });
        res.json({ classes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get specific class details
router.get('/classes/:id', async (req, res) => {
    try {
        const classData = await Classroom.findById(req.params.id).populate('students', 'name email');
        
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }
        
        res.json({ class: classData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Upload Material Route
router.post('/upload-material', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        const newMaterial = new Material({
            title: req.body.title || req.file.originalname,
            desc: req.body.description || '',
            type: req.body.type || 'pdf',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            likes: 0,
            url: result.secure_url,
            publicId: result.public_id
        });

        await newMaterial.save();

        res.json({
            success: true,
            material: newMaterial
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error during upload" });
    }
});

// Get all materials
router.get('/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ _id: -1 });
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create Assessment
router.post('/create-assessment', async (req, res) => {
    try {
        const { question, options, correctAnswer, type, audioText, difficulty, hint } = req.body;

        const newAssessment = new Assessment({
            question,
            options,
            correctAnswer,
            type: type || 'mcq',
            audioText,
            difficulty: difficulty || 'easy',
            hint
        });

        await newAssessment.save();

        res.json({
            success: true,
            assessment: newAssessment
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error creating assessment" });
    }
});

// Get all assessments
router.get('/assessments', async (req, res) => {
    try {
        const assessments = await Assessment.find().sort({ _id: -1 });
        res.json(assessments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
    try {
        const materialsCount = await Material.countDocuments();
        const assessmentsCount = await Assessment.countDocuments();
        const classroomsCount = await Classroom.countDocuments();

        // Mock analytics data
        const analyticsData = {
            overview: {
                totalStudents: 45,
                totalMaterials: materialsCount,
                totalAssessments: assessmentsCount,
                totalClasses: classroomsCount
            },
            studentProgress: [
                { name: 'Week 1', completed: 20, pending: 5 },
                { name: 'Week 2', completed: 35, pending: 10 },
                { name: 'Week 3', completed: 40, pending: 5 },
                { name: 'Week 4', completed: 45, pending: 0 }
            ],
            assessmentScores: [
                { name: 'Quiz 1', average: 85 },
                { name: 'Quiz 2', average: 78 },
                { name: 'Quiz 3', average: 92 },
                { name: 'Quiz 4', average: 88 }
            ],
            engagementMetrics: [
                { name: 'Videos', engagement: 85 },
                { name: 'PDFs', engagement: 70 },
                { name: 'Quizzes', engagement: 95 },
                { name: 'Assignments', engagement: 80 }
            ]
        };

        res.json(analyticsData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;