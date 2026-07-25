'use strict';

/**
 * Analytics Routes — Phase 8
 * Mounted at: /api/analytics  and  /api/v1/analytics
 *
 * Student routes (STUDENT role):
 *   GET  /analytics/my-result/:assessmentId     — student's own result
 *   GET  /analytics/my-history                  — student's assessment history
 *
 * Teacher routes (TEACHER role):
 *   GET  /analytics/assessment/:assessmentId    — full class results for one assessment
 *   GET  /analytics/class/:classId              — all assessments analytics for a class
 *   GET  /analytics/student/:studentId/result/:assessmentId — teacher views student result
 */

const express          = require('express');
const router           = express.Router();
const mongoose         = require('mongoose');
const { rbac }         = require('../src/middleware/rbac');
const AssessmentResult = require('../models/AssessmentResult');
const Assessment       = require('../models/Assessment');
const Class            = require('../models/Class');
const User             = require('../models/User');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const { evaluateSubmission } = require('../utils/analytics/evaluator');
const { generateInsights }   = require('../utils/analytics/aiInsights');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET /analytics/my-result/:assessmentId ─────────────────────
// Student retrieves their own result. Polls until ready (max 60s).
router.get('/my-result/:assessmentId', rbac('STUDENT'), async (req, res, next) => {
    const studentId   = req.user.id;
    const { assessmentId } = req.params;
    try {
        if (!isValidId(assessmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
        }

        // Security: student can only see their own result
        let result = await AssessmentResult.findOne({ assessmentId, studentId })
            .populate('assessmentId', 'title subject duration questions')
            .lean();

        if (!result) {
            // Evaluation may still be processing — check for submitted submission
            const submission = await AssessmentSubmission.findOne({ assessmentId, studentId, status: { $in: ['submitted', 'auto_submitted'] } });
            if (!submission) {
                return res.status(404).json({ success: false, message: 'No submitted attempt found for this assessment.' });
            }

            // Trigger evaluation now (synchronous fallback)
            const assessment = await Assessment.findById(assessmentId);
            if (!assessment) {
                return res.status(404).json({ success: false, message: 'Assessment not found.' });
            }

            const student    = await User.findById(studentId).select('name accessibilityProfile');
            const rawProfile = student?.accessibilityProfile?.toObject
                ? student.accessibilityProfile.toObject()
                : (student?.accessibilityProfile || {});

            const evalData = await evaluateSubmission(assessment, submission, rawProfile);
            const insights = await generateInsights(evalData, student?.name, assessment.subject);

            evalData.aiInsights      = insights;
            evalData.strengths       = insights.strengths;
            evalData.weaknesses      = insights.weaknesses;
            evalData.recommendations = insights.recommendations;

            try {
                result = await AssessmentResult.create(evalData);
                result = await AssessmentResult.findById(result._id)
                    .populate('assessmentId', 'title subject duration questions')
                    .lean();
            } catch (dupErr) {
                // Race condition: another process created it — just fetch
                if (dupErr.code === 11000) {
                    result = await AssessmentResult.findOne({ assessmentId, studentId })
                        .populate('assessmentId', 'title subject duration questions')
                        .lean();
                } else {
                    throw dupErr;
                }
            }
        }

        if (!result) {
            return res.status(202).json({ success: false, message: 'Your result is being processed. Please try again in a moment.' });
        }

        res.json({ success: true, result });
    } catch (err) {
        next(err);
    }
});

// ── GET /analytics/my-history ──────────────────────────────────
// Student's complete assessment history with scores
router.get('/my-history', rbac('STUDENT'), async (req, res, next) => {
    const studentId = req.user.id;
    try {
        const results = await AssessmentResult.find({ studentId })
            .populate('assessmentId', 'title subject duration scheduledDate')
            .sort({ completedAt: -1 })
            .lean();

        res.json({ success: true, results });
    } catch (err) {
        next(err);
    }
});

// ── GET /analytics/assessment/:assessmentId ────────────────────
// Teacher: full class analytics for one assessment
router.get('/assessment/:assessmentId', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId = req.user.id;
    const { assessmentId } = req.params;
    try {
        if (!isValidId(assessmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid assessment ID' });
        }

        // Verify teacher owns this assessment
        const assessment = await Assessment.findById(assessmentId)
            .populate('classId', 'name subject students');
        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }
        if (String(assessment.teacherId) !== teacherId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const results = await AssessmentResult.find({ assessmentId })
            .populate('studentId', 'name email rollNumber')
            .sort({ percentage: -1 })
            .lean();

        // ── Compute class-level stats ──────────────────────────
        const scores       = results.map(r => r.percentage);
        const avgScore     = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore  = scores.length > 0 ? Math.min(...scores) : 0;
        const passCount    = scores.filter(s => s >= 50).length;
        const passPercent  = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;
        const avgTimeMin   = results.length > 0
            ? Math.round(results.reduce((a, r) => a + (r.timeTakenSeconds || 0), 0) / results.length / 60)
            : 0;

        // ── Question analytics (aggregated across all students) ──
        const questionStatsMap = {};
        for (const question of assessment.questions) {
            questionStatsMap[String(question._id)] = {
                questionId:      question._id,
                questionText:    question.question,
                difficulty:      question.difficulty,
                correctCount:    0,
                incorrectCount:  0,
                totalAttempts:   0,
                avgTime:         0
            };
        }
        for (const result of results) {
            for (const qa of (result.questionAnalysis || [])) {
                const qId = String(qa.questionId);
                if (questionStatsMap[qId]) {
                    questionStatsMap[qId].totalAttempts++;
                    if (qa.isCorrect) questionStatsMap[qId].correctCount++;
                    else questionStatsMap[qId].incorrectCount++;
                }
            }
        }
        const questionStats = Object.values(questionStatsMap).map(qs => ({
            ...qs,
            accuracy: qs.totalAttempts > 0 ? Math.round((qs.correctCount / qs.totalAttempts) * 100) : 0
        })).sort((a, b) => a.accuracy - b.accuracy); // hardest first

        // ── Accessibility usage across class ──────────────────
        const a11yTotals = {
            textToSpeech: 0, speechToText: 0, highContrast: 0,
            largeText: 0, keywordHighlighting: 0, stepByStepHints: 0,
            visualMathAids: 0, numberSupport: 0
        };
        for (const result of results) {
            const au = result.accessibilityUsage || {};
            for (const key of Object.keys(a11yTotals)) {
                if (au[key]) a11yTotals[key]++;
            }
        }

        // ── Grade distribution ────────────────────────────────
        const gradeDist = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
        for (const r of results) gradeDist[r.grade] = (gradeDist[r.grade] || 0) + 1;

        res.json({
            success: true,
            assessment: {
                _id:       assessment._id,
                title:     assessment.title,
                subject:   assessment.subject,
                duration:  assessment.duration,
                classId:   assessment.classId
            },
            classStats: {
                totalStudents:    (assessment.classId?.students || []).length,
                attempted:        results.length,
                avgScore,
                highestScore,
                lowestScore,
                passPercent,
                avgTimeMin,
                gradeDist,
                accessibilityUsage: a11yTotals
            },
            questionStats,
            results // per-student summaries
        });
    } catch (err) {
        next(err);
    }
});

// ── GET /analytics/class/:classId ─────────────────────────────
// Teacher: overview of all assessments in a class
router.get('/class/:classId', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId = req.user.id;
    const { classId } = req.params;
    try {
        if (!isValidId(classId)) {
            return res.status(400).json({ success: false, message: 'Invalid class ID' });
        }

        const cls = await Class.findById(classId);
        if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
        if (String(cls.teacherId) !== teacherId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const assessments = await Assessment.find({ classId, isPublished: true })
            .sort({ scheduledDate: -1 })
            .lean();

        const assessmentSummaries = await Promise.all(assessments.map(async (a) => {
            const results = await AssessmentResult.find({ assessmentId: a._id }).lean();
            const scores  = results.map(r => r.percentage);
            return {
                assessmentId: a._id,
                title:        a.title,
                subject:      a.subject,
                scheduledDate: a.scheduledDate,
                attempted:    results.length,
                avgScore:     scores.length > 0 ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : null,
                highestScore: scores.length > 0 ? Math.max(...scores) : null,
                lowestScore:  scores.length > 0 ? Math.min(...scores) : null,
                passPercent:  scores.length > 0 ? Math.round((scores.filter(s => s >= 50).length / scores.length) * 100) : null
            };
        }));

        res.json({ success: true, class: cls, assessmentSummaries });
    } catch (err) {
        next(err);
    }
});

// ── GET /analytics/student/:studentId/result/:assessmentId ─────
// Teacher views a specific student's detailed result
router.get('/student/:studentId/result/:assessmentId', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const teacherId   = req.user.id;
    const { studentId, assessmentId } = req.params;
    try {
        if (!isValidId(studentId) || !isValidId(assessmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        // Security: teacher must own the assessment
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
        if (String(assessment.teacherId) !== teacherId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const result = await AssessmentResult.findOne({ assessmentId, studentId })
            .populate('studentId', 'name email rollNumber accessibilityProfile')
            .populate('assessmentId', 'title subject duration')
            .lean();

        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not available for this student yet.' });
        }

        res.json({ success: true, result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
