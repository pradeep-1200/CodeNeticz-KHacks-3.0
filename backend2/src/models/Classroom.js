const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    joinCode: {
        type: String,
        required: true,
        unique: true,
    },
    joinLink: {
        type: String, // Full URL to join directly
    },
    description: {
        type: String,
    }
}, {
    timestamps: true,
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
