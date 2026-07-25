const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET Notifications for the authenticated user
router.get('/', async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (err) {
        next(err);
    }
});

// GET Notifications for User
router.get('/:userId', async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.id !== req.params.userId) {
            return res.status(403).json({ success: false, message: 'You cannot access another user\'s notifications' });
        }
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (err) {
        next(err);
    }
});

// MARK single Notification Read
router.post('/mark-read', async (req, res, next) => {
    const { notificationId } = req.body;
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: req.user.id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, notification });
    } catch (err) {
        next(err);
    }
});

// MARK ALL Notifications Read
router.post('/mark-all-read', async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
