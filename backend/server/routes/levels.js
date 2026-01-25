const express = require('express');
const router = express.Router();
const Level = require('../models/Level');

// GET all levels (for dashboard/list)
router.get('/', async (req, res) => {
    try {
        const levels = await Level.find().sort({ createdAt: -1 });
        res.json({ success: true, levels });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single level by ID (for playing)
router.get('/:id', async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: "Level not found" });
        res.json({ success: true, level });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create new level (Teacher only - mostly)
router.post('/', async (req, res) => {
    const { title, description, difficulty, tasks, xpReward } = req.body;
    try {
        const newLevel = new Level({
            title,
            description,
            difficulty,
            tasks,
            xpReward: xpReward || 500,
            // createdBy: req.user.id // Middleware logic would go here
        });
        await newLevel.save();
        res.status(201).json({ success: true, level: newLevel });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE level
router.delete('/:id', async (req, res) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Level deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
