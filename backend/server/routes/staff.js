const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const Class = require('../models/Class');
const Level = require('../models/Level');

router.get('/dashboard', async (req, res) => {
    try {
        // Fetch real data
        const studentCount = await User.countDocuments({ role: 'student' });
        
        let activeLevelsCount = 0;
        try {
            if (Level) {
                activeLevelsCount = await Level.countDocuments();
            }
        } catch(e) {}

        // Fetch recent activities from students
        const recentActivities = await Activity.find()
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        
        const mappedSubmissions = recentActivities.map(act => ({
            student: act.userId ? act.userId.name : 'Unknown Student',
            task: act.title || 'Task',
            status: act.type === 'assessment' ? 'Perfect' : 'Good', // simple logic
            time: "Recently"
        }));

        // Fetch real classes for class performance
        const classes = await Class.find().populate('students', 'prelimsScore').limit(5);
        const classPerformance = classes.map(c => {
            const studentsWithScores = c.students.filter(s => s.prelimsScore !== undefined);
            const totalScore = studentsWithScores.reduce((sum, s) => sum + s.prelimsScore, 0);
            const avgScore = studentsWithScores.length > 0 ? Math.round(totalScore / studentsWithScores.length) : 0;
            
            // Determine color based on score
            let color = 'red';
            if (avgScore >= 80) color = 'green';
            else if (avgScore >= 60) color = 'blue';
            else if (avgScore >= 40) color = 'orange';

            return {
                name: `${c.name} ${c.section ? '(' + c.section + ')' : ''}`,
                score: avgScore,
                color: color
            };
        });

        res.json({
            stats: {
                totalStudents: studentCount,
                activeLevels: activeLevelsCount,
                completionRate: 0, // No real logic for this yet without mock data
                recentSubmissions: mappedSubmissions,
                classPerformance: classPerformance
            }
        });
    } catch (err) {
        console.error("Staff dashboard fetch error:", err);
        res.status(500).json({ error: "Failed to fetch staff dashboard data" });
    }
});

module.exports = router;
