const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isTeacher: {
        type: Boolean,
        default: false,
    },
    replies: [{
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;
