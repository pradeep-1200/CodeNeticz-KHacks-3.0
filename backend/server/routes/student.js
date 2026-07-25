const express = require('express');
const router  = express.Router();
const User       = require('../models/User');
const Activity   = require('../models/Activity');
const Material   = require('../models/Material');
const Report     = require('../models/Report');
const Assessment = require('../models/Assessment');
const DailyTip   = require('../models/DailyTip');
const Class      = require('../models/Class');
const Invitation = require('../models/Invitation');
// req.user is guaranteed by the authenticate middleware in index.js

// ── Dashboard ────────────────────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    // SECURITY FIX: use JWT userId, never getDemoUser()
    const userId = req.user.id;
    const user = await User.findById(userId).select('-passwordHash -password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [classCount, inviteCount, activeClasses, pendingInvites, recentActivity, dailyTip] = await Promise.all([
      Class.countDocuments({ students: userId }),
      Invitation.countDocuments({ studentId: userId, status: 'pending', expiresAt: { $gt: new Date() } }),
      Class.find({ students: userId }).populate('teacherId', 'name').sort({ createdAt: -1 }).limit(3),
      Invitation.find({ studentId: userId, status: 'pending', expiresAt: { $gt: new Date() } })
        .populate('classId', 'name subject section').populate('teacherId', 'name').limit(3),
      Activity.find({ userId }).sort({ createdAt: -1 }).limit(5),
      DailyTip.findOne()
    ]);

    const xpToNextLevel = (user.nextLevelXp || 1000) - (user.xp || 0);

    res.json({
      profile: {
        id: user._id, name: user.name, email: user.email,
        level: user.level || 1, levelTitle: user.levelTitle || 'Beginner',
        xp: user.xp || 0, xpToNextLevel, streak: user.streak || 0,
        lastStreakDate: user.lastStreakDate || null,
        completedLevels: user.completedLevels || []
      },
      stats: {
        activeClasses: { count: classCount, newMaterial: 0 },
        pendingInvites: { count: inviteCount, actionRequired: inviteCount > 0 },
        weeklyGoal:     { progress: Math.min(100, Math.floor(((user.xp || 0) % 1000) / 10)), status: 'On Track' }
      },
      activeClassesList: activeClasses,
      pendingInvitesList: pendingInvites,
      recentActivity,
      dailyTip
    });
  } catch (err) { next(err); }
});

// ── Classroom Materials ───────────────────────────────────────
router.get('/classroom', async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Only return materials from classes the student is enrolled in
    const classes = await Class.find({ students: userId }).select('_id materials').populate('materials');
    const materials = classes.flatMap(c => c.materials || []);
    res.json({ materials });
  } catch (err) { next(err); }
});

// ── Report ────────────────────────────────────────────────────
router.get('/report', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId).select('-passwordHash -password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let report = await Report.findOne({ userId }).populate('userId', 'name email level levelTitle streak learningProfile prelimsScore xp').lean();

    const score = user.prelimsScore || 75;
    const xpBonus = Math.min(30, Math.floor((user.xp || 0) / 50));
    const profileName = (user.learningProfile || 'DEFAULT').replace('_', ' ');

    const defaultBeforeStats = [
      { label: 'Reading Speed & Comprehension', value: 45, display: '45 wpm' },
      { label: 'Focus & Attention Span', value: 50, display: '50%' },
      { label: 'Task Accuracy Rate', value: 55, display: '55%' }
    ];

    const defaultAfterStats = [
      { label: 'Reading Speed & Comprehension', value: Math.min(95, 45 + xpBonus + 25), display: `${Math.min(95, 45 + xpBonus + 25)} wpm (+${25 + xpBonus}%)` },
      { label: 'Focus & Attention Span', value: Math.min(98, 50 + xpBonus + 30), display: `${Math.min(98, 50 + xpBonus + 30)}% (+${30 + xpBonus}%)` },
      { label: 'Task Accuracy Rate', value: Math.min(100, Math.max(80, score + xpBonus)), display: `${Math.min(100, Math.max(80, score + xpBonus))}% (+${Math.max(25, score - 55)}%)` }
    ];

    const defaultImprovementData = [
      { subject: 'Literacy & Grammar', score: Math.min(98, score + 10), improved: 25 },
      { subject: 'Numerical & Logic', score: Math.min(95, score + 5), improved: 20 },
      { subject: 'Phonetics & Speech', score: Math.min(92, score + 12), improved: 30 },
      { subject: 'Cognitive Memory', score: Math.min(96, score + 8), improved: 18 }
    ];

    const defaultSkillData = [
      { name: 'OpenDyslexic Font Retention', progress: 88 },
      { name: 'Voice-to-Text Accuracy', progress: 92 },
      { name: 'Color Contrast Focus', progress: 85 },
      { name: 'Dyscalculia Math Ruler', progress: 90 }
    ];

    const profileStrengths = {
      DYSLEXIA: ['High Verbal Reasoning', 'Visual Pattern Recognition', 'Strong Auditory Retention'],
      DYSCALCULIA: ['Spatial Awareness', 'Conceptual Logic', 'Strong Vocabulary'],
      VOICE_INPUT: ['Expressive Speech', 'Auditory Processing', 'Storytelling Skills'],
      DEFAULT: ['Consistent Daily Practice', 'Multi-Modal Engagement', 'Rapid Adaptability']
    };

    const profileAreas = {
      DYSLEXIA: ['Dense Text Passages', 'Time-Constrained Reading', 'Complex Word Spacing'],
      DYSCALCULIA: ['Mental Arithmetic', 'Multi-step Equations', 'Symbol Decoding'],
      VOICE_INPUT: ['Background Noise Environments', 'Long Dictation Sessions'],
      DEFAULT: ['Advanced Level Challenges', 'Speed Quizzes']
    };

    const strengths = profileStrengths[user.learningProfile] || profileStrengths.DEFAULT;
    const areasToExplore = profileAreas[user.learningProfile] || profileAreas.DEFAULT;

    const responseReport = {
      userId: {
        _id: user._id,
        name: user.name,
        email: user.email,
        level: user.level || 1,
        levelTitle: user.levelTitle || 'Beginner',
        streak: user.streak || 0,
        learningProfile: user.learningProfile || 'DEFAULT'
      },
      beforeStats: (report && report.beforeStats?.length) ? report.beforeStats : defaultBeforeStats,
      afterStats: (report && report.afterStats?.length) ? report.afterStats : defaultAfterStats,
      improvementData: (report && report.improvementData?.length) ? report.improvementData : defaultImprovementData,
      skillData: (report && report.skillData?.length) ? report.skillData : defaultSkillData,
      strengths: (report && report.strengths?.length) ? report.strengths : strengths,
      areasToExplore: (report && report.areasToExplore?.length) ? report.areasToExplore : areasToExplore
    };

    res.json(responseReport);
  } catch (err) { next(err); }
});

