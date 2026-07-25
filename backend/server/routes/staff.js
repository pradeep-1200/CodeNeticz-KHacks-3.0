const express = require('express');
const router  = express.Router();
const User       = require('../models/User');
const Activity   = require('../models/Activity');
const Class      = require('../models/Class');
const Level      = require('../models/Level');
const Assignment = require('../models/Assignment');
const { rbac }   = require('../src/middleware/rbac');

// All staff routes require TEACHER or ADMIN role
router.use(rbac('TEACHER', 'ADMIN'));

// ── GET Staff Dashboard Stats ────────────────────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  const teacherId = req.user.id;
  try {
    const classes = await Class.find({ teacherId })
      .populate('students', 'name email prelimsScore learningProfile')
      .lean();

    const classIds = classes.map(c => c._id);

    // Unique student count across all classes taught by teacher
    const studentIdSet = new Set();
    classes.forEach(c => (c.students || []).forEach(s => studentIdSet.add(s._id ? s._id.toString() : s.toString())));
    const totalStudents = studentIdSet.size > 0 ? studentIdSet.size : await User.countDocuments({ role: 'STUDENT' });

    // Active levels / assignments count
    const [activeLevelsCount, assignments] = await Promise.all([
      Level ? Level.countDocuments({ createdBy: teacherId }).catch(() => 0) : Promise.resolve(0),
      Assignment.find({ classId: { $in: classIds } }).lean()
    ]);

    // Total turned in vs total expected submissions for completion rate
    let totalSubmissions = 0;
    let totalExpected = 0;
    assignments.forEach(a => {
      totalSubmissions += (a.submissions || []).length;
      const targetClass = classes.find(c => c._id.toString() === a.classId.toString());
      totalExpected += (targetClass?.students?.length || 1);
    });

    const completionRate = totalExpected > 0 
      ? Math.min(100, Math.round((totalSubmissions / totalExpected) * 100))
      : (classes.length > 0 ? 100 : 0);

    // Recent submissions across assignments
    const recentSubmissionsList = [];
    const studentMap = {};
    classes.forEach(c => (c.students || []).forEach(s => { if (s._id) studentMap[s._id.toString()] = s; }));

    assignments.forEach(a => {
      (a.submissions || []).forEach(sub => {
        const studentObj = studentMap[sub.studentId?.toString()];
        recentSubmissionsList.push({
          student: studentObj?.name || 'Enrolled Student',
          task: a.title,
          status: sub.status === 'turned_in' ? 'Turned In' : sub.status === 'late' ? 'Late' : 'Submitted',
          time: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : 'Recently',
          rawDate: sub.submittedAt ? new Date(sub.submittedAt) : new Date(0)
        });
      });
    });

    recentSubmissionsList.sort((a, b) => b.rawDate - a.rawDate);
    const recentSubmissions = recentSubmissionsList.slice(0, 5);

    // Class Performance calculation
    const classPerformance = classes.map(c => {
      const classAssignments = assignments.filter(a => a.classId.toString() === c._id.toString());
      let classSubmissionsCount = 0;
      classAssignments.forEach(a => { classSubmissionsCount += (a.submissions || []).length; });
      const expected = Math.max(1, classAssignments.length * (c.students?.length || 1));
      const turnInPercentage = Math.min(100, Math.round((classSubmissionsCount / expected) * 100));

      const scored = (c.students || []).filter(s => s.prelimsScore !== undefined && s.prelimsScore !== null);
      const avgPrelims = scored.length > 0
        ? Math.round(scored.reduce((sum, st) => sum + (st.prelimsScore || 0), 0) / scored.length)
        : 0;

      const score = classAssignments.length > 0 ? turnInPercentage : (avgPrelims || 0);
      const color = score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'orange' : 'red';
      return { name: `${c.name}${c.section ? ` (${c.section})` : ''}`, score, color };
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeLevels: activeLevelsCount || classes.length,
        completionRate,
        recentSubmissions,
        classPerformance
      }
    });
  } catch (err) { next(err); }
});

