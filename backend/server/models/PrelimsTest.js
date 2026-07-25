const mongoose = require('mongoose');

const prelimsTestSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['text', 'mcq', 'math', 'audio'], default: 'text' },
    options: [String], // for mcq
    correctAnswer: { type: String, required: true },
    // B2 FIX: patternTag standardized for ethical support suggestions
    patternTag: {
        type: String,
        enum: ['reading-speed', 'logical', 'memory', 'attention', 'spatial', 'numerical', 'default', 'DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'DEFAULT'],
        default: 'default'
    },
    disabilityMarker: { type: String, default: 'DEFAULT' } // Backward-compatible fallback
}, { timestamps: true });

module.exports = mongoose.model('PrelimsTest', prelimsTestSchema);
