'use strict';

/**
 * Student Assessment Submission Routes — Phase 4 + Phase 8 (Analytics)
 * Mounted at:  /api/submissions  and  /api/v1/submissions
 *
 * All routes require authentication (via index.js) + STUDENT role.
 *
 *   POST   /submissions/:assessmentId/start    Begin attempt
 *   POST   /submissions/:assessmentId/save     Auto-save partial answers
 *   POST   /submissions/:assessmentId/submit   Final submission → triggers evaluation
 *   GET    /submissions/:assessmentId/me       Get current student's submission
 */

const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const Assessment = require('../models/Assessment');
const Class      = require('../models/Class');
const User       = require('../models/User');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const AssessmentResult     = require('../models/AssessmentResult');
const { rbac }   = require('../src/middleware/rbac');
const { evaluateSubmission } = require('../utils/analytics/evaluator');
const { generateInsights }   = require('../utils/analytics/aiInsights');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── Helper: validate student is enrolled + assessment is published ──
async function validateStudentAccess(assessmentId, studentId) {
    if (!isValidId(assessmentId)) {
        return { error: 400, message: 'Invalid assessment ID' };
    }

    const assessment = await Assessment.findById(assessmentId)
        .populate('teacherId', 'name email')
        .populate('classId', 'name subject section students');

    if (!assessment) {
        return { error: 404, message: 'Assessment not found' };
    }
    if (!assessment.isPublished) {
        return { error: 403, message: 'This assessment is not published' };
    }

    // Check student is enrolled in the assessment's class
    const classDoc = assessment.classId;
    const isEnrolled = classDoc.students.some(sid => sid.toString() === studentId.toString());
    if (!isEnrolled) {
        return { error: 403, message: 'You are not enrolled in this classroom' };
    }

    return { assessment, classDoc };
}

