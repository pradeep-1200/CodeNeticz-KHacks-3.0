const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

// GET announcements for class
router.get('/class/:classId', async (req, res, next) => {
    try {
        const announcements = await Announcement.find({ classId: req.params.classId })
            .populate('authorId', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (err) {
        next(err);
    }
});

// CREATE announcement
router.post('/create', async (req, res, next) => {
    const { classId, content, attachments } = req.body;
    const authorId = req.user.id;
    try {
        if (!content?.trim()) {
            return res.status(400).json({ success: false, message: 'Announcement content is required' });
        }
        const announcement = new Announcement({
            classId,
            authorId,
            content: content.trim(),
            attachments: attachments || []
        });
        await announcement.save();

        // Populate author before returning
        await announcement.populate('authorId', 'name email role');

        // Notify class students if posted by teacher
        const cls = await Class.findById(classId);
        if (cls && cls.students.length > 0) {
            const notifications = cls.students
                .filter(sid => sid.toString() !== authorId)
                .map(sid => ({
                    userId: sid,
                    message: `${req.user.name || 'Instructor'} posted a new announcement in ${cls.name}`,
                    type: 'announcement',
                    link: `/student/classroom`
                }));
            if (notifications.length > 0) await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, announcement });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
