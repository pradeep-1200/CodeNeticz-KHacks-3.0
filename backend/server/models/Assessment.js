const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question:      { type: String, required: true },
    options:       [String],
    correctAnswer: { type: String, default: '' },
    type:          { type: String, enum: ['mcq', 'text', 'audio', 'multiple_choice', 'voice'], default: 'mcq' },
    difficulty:    { type: String, enum: ['easy', 'medium', 'challenge'], default: 'easy' },
    hint:          { type: String, default: '' }
}, { _id: true });

const assessmentSchema = new mongoose.Schema({
    title:         { type: String, required: true, trim: true },
    subject:       { type: String, default: '' },
    teacherId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    duration:      { type: Number, default: 30, min: 1 }, // in minutes
    scheduledDate: { type: Date, default: null },
    startTime:     { type: String, default: '' },
    endTime:       { type: String, default: '' },

    // Scheduling/workflow status — separate from publish state
    status:        { type: String, enum: ['Upcoming', 'Active', 'Completed', 'Missed'], default: 'Upcoming' },

    // Publish state — defaults false so teachers must explicitly publish
    isPublished:   { type: Boolean, default: false },
    publishedAt:   { type: Date, default: null },

    // Questions array (Phase 3 — required before publishing)
    questions:     [questionSchema],

    // Legacy single-question fields — preserved for backwards compatibility
    question:      { type: String, default: '' },
    options:       [String],
    correctAnswer: { type: String, default: '' },
    type:          { type: String, enum: ['mcq', 'text', 'audio', 'multiple_choice', 'voice'], default: 'mcq' },
    audioText:     { type: String, default: '' },
    difficulty:    { type: String, enum: ['easy', 'medium', 'challenge'], default: 'easy' },
    hint:          { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
