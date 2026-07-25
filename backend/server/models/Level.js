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
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: false },
    tasks: [taskSchema],
    xpReward: { type: Number, default: 500 },

    // Phase 2 — Target support profile for adaptive level filtering
    targetProfile: {
        type: String,
        enum: ['DEFAULT', 'READING_SUPPORT', 'NUMBER_SUPPORT', 'VOICE_INPUT', 'FOCUS'],
        default: 'DEFAULT'
    },

    // Phase 2 — Level visibility type
    // 'general': shown to all students
    // 'support': auto-assigned only to students whose supportProfile matches targetProfile
    levelType: { type: String, enum: ['general', 'support'], default: 'general' },

    // Phase 2 — Ordering within difficulty tier for sequential unlocking
    order: { type: Number, default: 0 },

    // Phase 2 — XP multiplier; support levels use 1.2 to keep motivation balanced
    xpMultiplier: { type: Number, default: 1.0 }
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);
