const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['quiz', 'jumbled', 'speech']
    },
    // We use a flexible 'props' object to store game-specific data
    // Quiz: { question, options[], correctAnswer, hint }
    // Jumbled: { sentence }
    // Speech: { promptText, expectedKeywords[] }
    props: { type: mongoose.Schema.Types.Mixed, required: true }
});

const levelSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    tags: [String], // e.g., "Grammar", "Math", "Science"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Teacher who created it
    isPublic: { type: Boolean, default: false }, // If sharing with other teachers
    tasks: [taskSchema],
    xpReward: { type: Number, default: 500 }
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);