// ── POST /submissions/:assessmentId/start ─────────────────────
// Creates an 'in_progress' submission if one doesn't exist yet.
// Returns the submission + assessment questions.
router.post('/:assessmentId/start', rbac('STUDENT'), async (req, res, next) => {
    const studentId = req.user.id;
    const { assessmentId } = req.params;
    try {
        const access = await validateStudentAccess(assessmentId, studentId);
        if (access.error) {
            return res.status(access.error).json({ success: false, message: access.message });
        }
        const { assessment, classDoc } = access;

        // Block if assessment window is not active
        if (assessment.status !== 'Active') {
            return res.status(403).json({
                success: false,
                message: assessment.status === 'Upcoming'
                    ? 'This assessment has not started yet'
                    : 'This assessment window has closed'
            });
        }

        // Check for existing submitted attempt
        const existing = await AssessmentSubmission.findOne({ assessmentId, studentId });
        if (existing) {
            if (existing.status === 'submitted' || existing.status === 'auto_submitted') {
                return res.status(409).json({
                    success: false,
                    message: 'You have already submitted this assessment'
                });
            }

            // BUG FIX: Resume path MUST also load and return the accessibility profile.
            // Previously this branch returned early without fetching the student profile,
            // causing accessibilityProfile to be undefined on the frontend.
            const resumeStudent = await User.findById(studentId).select('accessibilityProfile');
            const rawResumeProfile = resumeStudent?.accessibilityProfile?.toObject
                ? resumeStudent.accessibilityProfile.toObject()
                : (resumeStudent?.accessibilityProfile || {});

            const resumeProfile = {
                readingSupport:      rawResumeProfile.readingSupport      ?? false,
                writingSupport:      rawResumeProfile.writingSupport      ?? false,
                numberSupport:       rawResumeProfile.numberSupport       ?? false,
                textToSpeech:        rawResumeProfile.textToSpeech        ?? false,
                speechToText:        rawResumeProfile.speechToText        ?? false,
                simplifiedReading:   rawResumeProfile.simplifiedReading   ?? false,
                keywordHighlighting: rawResumeProfile.keywordHighlighting ?? false,
                visualMathAids:      rawResumeProfile.visualMathAids      ?? false,
                stepByStepHints:     rawResumeProfile.stepByStepHints     ?? false,
                largeText:           rawResumeProfile.largeText           ?? false,
                highContrast:        rawResumeProfile.highContrast        ?? false
            };

            return res.json({
                success: true,
                message: 'Resuming existing attempt',
                submission: existing,
                assessment: {
                    _id:          assessment._id,
                    title:        assessment.title,
                    subject:      assessment.subject,
                    duration:     assessment.duration,
                    questions:    assessment.questions,
                    startTime:    assessment.startTime,
                    endTime:      assessment.endTime,
                    scheduledDate: assessment.scheduledDate,
                    status:       assessment.status
                },
                accessibilityProfile: resumeProfile
            });
        }

        // Create new in_progress submission
        const submission = await AssessmentSubmission.create({
            assessmentId,
            studentId,
            classId:   classDoc._id,
            answers:   [],
            startedAt: new Date(),
            status:    'in_progress'
        });

        // Load student's accessibility profile — serialize to plain object.
        // .toObject() is required because Mongoose subdocuments are proxy objects;
        // spreading a raw subdocument can silently produce an empty result.
        const student = await User.findById(studentId).select('accessibilityProfile');
        const rawProfile = student?.accessibilityProfile?.toObject
            ? student.accessibilityProfile.toObject()
            : (student?.accessibilityProfile || {});

        // Merge with explicit defaults so the frontend always receives
        // a fully-populated object, even for students whose profile was
        // never explicitly saved (Mongoose may return {} for untouched subdocs).
        const accessibilityProfile = {
            readingSupport:      rawProfile.readingSupport      ?? false,
            writingSupport:      rawProfile.writingSupport      ?? false,
            numberSupport:       rawProfile.numberSupport       ?? false,
            textToSpeech:        rawProfile.textToSpeech        ?? false,
            speechToText:        rawProfile.speechToText        ?? false,
            simplifiedReading:   rawProfile.simplifiedReading   ?? false,
            keywordHighlighting: rawProfile.keywordHighlighting ?? false,
            visualMathAids:      rawProfile.visualMathAids      ?? false,
            stepByStepHints:     rawProfile.stepByStepHints     ?? false,
            largeText:           rawProfile.largeText           ?? false,
            highContrast:        rawProfile.highContrast        ?? false
        };

        res.status(201).json({
            success: true,
            message: 'Assessment started',
            submission,
            assessment: {
                _id:          assessment._id,
                title:        assessment.title,
                subject:      assessment.subject,
                duration:     assessment.duration,
                questions:    assessment.questions,
                startTime:    assessment.startTime,
                endTime:      assessment.endTime,
                scheduledDate: assessment.scheduledDate,
                status:       assessment.status
            },
            accessibilityProfile
        });
    } catch (err) {
        next(err);
    }
});

// ── POST /submissions/:assessmentId/save ──────────────────────
// Auto-saves current answers without submitting.
// Idempotent — safe to call repeatedly.
router.post('/:assessmentId/save', rbac('STUDENT'), async (req, res, next) => {
    const studentId = req.user.id;
    const { assessmentId } = req.params;
    try {
        if (!isValidId(assessmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
        }

        const { answers } = req.body; // [{ questionId, questionText, questionType, answer }]
        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'answers must be an array' });
        }

        // Only update an in_progress submission
        const submission = await AssessmentSubmission.findOne({ assessmentId, studentId });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'No active attempt found. Please start the assessment first.' });
        }
        if (submission.status !== 'in_progress') {
            return res.status(409).json({ success: false, message: 'This submission has already been finalized' });
        }

        // Sanitize and update answers
        submission.answers = answers
            .filter(a => a && isValidId(a.questionId))
            .map(a => ({
                questionId:   a.questionId,
                questionText: String(a.questionText || '').slice(0, 2000),
                questionType: String(a.questionType || 'mcq').slice(0, 50),
                answer:       String(a.answer || '').slice(0, 5000)
            }));

        await submission.save();

        res.json({ success: true, message: 'Answers saved', savedAt: new Date() });
    } catch (err) {
        next(err);
    }
});

