'use strict';

/**
 * AssessmentSubmission Model — Phase 4
 *
 * Stores each student's attempt for a given assessment.
 * Scores are NOT calculated here — grading is Phase 5.
 * One document = one student's attempt for one assessment.
 */

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId:  { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText:{ type: String, default: '' },
    questionType:{ type: String, default: 'mcq' },
    answer:      { type: String, default: '' }   // student's response (raw text or selected option)
}, { _id: false });

const submissionSchema = new mongoose.Schema({
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

    // The student's answers — keyed by questionId
    answers: [answerSchema],

    // Timing
    startedAt:   { type: Date, default: null },
    submittedAt: { type: Date, default: null },

    // Status — 'in_progress' | 'submitted' | 'auto_submitted'
    status: {
        type: String,
        enum: ['in_progress', 'submitted', 'auto_submitted'],
        default: 'in_progress'
    }

    // NOTE: score / grading fields are intentionally omitted — Phase 5
}, { timestamps: true });

// Compound index — prevents duplicate submissions per student per assessment
submissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentSubmission', submissionSchema);
