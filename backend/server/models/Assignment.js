const mongoose = require('mongoose');

// FIX: added timestamps: true so createdAt is available for sorting
const AssignmentSchema = new mongoose.Schema({
    classId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'Class',
        required: true
    },
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    deadline:    { type: Date, default: null },
    toolsAllowed: {
        dyslexia:    { type: Boolean, default: true },
        dyscalculia: { type: Boolean, default: true }
    },
    questions: [{
        type:          { type: String, enum: ['text', 'multiple_choice', 'voice'], required: true },
        questionText:  { type: String, required: true },
        options:       [String],
        correctAnswer: { type: String, default: '' }
    }],
    submissions: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  'User'
        },
        content:     { type: String, default: '' },
        attachment:  { type: String, default: '' },
        submittedAt: { type: Date, default: Date.now },
        status: {
            type:    String,
            enum:    ['turned_in', 'late', 'graded'],
            default: 'turned_in'
        },
        feedback: { type: String, default: '' },
        grade:    { type: Number, default: null }
    }]
}, { timestamps: true });   // FIX: removed manual createdAt field, use timestamps instead

module.exports = mongoose.model('Assignment', AssignmentSchema);
