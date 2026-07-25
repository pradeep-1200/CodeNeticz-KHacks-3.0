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
  prelimsScore:       { type: Number, default: 0 },

  // ── Phase 1: Student Profile fields ──────────────────────
  rollNumber:   { type: String, trim: true, default: '' },
  department:   { type: String, trim: true, default: '' },
  year:         { type: String, trim: true, default: '' },
  section:      { type: String, trim: true, default: '' },
  classroomId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  phone:        { type: String, trim: true, default: '' },
  gender:       { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''], default: '' },
  dateOfBirth:  { type: Date, default: null },
  profileImage: { type: String, default: '' },   // Cloudinary URL
  joinedAt:     { type: Date, default: Date.now },
  // ── Phase 2: Accessibility Profile fields ─────────────────
  accessibilityProfile: {
    readingSupport:     { type: Boolean, default: false },
    writingSupport:     { type: Boolean, default: false },
    numberSupport:      { type: Boolean, default: false },
    textToSpeech:       { type: Boolean, default: false },
    speechToText:       { type: Boolean, default: false },
    simplifiedReading:  { type: Boolean, default: false },
    keywordHighlighting:{ type: Boolean, default: false },
    visualMathAids:     { type: Boolean, default: false },
    stepByStepHints:    { type: Boolean, default: false },
    largeText:          { type: Boolean, default: false },
    highContrast:       { type: Boolean, default: false }
  }

}, { timestamps: true });

// Virtual — computed field (not stored)
userSchema.virtual('xpToNextLevel').get(function () {
  return (this.nextLevelXp || 1000) - (this.xp || 0);
});

userSchema.set('toJSON',   { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
