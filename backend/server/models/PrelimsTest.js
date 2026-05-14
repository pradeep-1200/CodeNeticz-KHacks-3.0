const mongoose = require('mongoose');

const prelimsTestSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['text', 'mcq', 'math', 'audio'], default: 'text' },
    options: [String], // for mcq
    correctAnswer: { type: String, required: true },
    disabilityMarker: { type: String, enum: ['DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'DEFAULT'], default: 'DEFAULT' },
}, { timestamps: true });

module.exports = mongoose.model('PrelimsTest', prelimsTestSchema);
