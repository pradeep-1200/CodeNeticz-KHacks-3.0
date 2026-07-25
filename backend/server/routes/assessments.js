'use strict';

/**
 * Assessment Routes — Phase 3  (Teacher/Class operations only)
 * Mounted at:  /api/classes  and  /api/v1/classes
 *
 *   POST   /classes/create-assessment           create (draft or publish)
 *   GET    /classes/:classId/assessments         list all for a class (teacher)
 *   PATCH  /classes/assessments/:id/unpublish    Published → Draft
 *   DELETE /classes/assessments/:id              hard delete
 *
 * Student read routes live in routes/student.js:
 *   GET    /student/assessments                  published assessments for enrolled classes
 *   GET    /student/assessments/:id              single published assessment detail
 */

const express      = require('express');
const router       = express.Router();
const Assessment   = require('../models/Assessment');
const Class        = require('../models/Class');
const Notification = require('../models/Notification');
const { rbac }     = require('../src/middleware/rbac');

const isValidId = (id) => /^[a-f\d]{24}$/i.test(id);

// ── POST /classes/create-assessment ───────────────────────────
// Create a new assessment (Draft or Published) for a classroom.
// Validates: title, duration, classId, ownership, question count when publishing.
router.post('/create-assessment', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId = req.user.id;
    try {
        const {
            classId, title, subject, duration,
            scheduledDate, startTime, endTime,
            status, questions, isPublished
        } = req.body;

        if (!classId || !isValidId(classId)) {
            return res.status(400).json({ success: false, message: 'Valid classId is required' });
        }
        if (!title?.trim()) {
            return res.status(400).json({ success: false, message: 'Assessment title is required' });
        }
        if (!duration || Number(duration) < 1) {
            return res.status(400).json({ success: false, message: 'Duration must be at least 1 minute' });
        }
        if (isPublished && (!questions || questions.length === 0)) {
            return res.status(400).json({ success: false, message: 'Add at least one question before publishing' });
        }

        const cls = await Class.findById(classId);
        if (!cls) {
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }
        if (cls.teacherId.toString() !== teacherId) {
            return res.status(403).json({ success: false, message: 'You are not the teacher of this classroom' });
        }

        const now = new Date();
        const assessment = new Assessment({
            classId,
            teacherId,
            title:         title.trim(),
            subject:       (subject || cls.subject || '').trim(),
            duration:      Number(duration),
            scheduledDate: scheduledDate ? new Date(scheduledDate) : now,
            startTime:     startTime || '09:00 AM',
            endTime:       endTime   || '10:00 AM',
            status:        status    || 'Upcoming',
            questions: (questions || []).map(q => ({
                question:      (q.question || q.questionText || '').trim(),
                type:          q.type          || 'mcq',
                options:       q.options        || [],
                correctAnswer: q.correctAnswer  || '',
                difficulty:    q.difficulty     || 'easy',
                hint:          q.hint           || ''
            })).filter(q => q.question),
            isPublished: !!isPublished,
            publishedAt: isPublished ? now : null
        });

        await assessment.save();

        // Notify enrolled students when publishing immediately
        if (isPublished && cls.students.length > 0) {
            const notifications = cls.students.map(sid => ({
                userId:  sid,
                message: `New assessment published: "${title.trim()}" in ${cls.name}`,
                type:    'assignment',
                link:    '/student/dashboard'
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, assessment });
    } catch (err) {
        next(err);
    }
});

// ── GET /classes/:classId/assessments ─────────────────────────
// Returns ALL assessments (draft + published) for a class.
// Only the class owner (teacher) can call this.
router.get('/:classId/assessments', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId = req.user.id;
    const { classId } = req.params;
    try {
        if (!isValidId(classId)) {
            return res.status(400).json({ success: false, message: 'Invalid classId' });
        }
        const cls = await Class.findById(classId);
        if (!cls) {
            return res.status(404).json({ success: false, message: 'Classroom not found' });
        }
        if (cls.teacherId.toString() !== teacherId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const assessments = await Assessment.find({ classId })
            .sort({ createdAt: -1 });

        res.json({ success: true, assessments });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /classes/assessments/:id/unpublish ──────────────────
// Move a Published assessment back to Draft.
router.patch('/assessments/:id/unpublish', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId = req.user.id;
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
        }
        const assessment = await Assessment.findById(id);
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }
        if (assessment.teacherId.toString() !== teacherId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        if (!assessment.isPublished) {
            return res.status(400).json({ success: false, message: 'Assessment is already a draft' });
        }

        assessment.isPublished = false;
        assessment.publishedAt = null;
        await assessment.save();

        res.json({ success: true, message: 'Assessment moved to Draft', assessment });
    } catch (err) {
        next(err);
    }
});

// ── DELETE /classes/assessments/:id ───────────────────────────
// Hard delete an assessment (teacher must own it).
router.delete('/assessments/:id', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId = req.user.id;
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
        }
        const assessment = await Assessment.findById(id);
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }
        if (assessment.teacherId.toString() !== teacherId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await Assessment.findByIdAndDelete(id);
        res.json({ success: true, message: 'Assessment deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
