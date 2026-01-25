const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

// CREATE Assignment (Staff)
router.post('/create', async (req, res) => {
    const { classId, title, description, deadline, toolsAllowed, questions } = req.body;
    try {
        const newAssignment = new Assignment({
            classId,
            title,
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
                link: `/classroom/${classId}` // Assuming frontend route
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, assignment: newAssignment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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

// SUBMIT Assignment (Student)
router.post('/submit', async (req, res) => {
    const { assignmentId, studentId, content, attachment } = req.body;
    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        // Check if already submitted
        const existingIndex = assignment.submissions.findIndex(s => s.studentId.toString() === studentId);

        const submission = {
            studentId,
            content,
            attachment,
            submittedAt: new Date(),
            status: 'turned_in'
        };

        if (existingIndex > -1) {
            assignment.submissions[existingIndex] = submission;
        } else {
            assignment.submissions.push(submission);
        }

        await assignment.save();
        res.json({ success: true, message: "Assignment turned in!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
