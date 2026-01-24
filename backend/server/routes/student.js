const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DashboardStats = require('../models/DashboardStats');
const Activity = require('../models/Activity');
const Material = require('../models/Material');
const Report = require('../models/Report');
const Assessment = require('../models/Assessment');
const DailyTip = require('../models/DailyTip');

// Helper to get demo user
const getDemoUser = async () => {
    return await User.findOne();
};

// Dashboard Data
router.get('/dashboard', async (req, res) => {
    try {
        const user = await getDemoUser();
        if (!user) return res.status(404).json({ message: "User not found" });

        const stats = await DashboardStats.findOne({ userId: user._id });
        const recentActivity = await Activity.find({ userId: user._id });
        const dailyTip = await DailyTip.findOne();

        // Format profile to match frontend expectation
        const profile = {
            id: user._id,
            name: user.name,
            email: user.email,
            level: user.level,
            levelTitle: user.levelTitle,
            xpToNextLevel: user.xpToNextLevel, // Virtual
            xp: user.xp,
            streak: user.streak
        };

        res.json({
            profile,
            stats,
            recentActivity,
            dailyTip
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Classroom Data
router.get('/classroom', async (req, res) => {
    try {
        const materials = await Material.find();
        res.json({ materials });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// Report Data
router.get('/report', async (req, res) => {
    try {
        const user = await getDemoUser();
        const report = await Report.findOne({ userId: user._id });
        res.json(report);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// Assessment Data
router.get('/assessment', async (req, res) => {
    try {
        const questions = await Assessment.find();
        res.json(questions);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
