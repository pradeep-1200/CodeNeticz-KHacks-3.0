const mongoose = require('mongoose');

const prelimsTestSchema = new mongoose.Schema({
    question: { type: String, required: true },

    // Domain: which cognitive area this question assesses
    domain: {
        type: String,
        enum: ['reading', 'writing', 'math', 'preference'],
        required: true,
        default: 'reading'
    },

    // For reading domain: optional passage displayed above the question
    passage: { type: String, default: null },

    // Question type — extended to include prelims-specific 'sequence' type
    type: {
        type: String,
        enum: ['text', 'mcq', 'math', 'audio', 'sequence'],
        default: 'mcq'
    },

    // For mcq type
    options: [String],

    // Correct answer (not sent to client on GET /questions)
    correctAnswer: { type: String, required: true },

    // For 'sequence' type — words/sentences in the correct order
    // The system will shuffle these for the student
    sequenceItems: [String],

    // Preference questions are not graded (domain: 'preference' + isUngraded: true)
    isUngraded: { type: Boolean, default: false },

    // Pattern tag for support suggestion logic (backward compat)
    patternTag: {
        type: String,
        enum: ['reading-speed', 'logical', 'memory', 'attention', 'spatial', 'numerical', 'default', 'DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'DEFAULT'],
        default: 'default'
    },

    // Question ordering within its domain
    orderInDomain: { type: Number, default: 0 },

    disabilityMarker: { type: String, default: 'DEFAULT' } // Backward-compatible fallback
}, { timestamps: true });

module.exports = mongoose.model('PrelimsTest', prelimsTestSchema);
