const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');

// Helper to generate 6-char code
const generateCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// CREATE Class
router.post('/create', async (req, res) => {
    const { name, section, subject, teacherId } = req.body;
    try {
        const newClass = new Class({
            name,
            section,
            subject,
            teacherId, // In real app, get from req.user
            code: generateCode()
        });
        await newClass.save();
        res.status(201).json({ success: true, class: newClass });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET Classes for Teacher (mock: get all for now, or filter by teacherId if passed)
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        // demo: just return all classes for simplicity if id not matching, or exact match
        const classes = await Class.find({ teacherId: req.params.teacherId })
            .populate('students', 'name email')
            .populate('assessments', 'title difficulty xpReward')
            .populate('materials');
        res.json({ success: true, classes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// JOIN Class (Student via Code)
router.post('/join', async (req, res) => {
    const { code, studentId } = req.body;
    try {
        const classToJoin = await Class.findOne({ code });
        if (!classToJoin) return res.status(404).json({ success: false, message: "Invalid Class Code" });

        if (classToJoin.students.includes(studentId)) {
            return res.status(400).json({ success: false, message: "Already joined" });
        }

        classToJoin.students.push(studentId);
        await classToJoin.save();

        // Remove any invite if exists
        await Invitation.findOneAndDelete({ studentId, classId: classToJoin._id });

        res.json({ success: true, message: "Joined successfully", class: classToJoin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// INVITE Student (Teacher)
router.post('/invite', async (req, res) => {
    const { email, classId, teacherId } = req.body;
    try {
        const student = await User.findOne({ email, role: 'student' });
        if (!student) return res.status(404).json({ success: false, message: "Student email not found" });

        const cls = await Class.findById(classId);
        if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

        if (cls.students.includes(student._id)) {
            return res.status(400).json({ success: false, message: "Student already in class" });
        }

        // Check for existing invite
        const existing = await Invitation.findOne({ studentId: student._id, classId: cls._id, status: 'pending' });
        if (existing) return res.status(400).json({ success: false, message: "Invitation already sent" });

        const invite = new Invitation({
            studentId: student._id,
            teacherId,
            classId
        });
        await invite.save();

        res.json({ success: true, message: "Invitation sent!" });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET Classes for Student (Joined)
router.get('/student/:studentId', async (req, res) => {
    try {
        const classes = await Class.find({ students: req.params.studentId })
            .populate('teacherId', 'name')
            .populate('materials')
            .populate('assessments', 'title difficulty xpReward');
        res.json({ success: true, classes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET Invites for Student
router.get('/student/:studentId/invites', async (req, res) => {
    try {
        const invites = await Invitation.find({ studentId: req.params.studentId, status: 'pending' })
            .populate('classId', 'name section subject')
            .populate('teacherId', 'name');
        res.json({ success: true, invites });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ACCEPT/REJECT Invite
router.post('/invite/respond', async (req, res) => {
    const { inviteId, status } = req.body; // status: 'accepted' or 'rejected'
    try {
        const invite = await Invitation.findById(inviteId);
        if (!invite) return res.status(404).json({ success: false, message: "Invite not found" });

        invite.status = status;
        await invite.save();

        if (status === 'accepted') {
            const cls = await Class.findById(invite.classId);
            if (cls && !cls.students.includes(invite.studentId)) {
                cls.students.push(invite.studentId);
                await cls.save();
            }
        }

        res.json({ success: true, message: `Invite ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ASSIGN Level to Class
router.post('/assign-level', async (req, res) => {
    const { classId, levelId } = req.body;
    try {
        const cls = await Class.findById(classId);
        if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

        // Check if already assigned
        if (cls.assessments.includes(levelId)) {
            return res.status(400).json({ success: false, message: "Level already assigned to this class" });
        }

        cls.assessments.push(levelId);
        await cls.save();

        res.json({ success: true, message: "Level assigned successfully", class: cls });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
