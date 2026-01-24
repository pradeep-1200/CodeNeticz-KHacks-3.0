const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
    const { email, password, type } = req.body;
    try {
        // In a real app, hash passwords. Here we compare plain text as per demo requirements/simplicity
        const user = await User.findOne({ email });

        if (user && user.password === password) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: "mock-jwt-token-12345"
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const Report = require('../models/Report');
const DashboardStats = require('../models/DashboardStats');
const db = require('../data/db');

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        user = new User({
            name,
            email,
            password,
            role: role || 'student'
        });

        await user.save();

        // Initialize Report for the new user
        await Report.create({
            userId: user._id,
            improvementData: db.reports.improvementData, // Initial empty/baseline data
            skillData: db.reports.skillData,
            strengths: db.reports.strengths,
            areasToExplore: db.reports.areasToExplore,
            beforeStats: db.reports.beforeStats,
            afterStats: db.reports.afterStats,
            submissionHistory: [],
            problemStats: { ...db.reports.problemStats }
        });

        // Initialize Dashboard Stats
        await DashboardStats.create({
            userId: user._id,
            activeClasses: db.dashboardStats.activeClasses,
            pendingInvites: db.dashboardStats.pendingInvites,
            weeklyGoal: db.dashboardStats.weeklyGoal
        });

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: "mock-jwt-token-12345"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
