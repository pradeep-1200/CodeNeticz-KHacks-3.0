const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    type: { type: String, default: 'mcq' }, // mcq, audio
    audioText: String, // for audio questions
    difficulty: { type: String, default: 'easy' },
    hint: String
});

module.exports = mongoose.model('Assessment', assessmentSchema);
