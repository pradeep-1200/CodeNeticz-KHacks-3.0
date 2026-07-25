const mongoose = require('mongoose');

// ─── Virtual for XP to next level ───────────────────────────
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  // P1 FIX: renamed from 'password' to 'passwordHash' — stores Argon2 hash, never plain-text
  passwordHash: { type: String, required: true },

  // Role — uppercase enums, set by email domain on registration
  role: { type: String, enum: ['STUDENT', 'TEACHER', 'ADMIN'], default: 'STUDENT' },
  isActive: { type: Boolean, default: true },

  // Gamification
  level:        { type: Number, default: 1 },
  levelTitle:   { type: String, default: 'Beginner' },
  xp:           { type: Number, default: 0 },
  nextLevelXp:  { type: Number, default: 1000 },
  streak:       { type: Number, default: 0 },
  badges:       [String],

  // P2 — Prelims adaptive onboarding
  learningProfile: {
    type: String,
    enum: ['DEFAULT', 'DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'READING_SUPPORT', 'NUMBER_SUPPORT', 'VOICE_INPUT', 'FOCUS'],
    default: 'DEFAULT'
  },
  isPrelimsCompleted: { type: Boolean, default: false },
  prelimsScore:       { type: Number, default: 0 }

}, { timestamps: true });

// Virtual — computed field (not stored)
userSchema.virtual('xpToNextLevel').get(function () {
  return (this.nextLevelXp || 1000) - (this.xp || 0);
});

userSchema.set('toJSON',   { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
