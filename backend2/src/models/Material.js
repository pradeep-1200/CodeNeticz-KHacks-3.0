const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['text', 'audio', 'video'],
        required: true,
    },
    content: {
        type: String, // Text content or URL
        required: true,
    },
    topic: {
        type: String,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    accessibility: {
        simplified: { type: Boolean, default: false },
        readAloud: { type: Boolean, default: false },
        highContrast: { type: Boolean, default: false }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
