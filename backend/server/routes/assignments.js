const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { rbac } = require('../src/middleware/rbac');

// Set up disk storage for student assignment document uploads
const uploadDir = path.join(__dirname, '../uploads/assignments');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// CREATE Assignment (Staff only)
// FIX: added rbac — was unprotected, any user could create assignments
router.post('/create', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const { classId, title, description, deadline, toolsAllowed, questions } = req.body;
    try {
        if (!classId || !title?.trim()) {
            return res.status(400).json({ success: false, message: 'classId and title are required' });
        }
        const newAssignment = new Assignment({
            classId,
            title: title.trim(),
            description,
            deadline,
            toolsAllowed,
            questions: questions || []
        });
        await newAssignment.save();

        // Send Notifications to all students in the class
        const cls = await Class.findById(classId);
        if (cls && cls.students.length > 0) {
            const notifications = cls.students.map(studentId => ({
                userId: studentId,
                message: `New Assignment: ${title}`,
                type: 'assignment',
                link: `/student/classroom`
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, assignment: newAssignment });
    } catch (err) { next(err); }
});

// GET Assignments for Class
router.get('/class/:classId', async (req, res) => {
    try {
        const assignments = await Assignment.find({ classId: req.params.classId }).sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// SUBMIT Assignment (Student) — handles JSON & File Uploads
router.post('/submit', upload.single('file'), async (req, res) => {
    try {
        const assignmentId = req.body.assignmentId;
        const studentId = req.user?.id || req.body.studentId;
        const content = req.body.content || '';
        
        let attachmentUrl = req.body.attachment || '';
        if (req.file) {
            attachmentUrl = `/uploads/assignments/${req.file.filename}`;
        }

        if (!assignmentId) {
            return res.status(400).json({ success: false, message: "Assignment ID is required" });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        // Check if already submitted
        const existingIndex = assignment.submissions.findIndex(s => s.studentId && s.studentId.toString() === studentId.toString());

        const submission = {
            studentId,
            content: content || (req.file ? `Uploaded file: ${req.file.originalname}` : 'Turned in'),
            attachment: attachmentUrl,
            submittedAt: new Date(),
            status: 'turned_in'
        };

        if (existingIndex > -1) {
            assignment.submissions[existingIndex] = submission;
        } else {
            assignment.submissions.push(submission);
        }

        await assignment.save();

        // Notify teacher of submission
        const cls = await Class.findById(assignment.classId);
        if (cls && cls.teacherId) {
            // FIX: req.user.name is never set by auth middleware — look up the user's name
            const submitter = await User.findById(studentId).select('name');
            await Notification.create({
                userId:  cls.teacherId,
                message: `${submitter?.name || 'A student'} turned in ${assignment.title}`,
                type:    'info',
                link:    '/staff/classes'
            });
        }

        res.json({ success: true, message: "Assignment turned in successfully!", submission });
    } catch (err) {
        console.error("Assignment submission error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to turn in assignment" });
    }
});

module.exports = router;
