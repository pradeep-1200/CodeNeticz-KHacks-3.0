const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConn');

const User = require('./models/User');
const DashboardStats = require('./models/DashboardStats');
const Activity = require('./models/Activity');
const Material = require('./models/Material');
const Report = require('./models/Report');
const Assessment = require('./models/Assessment');
const DailyTip = require('./models/DailyTip');
const db = require('./data/db'); // Original mock data

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await DashboardStats.deleteMany();
        await Activity.deleteMany();
        await Material.deleteMany();
        await Report.deleteMany();
        await Assessment.deleteMany();
        await DailyTip.deleteMany();

        // Create User
        const user = await User.create({
            name: db.studentProfile.name,
            email: "student@example.com",
            password: "12345", // Default password
            level: db.studentProfile.level,
            levelTitle: db.studentProfile.levelTitle,
            xp: db.studentProfile.xp,
            nextLevelXp: db.studentProfile.nextLevelXp,
            streak: db.studentProfile.streak,
            badges: db.studentProfile.badges
        });

        // Create Stats
        await DashboardStats.create({
            userId: user._id,
            activeClasses: db.dashboardStats.activeClasses,
            pendingInvites: db.dashboardStats.pendingInvites,
            weeklyGoal: db.dashboardStats.weeklyGoal
        });

        // Create Activity
        const activities = db.recentActivity.map(a => ({
            userId: user._id,
            ...a
        }));
        await Activity.insertMany(activities);

        // Create Materials
        // Note: For cloud storage, you would upload files here using Cloudinary uploader
        // For now, we seed with existing mock names.
        await Material.insertMany(db.materials);

        // Create Report
        await Report.create({
            userId: user._id,
            improvementData: db.reports.improvementData,
            skillData: db.reports.skillData,
            strengths: db.reports.strengths,
            areasToExplore: db.reports.areasToExplore,
            submissionHistory: db.reports.submissionHistory,
            problemStats: db.reports.problemStats
        });

        // Create Assessment
        await Assessment.insertMany(db.assessmentQuestions);

        // Create Daily Tip
        await DailyTip.create(db.dailyTip);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

importData();
