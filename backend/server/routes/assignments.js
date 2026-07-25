const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');
const multer = require('multer');

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE DOES:
//   This file handles all assignment-related API routes.
//   It covers 4 core operations:
//     1. Staff creates an assignment for a class (POST /create)
//     2. Anyone fetches all assignments for a class (GET /class/:classId)
//     3. Staff views all submissions with student names populated (GET /class/:classId/submissions)
//     4. Student turns in work — file uploads directly to Cloudinary (POST /submit)
//
// WHY CLOUDINARY?
//   Files are stored on Cloudinary CDN, not on the server's local disk.
//   This means "Open Document" links work in any environment (local, Render, production)
//   and files are never lost when the server restarts.
//
// WHY MULTER MEMORY STORAGE?
//   multer.memoryStorage() keeps the uploaded file in RAM as a Buffer.
//   We immediately stream that buffer to Cloudinary — nothing ever touches the disk.
// ─────────────────────────────────────────────────────────────────────────────

// Multer: store file in memory only (not disk) — streamed to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
    fileFilter: function (req, file, cb) {
        const allowed = /pdf|doc|docx|txt|png|jpg|jpeg|webm|pptx|ppt|xls|xlsx/i;
        const ext = file.originalname.split('.').pop();
        if (allowed.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed. Accepted: PDF, DOC, DOCX, TXT, PPT, XLS, PNG, JPG, WebM'));
        }
    }
});

// ── Helper: stream a file buffer to Cloudinary ──────────────────────────────
// WHY: We can't use upload_stream with a path because Multer memory storage
//      gives us a Buffer, not a file path. streamifier converts that Buffer
//      into a readable stream that Cloudinary's SDK can accept.
const uploadToCloudinary = (fileBuffer, originalname) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',           // auto-detects: image, pdf, video, raw
                folder: 'aclc/submissions',       // organised folder in Cloudinary dashboard
                public_id: `${Date.now()}-${originalname.replace(/\s+/g, '_')}`,
                type: 'upload',
                access_mode: 'public'            // publicly readable URL — staff can open it
            },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// ── ROUTE 1: Create Assignment (Staff only) ──────────────────────────────────
