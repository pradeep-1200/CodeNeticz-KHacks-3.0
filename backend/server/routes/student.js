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
    // Return the LATEST user (the one who just registered)
    return await User.findOne().sort({ _id: -1 });
};

// Dashboard Data
router.get('/dashboard', async (req, res) => {
    try {
        let user = await getDemoUser();

        // Fallback for Demo
        if (!user) {
            const mockProfile = db.studentProfile;
            return res.json({
                profile: {
                    id: "demo_id",
                    name: mockProfile.name,
                    email: mockProfile.email,
                    level: mockProfile.level,
                    levelTitle: mockProfile.levelTitle,
                    xp: mockProfile.xp,
                    streak: mockProfile.streak, // Now 0
                    xpToNextLevel: mockProfile.nextLevelXp - mockProfile.xp
                },
                stats: db.dashboardStats,
                recentActivity: db.recentActivity,
                dailyTip: db.dailyTip
            });
        }

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

const db = require('../data/db'); // Fallback data

// Report Data
router.get('/report', async (req, res) => {
    try {
        let user = await getDemoUser();
        let report = null;

        if (user) {
            report = await Report.findOne({ userId: user._id }).populate('userId', 'name email level levelTitle streak');
        }

        if (user && !report) {
            // Create a fresh report for this user if one doesn't exist
            report = await Report.create({
                userId: user._id,
                improvementData: db.reports.improvementData,
                skillData: db.reports.skillData,
                strengths: db.reports.strengths,
                areasToExplore: db.reports.areasToExplore,
                beforeStats: db.reports.beforeStats,
                afterStats: db.reports.afterStats,
                submissionHistory: [],
                problemStats: { ...db.reports.problemStats }
            });
            // Re-fetch to populate
            report = await Report.findById(report._id).populate('userId', 'name email level levelTitle streak');
        }

        if (!report) {
            // Absolute last resort fallback
            report = {
                userId: {
                    name: "Student",
                    levelTitle: "Beginner",
                    streak: 0,
                    email: "student@example.com"
                },
                ...db.reports
            };
        }

        res.json(report);
    } catch (err) {
        console.error(err);
        // Serve fallback on error too
        res.json({
            userId: { name: "Fallback User", levelTitle: "Beginner" },
            ...db.reports
        });
    }
});

// Update Progress
router.post('/complete-activity', async (req, res) => {
    try {
        let user = await getDemoUser();
        // If mocked, we can't save to DB easily without user, but let's assume valid user
        if (!user) return res.status(400).json({ success: false, message: "No active user found" });

        const { type, difficulty } = req.body; // type: 'assessment', 'material'

        // 1. Update Streak
        user.streak += 1;
        user.xp += 50;
        await user.save();

        // 2. Update Report Graph Data
        let report = await Report.findOne({ userId: user._id });
        if (report) {
            // Add to submission history
            const today = new Date().toISOString().split('T')[0];
            const existingEntry = report.submissionHistory.find(e => e.date === today);
            if (existingEntry) {
                existingEntry.count += 1;
            } else {
                report.submissionHistory.push({ date: today, count: 1 });
            }

            // Update Problem Stats if it's an assessment
            if (type === 'assessment' && difficulty) {
                const diffKey = difficulty.toLowerCase(); // easy, medium, hard
                if (report.problemStats && report.problemStats[diffKey]) {
                    report.problemStats[diffKey].solved += 1;
                    report.problemStats.total.solved += 1;
                }
            }

            // Simulate "After Support" improvement
            if (report.afterStats && report.afterStats.length > 0) {
                // Slowly increase values
                report.afterStats[0].value = Math.min(100, report.afterStats[0].value + 5); // Speed
                report.afterStats[1].value = Math.min(100, report.afterStats[1].value + 3); // Accuracy
                report.afterStats[2].value = Math.min(100, report.afterStats[2].value + 5); // Confidence
            }

            // Update Improvement Score (Dot Chart Data)
            if (report.improvementData) {
                report.improvementData.forEach(item => {
                    // Randomly increment subject scores slightly to show progress
                    if (item.score < 100) item.score = Math.min(100, item.score + Math.floor(Math.random() * 5) + 1);
                });
            }

            await report.save();
        }

        res.json({ success: true, newStreak: user.streak, newXp: user.xp });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
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
