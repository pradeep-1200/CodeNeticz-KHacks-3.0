const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Simple string for this demo
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    level: { type: Number, default: 1 },
    levelTitle: { type: String, default: 'Novice' },
    xp: { type: Number, default: 0 },
    nextLevelXp: { type: Number, default: 1000 },
    streak: { type: Number, default: 0 },
    badges: [String]
}, { timestamps: true });

// Virtual to calculate xpToNextLevel if needed, but the frontend expects it directly.
userSchema.virtual('xpToNextLevel').get(function () {
    return this.nextLevelXp - this.xp;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
