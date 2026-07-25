'use strict';

/**
 * AI Visual Learning Assistant Route — Phase 7
 * Mounted at: /api/ai/math-assistant  and  /api/v1/ai/math-assistant
 *
 * POST /ai/math-assistant
 *
 * Upgraded from Phase 6 rule-based engine to Gemini AI-powered
 * visual learning that returns structured JSON for dynamic rendering.
 *
 * Only called when the student's numberSupport = true.
 * The backend enforces this — if numberSupport is false the request is rejected.
 * Never reveals the correct answer. Returns structured visual learning guidance.
 */

const express  = require('express');
const router   = express.Router();
const { rbac } = require('../src/middleware/rbac');
const { generateVisualLearning } = require('../utils/mathAssistant/aiEngine');

// ── POST /ai/math-assistant ────────────────────────────────────
router.post('/math-assistant', rbac('STUDENT'), async (req, res, next) => {
    try {
        const {
            question,
            questionType,
            options,
            studentAnswer,
            accessibilityProfile
        } = req.body;

        // ── Validate input ────────────────────────────────────
        if (!question || typeof question !== 'string' || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        // ── Security: enforce numberSupport gate on backend ───
        // The frontend also hides the button, but the backend must
        // independently verify — never trust client-only checks.
        const profile = accessibilityProfile || {};
        if (!profile.numberSupport) {
            return res.status(403).json({
                success: false,
                message: 'Math assistant is not enabled for this student'
            });
        }

        // ── Run the AI visual learning engine ─────────────────
        const result = await generateVisualLearning({
            question:             question.trim().slice(0, 1000), // cap input length
            questionType:         questionType  || '',
            options:              Array.isArray(options) ? options : [],
            studentAnswer:        studentAnswer || '',
            accessibilityProfile: profile
        });

        // ── Non-math question ─────────────────────────────────
        if (!result.isMath) {
            return res.json({
                success: true,
                isMath:  false,
                message: 'This question does not appear to be a mathematics question.'
            });
        }

        res.json({
            success:          true,
            isMath:           true,
            concept:          result.concept,
            difficulty:       result.difficulty,
            visualization:    result.visualization,
            vizData:          result.vizData,        // rich data for exact rendering
            title:            result.title,
            steps:            result.steps,
            practiceQuestion: result.practiceQuestion,
            _source:          result._source || 'ai'
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
