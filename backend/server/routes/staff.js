const express = require('express');
const router  = express.Router();
const User     = require('../models/User');
const Activity = require('../models/Activity');
const Class    = require('../models/Class');
const Level    = require('../models/Level');
const { rbac } = require('../src/middleware/rbac');

// All staff routes require TEACHER or ADMIN role
router.use(rbac('TEACHER', 'ADMIN'));

router.get('/dashboard', async (req, res, next) => {
  const teacherId = req.user.id;
  try {
    const [studentCount, activeLevelsCount, recentActivities, classes] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      Level ? Level.countDocuments().catch(() => 0) : Promise.resolve(0),
      Activity.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(5),
      Class.find({ teacherId }).populate('students', 'prelimsScore').limit(5)
    ]);

    const mappedSubmissions = recentActivities.map(act => ({
      student: act.userId?.name || 'Unknown',
      task:    act.title || 'Task',
      status:  act.type === 'assessment' ? 'Submitted' : 'Completed',
      time:    'Recently'
    }));

    const classPerformance = classes.map(c => {
      const scored = c.students.filter(s => s.prelimsScore !== undefined);
      const avgScore = scored.length > 0
        ? Math.round(scored.reduce((s, st) => s + st.prelimsScore, 0) / scored.length)
        : 0;
      const color = avgScore >= 80 ? 'green' : avgScore >= 60 ? 'blue' : avgScore >= 40 ? 'orange' : 'red';
      return { name: `${c.name}${c.section ? ` (${c.section})` : ''}`, score: avgScore, color };
    });

    res.json({
      stats: {
        totalStudents: studentCount,
        activeLevels: activeLevelsCount,
        completionRate: 0,
        recentSubmissions: mappedSubmissions,
        classPerformance
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
