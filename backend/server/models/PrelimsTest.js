const mongoose = require('mongoose');

const prelimsTestSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['text', 'mcq', 'math', 'audio'], default: 'text' },
    options: [String],
    correctAnswer: { type: String, required: true },
    // FIX: removed legacy uppercase values (DYSLEXIA, DYSCALCULIA, DYSGRAPHIA, DEFAULT)
    //      that were mixed with new hyphenated tags, causing pattern matching to silently fail.
    patternTag: {
        type: String,
        enum: ['reading-speed', 'logical', 'memory', 'attention', 'spatial', 'numerical', 'default'],
        default: 'default'
    },
    disabilityMarker: { type: String, default: 'DEFAULT' }
}, { timestamps: true });

module.exports = mongoose.model('PrelimsTest', prelimsTestSchema);
