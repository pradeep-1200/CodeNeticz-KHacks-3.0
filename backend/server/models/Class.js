const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    section: { type: String },
    subject: { type: String, required: true },
    code: { type: String, unique: true, required: true }, // Join Code
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Level' }] // Using Levels as assessments for now
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
