const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET Notifications for User
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// MARK Read
router.post('/mark-read', async (req, res) => {
    const { notificationId } = req.body;
    try {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
