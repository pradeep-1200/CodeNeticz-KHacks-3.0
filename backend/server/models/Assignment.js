const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    deadline: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    toolsAllowed: {
        dyslexia: { type: Boolean, default: true },
        dyscalculia: { type: Boolean, default: true }
    },
    questions: [{
        type: { type: String, enum: ['text', 'multiple_choice', 'voice'], required: true },
        questionText: { type: String, required: true },
        options: [String], // for multiple_choice
        correctAnswer: String // optional, for auto-grading
    }],
    submissions: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,         // Text/voice answers
        attachmentUrl: String,   // Cloudinary secure URL for the uploaded file
        attachmentPublicId: String, // Cloudinary public_id (for deletion/management)
        attachmentName: String,  // Original filename shown to faculty
        submittedAt: Date,
        status: {
            type: String,
            enum: ['turned_in', 'late', 'graded'],
            default: 'turned_in'
        },
        feedback: String,
        grade: Number
    }]
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
