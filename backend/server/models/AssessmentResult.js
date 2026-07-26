'use strict';

/**
 * AssessmentResult — Phase 8
 *
 * Stores the evaluated result for one student's submission.
 * Created automatically after the student submits an assessment.
 * One document = one evaluated attempt.
 */

const mongoose = require('mongoose');

// ── Per-question analysis ──────────────────────────────────────
const questionAnalysisSchema = new mongoose.Schema({
    questionId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText:  { type: String, default: '' },
    questionType:  { type: String, default: 'mcq' },
    difficulty:    { type: String, enum: ['easy', 'medium', 'challenge'], default: 'easy' },
    concept:       { type: String, default: '' },          // extracted concept label
    studentAnswer: { type: String, default: '' },
    correctAnswer: { type: String, default: '' },
    isCorrect:     { type: Boolean, default: false },
    marksAwarded:  { type: Number, default: 0 },
    maxMarks:      { type: Number, default: 1 },
    aiFeedback:    { type: String, default: '' },          // for open-ended questions
    timeTaken:     { type: Number, default: 0 }            // seconds (reserved for future)
}, { _id: false });

// ── AI-generated learning insights ────────────────────────────
const aiInsightsSchema = new mongoose.Schema({
    overallFeedback:    { type: String, default: '' },
    strengths:          [String],
    weaknesses:         [String],
    recommendations:    [String],
    nextDifficulty:     { type: String, default: 'Easy' },
    generatedAt:        { type: Date, default: null }
}, { _id: false });

// ── Accessibility usage snapshot ──────────────────────────────
const accessibilityUsageSchema = new mongoose.Schema({
    textToSpeech:        { type: Boolean, default: false },
    speechToText:        { type: Boolean, default: false },
    highContrast:        { type: Boolean, default: false },
    largeText:           { type: Boolean, default: false },
    keywordHighlighting: { type: Boolean, default: false },
    stepByStepHints:     { type: Boolean, default: false },
    visualMathAids:      { type: Boolean, default: false },
    numberSupport:       { type: Boolean, default: false }
}, { _id: false });

// ── Main result schema ─────────────────────────────────────────
const assessmentResultSchema = new mongoose.Schema({
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentSubmission',
        required: true,
        unique: true
    },

    // ── Score fields ─────────────────────────────────────────
    totalMarks:    { type: Number, default: 0 },   // max possible
    obtainedMarks: { type: Number, default: 0 },   // student earned
    score:         { type: Number, default: 0 },   // alias for obtainedMarks
    percentage:    { type: Number, default: 0 },   // 0–100
    grade:         { type: String, default: 'F' }, // A+/A/B/C/D/F

    // ── Count fields ─────────────────────────────────────────
    totalQuestions:   { type: Number, default: 0 },
    correctAnswers:   { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    skippedAnswers:   { type: Number, default: 0 },

    // ── Time ─────────────────────────────────────────────────
    timeTakenSeconds: { type: Number, default: 0 },
    completedAt:      { type: Date, default: null },

    // ── Question-level analysis ───────────────────────────────
    questionAnalysis: [questionAnalysisSchema],

    // ── AI insights ───────────────────────────────────────────
    aiInsights: { type: aiInsightsSchema, default: () => ({}) },

    // ── Topic mastery ─────────────────────────────────────────
    strengths:       [String],   // concepts answered correctly
    weaknesses:      [String],   // concepts answered incorrectly
    recommendations: [String],   // AI-generated practice suggestions

    // ── Tool usage ────────────────────────────────────────────
    accessibilityUsage: { type: accessibilityUsageSchema, default: () => ({}) },
    aiTutorUsed:        { type: Boolean, default: false },
    hintsUsed:          { type: Number, default: 0 },

    // ── Evaluation status ─────────────────────────────────────
    evaluationStatus: {
        type: String,
        enum: ['pending', 'evaluated', 'partial'],
        default: 'pending'
    }

}, { timestamps: true });

// Compound index for teacher queries
assessmentResultSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });
assessmentResultSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