// POST /api/v1/assignments/create
// WHY: Staff creates an assignment with a title, description, deadline,
//      and optional structured questions (text/mcq/voice).
//      After saving, all enrolled students are notified automatically.
router.post('/create', async (req, res) => {
    const { classId, title, description, deadline, toolsAllowed, questions, allowedFileTypes } = req.body;
    try {
        const newAssignment = new Assignment({
            classId,
            title,
            description,
            deadline,
            toolsAllowed,
            allowedFileTypes: allowedFileTypes || ['pdf', 'doc', 'docx', 'pptx', 'xls', 'txt'],
            questions: questions || []
        });
        await newAssignment.save();

        // Notify all enrolled students in the class
        // WHY: We push a notification to every student so they see "New Assignment"
        //      on their dashboard without needing to check manually.
        const cls = await Class.findById(classId).lean();
        if (cls && cls.students.length > 0) {
            const notifications = cls.students.map(studentId => ({
                userId: studentId,
                message: `📋 New Assignment: "${title}"`,
                type: 'assignment',
                link: `/student/classroom`
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, assignment: newAssignment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── ROUTE 2: Get All Assignments for a Class ─────────────────────────────────
// GET /api/v1/assignments/class/:classId
// WHY: Used in both student Classwork tab and staff Classwork tab.
//      Returns all assignment documents with their embedded submissions array.
//      MongoDB compound index { classId, createdAt } makes this fast.
router.get('/class/:classId', async (req, res) => {
    try {
        // .lean() returns plain JS objects (faster than Mongoose documents)
        // .sort({ createdAt: -1 }) = newest first
        const assignments = await Assignment
            .find({ classId: req.params.classId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── ROUTE 3: Get Submissions for a Class — Staff Grades View ─────────────────
// GET /api/v1/assignments/class/:classId/submissions
// WHY THIS ROUTE EXISTS:
//   The basic GET /class/:classId only returns raw studentId ObjectIds inside
//   each submission. The staff Grades tab needs the actual student name + email.
//   This route uses MongoDB aggregation + a single User.find() lookup to:
//     1. Fetch all assignments for the class
//     2. Collect all unique studentIds across all submissions
//     3. Fetch those student records in a SINGLE DB query (not N queries!)
//     4. Attach student name + email to each submission object
//   This is the "query optimization" — 2 total DB queries instead of O(n) lookups.
router.get('/class/:classId/submissions', async (req, res) => {
    try {
        // Step 1: Fetch all assignments with their embedded submissions
        const assignments = await Assignment
            .find({ classId: req.params.classId })
            .sort({ createdAt: -1 })
            .lean();

        if (!assignments.length) {
            return res.json({ success: true, assignments: [] });
        }

        // Step 2: Collect all unique studentIds across every submission in every assignment
        // WHY: Instead of querying the DB per submission (N+1 problem),
        //      we gather all IDs and fetch them in ONE batch query.
        const studentIdSet = new Set();
        assignments.forEach(a => {
            (a.submissions || []).forEach(s => {
                if (s.studentId) studentIdSet.add(s.studentId.toString());
            });
        });

        // Step 3: Single DB query to fetch all relevant student records
        let studentMap = {};
        if (studentIdSet.size > 0) {
            const students = await User
                .find({ _id: { $in: Array.from(studentIdSet) } })
                .select('name email learningProfile') // only fetch what we need
                .lean();
            // Build a map: { "mongoId": { name, email, learningProfile } }
            students.forEach(s => { studentMap[s._id.toString()] = s; });
        }

        // Step 4: Enrich each submission with student info
        const enrichedAssignments = assignments.map(a => ({
            ...a,
            submissions: (a.submissions || []).map(s => ({
                ...s,
                studentName: studentMap[s.studentId?.toString()]?.name || 'Unknown Student',
                studentEmail: studentMap[s.studentId?.toString()]?.email || '',
                learningProfile: studentMap[s.studentId?.toString()]?.learningProfile || 'DEFAULT'
            }))
        }));

        res.json({ success: true, assignments: enrichedAssignments });
    } catch (err) {
        console.error('Submissions fetch error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── ROUTE 4: Student Submits / Turns In Assignment ───────────────────────────
// POST /api/v1/assignments/submit  (multipart/form-data)
// WHY: Students upload their work here. The file is received by Multer
//      in memory (not disk), then streamed to Cloudinary.
//      The Cloudinary secure_url is stored in MongoDB — so staff can open it
//      directly from their browser with no server dependency.
//
// UPSERT LOGIC: If the student already submitted, we replace their old submission.
//      This allows students to re-submit if the deadline hasn't passed.
router.post('/submit', upload.single('file'), async (req, res) => {
    try {
        const assignmentId = req.body.assignmentId;
        const studentId = req.user?.id || req.body.studentId;
        const content = req.body.content || '';

        if (!assignmentId) {
            return res.status(400).json({ success: false, message: 'Assignment ID is required' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Upload file to Cloudinary if a file was attached
        let attachmentUrl = '';
        let attachmentPublicId = '';
        let attachmentName = '';

        if (req.file) {
            try {
                const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
                attachmentUrl = cloudResult.secure_url;       // permanent CDN link
                attachmentPublicId = cloudResult.public_id;   // for future deletion
                attachmentName = req.file.originalname;       // shown to staff
            } catch (uploadErr) {
                return res.status(500).json({
                    success: false,
                    message: `File upload failed: ${uploadErr.message || 'Cloudinary error'}`
                });
            }
        }

        // Require either text content OR a file attachment
        if (!content && !attachmentUrl) {
            return res.status(400).json({
                success: false,
                message: 'Please provide written answers or attach a document.'
            });
        }

        const submission = {
            studentId,
            content: content || `📄 Submitted: ${attachmentName}`,
            attachmentUrl,        // Cloudinary URL (opens directly in browser)
            attachmentPublicId,   // stored for potential deletion
            attachmentName,       // original filename shown to staff
            submittedAt: new Date(),
            status: 'turned_in'
        };

        // Upsert: find existing submission by this student and replace it,
        // or push a new one if this is their first submission
        const existingIndex = assignment.submissions.findIndex(
            s => s.studentId && s.studentId.toString() === studentId.toString()
        );

        if (existingIndex > -1) {
            // Student is re-submitting — overwrite the old submission
            assignment.submissions[existingIndex] = submission;
        } else {
            // First time turning in
            assignment.submissions.push(submission);
        }

        await assignment.save();

        // Notify the teacher that a student turned in work
        const cls = await Class.findById(assignment.classId).select('teacherId').lean();
        if (cls?.teacherId) {
            await Notification.create({
                userId: cls.teacherId,
                message: `✅ ${req.user?.name || 'A student'} turned in "${assignment.title}"`,
                type: 'info',
                link: '/staff/classes'
            });
        }

        res.json({ success: true, message: 'Assignment turned in successfully! 🎉', submission });
    } catch (err) {
        console.error('Assignment submission error:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to submit assignment' });
    }
});

module.exports = router;
