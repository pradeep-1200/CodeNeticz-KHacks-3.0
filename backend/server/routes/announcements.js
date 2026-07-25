'use strict';

const express      = require('express');
const router       = express.Router();
const Announcement = require('../models/Announcement');
const Class        = require('../models/Class');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { rbac }     = require('../src/middleware/rbac');

// GET announcements for a class (students + teacher can read)
router.get('/class/:classId', async (req, res, next) => {
    try {
        const announcements = await Announcement.find({ classId: req.params.classId })
            .populate('authorId', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (err) { next(err); }
});

// POST create announcement
// FIX 1: added rbac('TEACHER','ADMIN') — was open to any authenticated user
// FIX 2: req.user.name is never set by auth middleware — look up author name from DB
router.post('/create', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const { classId, content, attachments } = req.body;
    const authorId = req.user.id;
    try {
        if (!classId) {
            return res.status(400).json({ success: false, message: 'classId is required' });
        }
        if (!content?.trim()) {
            return res.status(400).json({ success: false, message: 'Announcement content is required' });
        }

        const announcement = new Announcement({
            classId,
            authorId,
            content:     content.trim(),
            attachments: attachments || []
        });
        await announcement.save();

        // Populate author before returning
        await announcement.populate('authorId', 'name email role');

        // Notify enrolled students
        const [cls, author] = await Promise.all([
            Class.findById(classId),
            User.findById(authorId).select('name')
        ]);

        if (cls && cls.students.length > 0) {
            const notifications = cls.students
                .filter(sid => sid.toString() !== authorId)
                .map(sid => ({
                    userId:  sid,
                    message: `${author?.name || 'Instructor'} posted a new announcement in ${cls.name}`,
                    type:    'announcement',
                    link:    '/student/classroom'
                }));
            if (notifications.length > 0) await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, announcement });
    } catch (err) { next(err); }
});

module.exports = router;
