const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: false, // Optional for now if global bank
    },
    questions: [{
        questionText: String,
        options: [String],
        correctAnswer: String,
    }], // Simplified for now
    questionCount: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date,
    },
    type: {
        type: String,
        enum: ['Quiz', 'Exam', 'Homework'],
        default: 'Quiz'
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Scheduled', 'Completed'],
        default: 'Draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
