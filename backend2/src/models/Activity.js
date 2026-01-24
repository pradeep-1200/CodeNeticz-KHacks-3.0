const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String, // e.g., 'Exploration', 'Quiz', 'MaterialView'
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId, // ID of the quiz or material
        required: false
    },
    score: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Started', 'Completed', 'InProgress'],
        default: 'Started'
    },
    duration: {
        type: Number, // Seconds
        default: 0
    }
}, {
    timestamps: true,
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
