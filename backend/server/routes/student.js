const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
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
        xp: user.xp || 0, xpToNextLevel, streak: user.streak || 0
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

    let report = await Report.findOne({ userId }).populate('userId', 'name email level levelTitle streak');

    if (!report) {
      report = await Report.create({
        userId,
        improvementData: [], skillData: [], strengths: [],
        areasToExplore: [], beforeStats: [], afterStats: [],
        submissionHistory: [],
        // FIX: include total counts so increments work from the first activity
        problemStats: {
          easy:   { solved: 0, total: 100 },
          medium: { solved: 0, total: 80 },
          hard:   { solved: 0, total: 30 },
          total:  { solved: 0, total: 210 }
        }
      });
      report = await Report.findById(report._id).populate('userId', 'name email level levelTitle streak');
    }

    res.json(report);
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

// ── Classroom Published Assessments for Student Dashboard ──────
router.get('/assessments', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all classes the student is enrolled in
    const enrolledClasses = await Class.find({ students: userId }).select('_id');
    const classIds = enrolledClasses.map(c => c._id);

    if (classIds.length === 0) {
      return res.json({ success: true, assessments: [] });
    }

    // Fetch published assessments for these enrolled classes only
    const assessments = await Assessment.find({
      classId: { $in: classIds },
      isPublished: true
    })
    .populate('teacherId', 'name email')
    .populate('classId', 'name subject section')
    .sort({ scheduledDate: 1, createdAt: -1 });

    if (assessments.length === 0) {
      return res.json({ success: true, assessments: [] });
    }

    // ── Phase 8: overlay per-student submission status ────────
    // A student who has submitted sees that assessment as 'Completed'
    // regardless of the teacher-set status window.
    const assessmentIds = assessments.map(a => a._id);
    const submissions   = await require('../models/AssessmentSubmission').find({
      assessmentId: { $in: assessmentIds },
      studentId:    userId,
      status:       { $in: ['submitted', 'auto_submitted'] }
    }).select('assessmentId').lean();

    const submittedSet = new Set(submissions.map(s => String(s.assessmentId)));

    // Merge: if student has submitted, override status to 'Completed'
    const enriched = assessments.map(a => {
      const plain = a.toObject();
      if (submittedSet.has(String(a._id))) {
        plain.status = 'Completed';
      }
      return plain;
    });

    res.json({ success: true, assessments: enriched });
  } catch (err) { next(err); }
});

// ── Get Single Assessment for Student Details Page ────────────
router.get('/assessments/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid assessment ID format' });
    }

    // Find all classes the student is enrolled in
    const enrolledClasses = await Class.find({ students: userId }).select('_id');
    const classIds = enrolledClasses.map(c => c._id);

    // Fetch the assessment details if published and assigned to student's enrolled classroom
    const assessment = await Assessment.findOne({
      _id: id,
      classId: { $in: classIds },
      isPublished: true
    })
    .populate('teacherId', 'name email')
    .populate('classId', 'name subject section');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found or not published' });
    }

    // ── Phase 8: check if this student has submitted ──────────
    const AssessmentSubmission = require('../models/AssessmentSubmission');
    const submission = await AssessmentSubmission.findOne({
      assessmentId: id,
      studentId:    userId,
      status:       { $in: ['submitted', 'auto_submitted'] }
    }).select('_id status submittedAt').lean();

    const plain = assessment.toObject();
    if (submission) {
      plain.status       = 'Completed';
      plain.submittedAt  = submission.submittedAt;
    }

    res.json({ success: true, assessment: plain });
  } catch (err) { next(err); }
});

// ── Assessment Questions (Legacy) ──────────────────────────────
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
