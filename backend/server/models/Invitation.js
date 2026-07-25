const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    status:    { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    // FIX: expiresAt was missing — caused invite list to always return empty
    //      and allowed invitations to pile up forever without expiry.
    expiresAt: {
        type:    Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
    }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