// ── GET Staff Analytics & Reports (100% Dynamic from DB) ────────────────────
router.get('/reports', async (req, res, next) => {
  const teacherId = req.user.id;
  try {
    const classes = await Class.find({ teacherId }).populate('students', 'name email prelimsScore learningProfile supportProfile accessibilityPrefs isPrelimsCompleted').lean();
    const classIds = classes.map(c => c._id);

    // Extract unique students list for cognitive support profiles panel
    const studentMap = {};
    classes.forEach(c => {
      (c.students || []).forEach(st => {
        if (st._id) studentMap[st._id.toString()] = st;
      });
    });
    const studentsList = Object.values(studentMap);

    const assignments = await Assignment.find({ classId: { $in: classIds } }).sort({ createdAt: 1 }).lean();

    // 1. Assignment submission rates per class (Dynamic DB counts)
    const assignmentData = classes.map(c => {
      const classAssignments = assignments.filter(a => a.classId.toString() === c._id.toString());
      let totalSubmitted = 0;
      classAssignments.forEach(a => { totalSubmitted += (a.submissions || []).length; });
      
      const enrolledCount = c.students?.length || 0;
      const totalExpected = classAssignments.length * enrolledCount;
      const pending = Math.max(0, totalExpected - totalSubmitted);

      return {
        name: c.name,
        submitted: totalSubmitted,
        pending: pending
      };
    });

    // If no classes exist yet
    const finalAssignmentData = assignmentData.length > 0 ? assignmentData : [
      { name: 'No Active Classrooms', submitted: 0, pending: 0 }
    ];

    // 2. Class Performance Trend per Assignment / Class (Dynamic DB stats)
    let performanceData = [];
    if (assignments.length > 0) {
      performanceData = assignments.map((a, idx) => {
        const targetClass = classes.find(c => c._id.toString() === a.classId.toString());
        const totalEnrolled = targetClass?.students?.length || 1;
        const turnedInCount = (a.submissions || []).length;
        const turnInRate = Math.min(100, Math.round((turnedInCount / totalEnrolled) * 100));
        return {
          name: a.title.length > 15 ? `${a.title.substring(0, 15)}…` : a.title,
          avgScore: turnInRate
        };
      });
    } else {
      performanceData = classes.map(c => ({
        name: c.name,
        avgScore: 0
      }));
    }

    if (performanceData.length === 0) {
      performanceData = [{ name: 'No Data', avgScore: 0 }];
    }

    // 3. Task / Submission Type Distribution (Dynamic DB counts)
    let docSubmissionsCount = 0;
    let textSubmissionsCount = 0;
    let voiceSubmissionsCount = 0;

    assignments.forEach(a => {
      (a.submissions || []).forEach(sub => {
        if (sub.attachmentUrl || sub.attachment || (typeof sub.content === 'string' && (sub.content.startsWith('http') || sub.content.includes('/uploads/')))) {
          docSubmissionsCount++;
        } else if (typeof sub.content === 'string' && sub.content.includes('audio')) {
          voiceSubmissionsCount++;
        } else {
          textSubmissionsCount++;
        }
      });
    });

    // If no submissions turned in yet, count question types from created assignments
    if (docSubmissionsCount === 0 && textSubmissionsCount === 0 && voiceSubmissionsCount === 0) {
      assignments.forEach(a => {
        (a.questions || []).forEach(q => {
          if (q.type === 'voice' || q.type === 'speech') voiceSubmissionsCount++;
          else if (q.type === 'multiple_choice' || q.type === 'mcq') textSubmissionsCount++;
          else textSubmissionsCount++;
        });
      });
      // Count document upload allowance as default doc type
      docSubmissionsCount = assignments.length;
    }

    const difficultyDistribution = [
      { name: 'Document File Submissions', value: docSubmissionsCount, color: '#9333ea' },
      { name: 'Text Answers & MCQs', value: textSubmissionsCount, color: '#3b82f6' },
      { name: 'Voice & Speech Responses', value: voiceSubmissionsCount, color: '#ec4899' }
    ];

    // 4. Real-time Student Alerts from DB
    const studentAlerts = [];
    classes.forEach(c => {
      const classAssignments = assignments.filter(a => a.classId.toString() === c._id.toString());
      (c.students || []).forEach(st => {
        const studentIdStr = st._id ? st._id.toString() : st.toString();
        // Check if student has unsubmitted assignments
        const turnedInCount = classAssignments.filter(a => 
          (a.submissions || []).some(sub => sub.studentId?.toString() === studentIdStr)
        ).length;

        if (classAssignments.length > 0 && turnedInCount < classAssignments.length) {
          const missingCount = classAssignments.length - turnedInCount;
          studentAlerts.push({
            type: 'warning',
            title: `Pending Submissions: ${st.name || 'Enrolled Student'}`,
            message: `${st.name || 'Student'} has ${missingCount} pending assignment(s) in "${c.name}".`
          });
        }

        if (st.prelimsScore !== undefined && st.prelimsScore < 50) {
          studentAlerts.push({
            type: 'warning',
            title: `Low Diagnostic Score: ${st.name || 'Student'}`,
            message: `${st.name || 'Student'} scored ${st.prelimsScore}% in Prelims. Adaptive support profile active (${st.learningProfile || 'DEFAULT'}).`
          });
        }
      });
    });

    if (studentAlerts.length === 0) {
      studentAlerts.push({
        type: 'success',
        title: 'Active Class Engagement',
        message: classes.length > 0 
          ? `All students across ${classes.length} active classroom(s) are up to date with assignments!` 
          : 'Create a classroom and assign work to begin tracking real-time student analytics.'
      });
    }

    res.json({
      success: true,
      assignmentData: finalAssignmentData,
      performanceData,
      difficultyDistribution,
      studentAlerts,
      studentsList
    });
  } catch (err) { next(err); }
});

module.exports = router;
