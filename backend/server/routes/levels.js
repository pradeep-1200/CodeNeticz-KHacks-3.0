'use strict';

const express  = require('express');
const router   = express.Router();
const Level    = require('../models/Level');
const { rbac } = require('../src/middleware/rbac');

// GET all levels (student + teacher)
router.get('/', async (req, res, next) => {
    try {
        const levels = await Level.find().sort({ createdAt: -1 });
        res.json({ success: true, levels });
    } catch (err) { next(err); }
});

// GET single level by ID
router.get('/:id', async (req, res, next) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
        res.json({ success: true, level });
    } catch (err) { next(err); }
});

// POST create new level — TEACHER only
// FIX: added rbac('TEACHER', 'ADMIN') — was unprotected, any student could create levels
router.post('/', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    const { title, description, difficulty, targetProfile, tasks, xpReward } = req.body;
    try {
        if (!title?.trim()) {
            return res.status(400).json({ success: false, message: 'Level title is required' });
        }
        if (!Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one task is required' });
        }
        const newLevel = new Level({
            title:       title.trim(),
            description: description || '',
            difficulty:  difficulty  || 'easy',
            targetProfile,
            tasks,
            xpReward:    xpReward || 500,
            createdBy:   req.user.id
        });
        await newLevel.save();
        res.status(201).json({ success: true, level: newLevel });
    } catch (err) { next(err); }
});

// DELETE level — TEACHER only
// FIX: added rbac — was unprotected
router.delete('/:id', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Level deleted' });
    } catch (err) { next(err); }
});

module.exports = router;
