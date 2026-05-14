const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DashboardStats = require('../models/DashboardStats');
const Activity = require('../models/Activity');
const Material = require('../models/Material');
const Report = require('../models/Report');
const Assessment = require('../models/Assessment');
const DailyTip = require('../models/DailyTip');
const Class = require('../models/Class');
const Invitation = require('../models/Invitation');

// Helper to get demo user
const getDemoUser = async () => {
    // Return the LATEST user (the one who just registered)
    return await User.findOne().sort({ _id: -1 });
};

// Dashboard Data
router.get('/dashboard', async (req, res) => {
    try {
        let user = await getDemoUser();

        if (!user) {
            return res.json({
                profile: {
                    id: "demo_id",
                    name: "Demo Student",
                    email: "demo@example.com",
                    level: 1,
                    levelTitle: "Beginner",
                    xp: 0,
                    streak: 0,
                    xpToNextLevel: 1000
                },
                stats: {
                    activeClasses: { count: 0, newMaterial: 0 },
                    pendingInvites: { count: 0, actionRequired: false },
                    weeklyGoal: { progress: 0, status: 'Not Started' }
                },
                recentActivity: [],
                dailyTip: null
            });
        }

        // Helper: Real-time counts
        const classCount = await Class.countDocuments({ students: user._id });
        const inviteCount = await Invitation.countDocuments({ studentId: user._id, status: 'pending' });

        const activeClasses = await Class.find({ students: user._id })
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 })
            .limit(3);

        const pendingInvites = await Invitation.find({ studentId: user._id, status: 'pending' })
            .populate('classId', 'name subject section')
            .populate('teacherId', 'name')
            .limit(3);

        // const stats = await DashboardStats.findOne({ userId: user._id }); // Deprecated in favor of real-time
        const recentActivity = await Activity.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
        const dailyTip = await DailyTip.findOne();

        // Construct dynamic stats
        const stats = {
            activeClasses: {
                count: classCount,
                newMaterial: 0 // logic for new material could be added later
            },
            pendingInvites: {
                count: inviteCount,
                actionRequired: inviteCount > 0
            },
            weeklyGoal: {
                progress: Math.min(100, Math.floor((user.xp % 1000) / 10)), // Mock goal based on XP progress
                status: 'On Track'
            }
        };

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
            activeClassesList: activeClasses,
            pendingInvitesList: pendingInvites,
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

// const db = require('../data/db'); // Removed mock data
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
                improvementData: [],
                skillData: [],
                strengths: [],
                areasToExplore: [],
                beforeStats: [],
                afterStats: [],
                submissionHistory: [],
                problemStats: { easy: { solved: 0 }, medium: { solved: 0 }, hard: { solved: 0 }, total: { solved: 0 } }
            });
            // Re-fetch to populate
            report = await Report.findById(report._id).populate('userId', 'name email level levelTitle streak');
        }

        if (!report) {
            // Absolute last resort fallback with NO mock data
            report = {
                userId: {
                    name: "Unknown Student",
                    levelTitle: "Beginner",
                    streak: 0,
                    email: "student@example.com"
                },
                improvementData: [],
                skillData: [],
                strengths: [],
                areasToExplore: [],
                beforeStats: [],
                afterStats: [],
                submissionHistory: [],
                problemStats: { easy: { solved: 0 }, medium: { solved: 0 }, hard: { solved: 0 }, total: { solved: 0 } }
            };
        }

        res.json(report);
    } catch (err) {
        console.error(err);
        res.json({
            userId: { name: "Error User", levelTitle: "Beginner" },
            improvementData: [],
            skillData: [],
            strengths: [],
            areasToExplore: [],
            beforeStats: [],
            afterStats: [],
            submissionHistory: [],
            problemStats: { easy: { solved: 0 }, medium: { solved: 0 }, hard: { solved: 0 }, total: { solved: 0 } }
        });
    }
});

// Update Progress
router.post('/complete-activity', async (req, res) => {
    try {
        let user = await getDemoUser();
        // If mocked, we can't save to DB easily without user, but let's assume valid user
        if (!user) return res.status(400).json({ success: false, message: "No active user found" });

        const { type, difficulty, accuracy } = req.body; // type: 'assessment', 'material'

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
                // Use provided accuracy or fallback to small increase
                const accValue = accuracy !== undefined ? accuracy : (report.afterStats[1].value + 3);
                
                report.afterStats[0].value = Math.min(100, report.afterStats[0].value + 5); // Speed
                report.afterStats[1].value = Math.min(100, accValue); // Accuracy
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