// ── Complete Activity (XP + streak update) ────────────────────
router.post('/complete-activity', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, difficulty, accuracy } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // XP award by difficulty
    const xpMap = { easy: 10, medium: 25, hard: 50, challenge: 100 };
    const xpEarned = xpMap[(difficulty || '').toLowerCase()] || 25;

    user.streak = (user.streak || 0) + 1;
    user.xp     = (user.xp || 0) + xpEarned;
    await user.save();

    // Update report
    const report = await Report.findOne({ userId });
    if (report) {
      const today = new Date().toISOString().split('T')[0];
      const existingEntry = report.submissionHistory.find(e => e.date === today);
      if (existingEntry) existingEntry.count += 1;
      else report.submissionHistory.push({ date: today, count: 1 });

      if (type === 'assessment' && difficulty) {
        const key = difficulty.toLowerCase();
        if (report.problemStats?.[key]) {
          report.problemStats[key].solved += 1;
          report.problemStats.total.solved += 1;
        }
      }
      await report.save();
    }

    res.json({ success: true, newStreak: user.streak, newXp: user.xp, xpEarned });
  } catch (err) { next(err); }
});

// ── Complete Level (Level-specific XP + completedLevels + Activity Log) ──
router.post('/complete-level', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { levelId, title, xpReward = 500, accuracy = 100, xpMultiplier = 1.0 } = req.body;

    if (!levelId) {
      return res.status(400).json({ success: false, message: 'levelId is required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const strLevelId = levelId.toString();
    if (!user.completedLevels) user.completedLevels = [];

    // SECURITY CHECK: If already completed, prevent granting duplicate XP!
    if (user.completedLevels.includes(strLevelId)) {
      return res.json({
        success: true,
        alreadyCompleted: true,
        xpEarned: 0,
        message: 'Level has already been completed.',
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastStreakDate: user.lastStreakDate,
        completedLevels: user.completedLevels,
        streakGained: false,
        streakLost: false
      });
    }

    // ── Day-based streak logic ─────────────────────────────────
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const lastDate = user.lastStreakDate || null;

    let streakGained = false;
    let streakLost   = false;

    if (!lastDate) {
      // First ever completion
      user.streak = 1;
      streakGained = true;
    } else if (lastDate === today) {
      // Already played today — streak stays the same, no gain/loss
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        // Consecutive day — extend streak
        user.streak = (user.streak || 0) + 1;
        streakGained = true;
      } else {
        // Missed one or more days — reset streak
        const prevStreak = user.streak || 0;
        user.streak = 1;
        streakLost   = prevStreak > 1; // only mark lost if they had a real streak going
        streakGained = false;
      }
    }
    user.lastStreakDate = today;
    // ──────────────────────────────────────────────────────────

    // Calculate effective XP with support multiplier
    const effectiveXp = Math.round((xpReward || 500) * (xpMultiplier || 1.0));
    user.completedLevels.push(strLevelId);
    user.xp    = (user.xp || 0) + effectiveXp;
    user.level = Math.floor(user.xp / 1000) + 1;

    if (user.xp >= 1000 && user.levelTitle === 'Beginner') {
      user.levelTitle = 'Rising Star';
    }

    await user.save();

    // Add enriched Activity entry for the Dashboard feed
    const actTitle = `Completed "${title || 'Interactive Level'}" — Score: ${accuracy}% · +${effectiveXp} XP`;
    await Activity.create({
      userId: user._id,
      type:   'level',
      title:  actTitle,
      time:   'Just now'
    });

    // Update student report submission history
    const report = await Report.findOne({ userId });
    if (report) {
      const todayStr = today;
      const existingEntry = report.submissionHistory.find(e => e.date === todayStr);
      if (existingEntry) existingEntry.count += 1;
      else report.submissionHistory.push({ date: todayStr, count: 1 });
      await report.save();
    }

    res.json({
      success: true,
      alreadyCompleted: false,
      xpEarned: effectiveXp,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastStreakDate: user.lastStreakDate,
      completedLevels: user.completedLevels,
      streakGained,
      streakLost
    });
  } catch (err) { next(err); }
});

// ── Assessment Questions ──────────────────────────────────────
router.get('/assessment', async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Validate student is enrolled in at least one class before showing assessments
    const classCount = await Class.countDocuments({ students: userId });
    if (classCount === 0) {
      return res.json([]); // No classes joined — no assessments shown
    }
    const questions = await Assessment.find();
    res.json(questions);
  } catch (err) { next(err); }
});

module.exports = router;
