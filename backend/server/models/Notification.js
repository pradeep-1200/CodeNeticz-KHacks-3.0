const mongoose = require('mongoose');

// FIX: removed manual createdAt, using timestamps:true for consistent sorting
const NotificationSchema = new mongoose.Schema({
    userId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
        index:    true
    },
    message: { type: String, required: true },
    type: {
        type:    String,
        enum:    ['assignment', 'announcement', 'grade', 'info', 'invitation'],
        default: 'info'
    },
    link:  { type: String, default: '' },
    read:  { type: Boolean, default: false, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
