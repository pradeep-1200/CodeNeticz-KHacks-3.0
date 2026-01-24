const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    classroom: {
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
        enum: ['text', 'link'],
        required: true,
    },
    content: {
        type: String, // Can be the text content or the URL
        required: true,
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
