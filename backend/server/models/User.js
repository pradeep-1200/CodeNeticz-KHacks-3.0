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
  streak:          { type: Number, default: 0 },
  lastStreakDate:   { type: String, default: null }, // ISO date string 'YYYY-MM-DD'
  badges:          [String],
  completedLevels: [{ type: String }],


  // P2 — Prelims adaptive onboarding
  learningProfile: {
    type: String,
    enum: ['DEFAULT', 'DYSLEXIA', 'DYSCALCULIA', 'DYSGRAPHIA', 'READING_SUPPORT', 'NUMBER_SUPPORT', 'VOICE_INPUT', 'FOCUS'],
    default: 'DEFAULT'
  },
  isPrelimsCompleted: { type: Boolean, default: false },
  prelimsScore:       { type: Number, default: 0 },

  // Phase 1 — Per-domain support-profile vector
  // Each band: 'none' (≥80%), 'mild' (50–79%), 'full' (<50%)
  supportProfile: {
    reading: { type: String, enum: ['none', 'mild', 'full'], default: 'none' },
    writing:  { type: String, enum: ['none', 'mild', 'full'], default: 'none' },
    math:     { type: String, enum: ['none', 'mild', 'full'], default: 'none' }
  },

  // Phase 1 — Accessibility preferences set during prelims preference questions
  accessibilityPrefs: {
    fontSize:  { type: String, enum: ['normal', 'large'], default: 'normal' },
    contrast:  { type: String, enum: ['normal', 'high'],  default: 'normal' },
    readAloud: { type: Boolean, default: false }
  }

}, { timestamps: true });

// Virtual — computed field (not stored)
userSchema.virtual('xpToNextLevel').get(function () {
  return (this.nextLevelXp || 1000) - (this.xp || 0);
});

userSchema.set('toJSON',   { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