// ── POST /submissions/:assessmentId/submit ────────────────────
// Finalizes the submission, then triggers async evaluation.
router.post('/:assessmentId/submit', rbac('STUDENT'), async (req, res, next) => {
    const studentId = req.user.id;
    const { assessmentId } = req.params;
    try {
        const access = await validateStudentAccess(assessmentId, studentId);
        if (access.error) {
            return res.status(access.error).json({ success: false, message: access.message });
        }
        const { assessment } = access;

        const { answers } = req.body;
        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'answers must be an array' });
        }

        // Find the in_progress submission
        let submission = await AssessmentSubmission.findOne({ assessmentId, studentId });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'No active attempt found' });
        }
        if (submission.status === 'submitted' || submission.status === 'auto_submitted') {
            return res.status(409).json({ success: false, message: 'You have already submitted this assessment' });
        }

        // Sanitize answers
        const sanitized = answers
            .filter(a => a && isValidId(a.questionId))
            .map(a => ({
                questionId:   a.questionId,
                questionText: String(a.questionText || '').slice(0, 2000),
                questionType: String(a.questionType || 'mcq').slice(0, 50),
                answer:       String(a.answer || '').slice(0, 5000)
            }));

        submission.answers     = sanitized;
        submission.submittedAt = new Date();
        submission.status      = 'submitted';
        await submission.save();

        // ── Respond immediately — don't make student wait for AI ──
        res.json({
            success: true,
            message: 'Assessment submitted successfully',
            submissionId: submission._id,
            submittedAt: submission.submittedAt,
            totalAnswered: sanitized.filter(a => a.answer.trim() !== '').length,
            totalQuestions: assessment.questions.length
        });

        // ── Trigger evaluation asynchronously ────────────────────
        // Fire-and-forget — runs after response is sent
        setImmediate(async () => {
            try {
                // Skip if already evaluated
                const existing = await AssessmentResult.findOne({ submissionId: submission._id });
                if (existing) return;

                // Load student for accessibility profile
                const student = await User.findById(studentId).select('name accessibilityProfile');
                const rawProfile = student?.accessibilityProfile?.toObject
                    ? student.accessibilityProfile.toObject()
                    : (student?.accessibilityProfile || {});

                // Evaluate
                const evalData = await evaluateSubmission(assessment, submission, rawProfile);

                // Generate AI insights
                const insights = await generateInsights(
                    evalData,
                    student?.name || 'Student',
                    assessment.subject || 'General'
                );

                evalData.aiInsights     = insights;
                evalData.strengths      = insights.strengths;
                evalData.weaknesses     = insights.weaknesses;
                evalData.recommendations = insights.recommendations;

                // Save result
                await AssessmentResult.create(evalData);
            } catch (evalErr) {
                // Never crash the server — log only
                try {
                    const logger = require('../src/utils/logger');
                    logger.error('Async evaluation failed', { category: 'analytics', error: evalErr.message, assessmentId, studentId });
                } catch { /* silent */ }
            }
        });

    } catch (err) {
        next(err);
    }
});

// ── GET /submissions/:assessmentId/me ─────────────────────────
// Returns the current student's submission for an assessment.
router.get('/:assessmentId/me', rbac('STUDENT'), async (req, res, next) => {
    const studentId = req.user.id;
    const { assessmentId } = req.params;
    try {
        if (!isValidId(assessmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
        }

        const submission = await AssessmentSubmission.findOne({ assessmentId, studentId });
        if (!submission) {
            return res.json({ success: true, submission: null });
        }

        res.json({ success: true, submission });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
