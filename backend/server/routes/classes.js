const express = require('express');
const router  = express.Router();
const Class       = require('../models/Class');
const User        = require('../models/User');
const Invitation  = require('../models/Invitation');
const Notification = require('../models/Notification');
const mongoose    = require('mongoose');
const crypto      = require('crypto');
const { rbac }    = require('../src/middleware/rbac');

const generateCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// CREATE Class — teacher only
router.post('/create', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { name, section, subject, room, capacity } = req.body;
  const teacherId = req.user.id;
  try {
    const allowedParticipants = Number(capacity) || 60;
    if (!name?.trim() || !subject?.trim()) {
      return res.status(400).json({ success: false, message: 'Class name and subject are required' });
    }
    if (!Number.isInteger(allowedParticipants) || allowedParticipants < 1) {
      return res.status(400).json({ success: false, message: 'Allowed participants must be a whole number of at least 1' });
    }
    const newClass = new Class({
      name: name.trim(), 
      section: section?.trim(), 
      subject: subject.trim(), 
      room: room?.trim(),
      capacity: allowedParticipants, 
      teacherId, 
      code: generateCode(),
      isActive: true
    });
    await newClass.save();
    res.status(201).json({ success: true, class: newClass });
  } catch (err) { next(err); }
});

// GET classes for teacher
router.get('/teacher', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const classes = await Class.find({ teacherId })
      .populate('students', 'name email prelimsScore learningProfile')
      .populate('assessments', 'title difficulty xpReward')
      .populate('materials');
    res.json({ success: true, classes });
  } catch (err) { next(err); }
});

// JOIN class — students only, code-based
router.post('/join', rbac('STUDENT'), async (req, res, next) => {
  const { code } = req.body;
  const studentId = req.user.id;
  try {
    if (!code) return res.status(400).json({ success: false, message: 'Class code is required' });

    const cleanCode = code.toUpperCase().trim();
    const cls = await Class.findOne({ code: cleanCode });
    if (!cls) return res.status(404).json({ success: false, message: 'Invalid class code. Please check with your teacher.' });
    if (cls.isActive === false) return res.status(400).json({ success: false, message: 'This classroom is no longer active.' });
    
    // Check student array
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    if (cls.students.some(id => id.toString() === studentId)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this class!' });
    }
    if (cls.students.length >= (cls.capacity || 60)) {
      return res.status(400).json({ success: false, message: 'Classroom has reached full capacity.' });
    }

    // If invite-only, verify pending invitation
    if (cls.isInviteOnly) {
      const invite = await Invitation.findOne({ studentId, classId: cls._id, status: 'pending' });
      if (!invite) return res.status(403).json({ success: false, message: 'This classroom requires an invitation from the teacher.' });
    }

    // Add student to class
    cls.students.push(studentObjectId);
    await cls.save();

    // Mark invitation accepted if exists
    await Invitation.findOneAndUpdate({ studentId, classId: cls._id }, { status: 'accepted' });

    // Send notification to teacher
    if (cls.teacherId) {
      const studentUser = await User.findById(studentId).select('name');
      await Notification.create({
        userId: cls.teacherId,
        message: `${studentUser?.name || 'A student'} joined ${cls.name}`,
        type: 'info',
        link: '/staff/dashboard'
      });
    }

    res.json({ success: true, message: `Successfully joined ${cls.name}!`, class: cls });
  } catch (err) { next(err); }
});

// INVITE student — teacher only
router.post('/invite', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { email, classId } = req.body;
  const teacherId = req.user.id;
  try {
    const student = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
      role: 'STUDENT'
    });
    if (!student) return res.status(404).json({ success: false, message: `Student with email '${email}' not found.` });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (cls.teacherId.toString() !== teacherId) return res.status(403).json({ success: false, message: 'You are not the teacher of this class' });
    if (cls.students.includes(student._id)) return res.status(400).json({ success: false, message: 'Student is already enrolled in this class' });

    const existing = await Invitation.findOne({ studentId: student._id, classId: cls._id, status: 'pending' });
    if (existing) return res.status(400).json({ success: false, message: 'Invitation already sent to this student' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await new Invitation({ studentId: student._id, teacherId, classId, expiresAt }).save();

    // Notify student
    await Notification.create({
      userId: student._id,
      message: `You have been invited to join ${cls.name} (${cls.section || cls.subject})`,
      type: 'invitation',
      link: `/student/dashboard`
    });

    res.json({ success: true, message: `Invitation sent to ${email}!` });
  } catch (err) { next(err); }
});

// GET classes for student (enrolled)
router.get('/student', rbac('STUDENT'), async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const classes = await Class.find({ students: studentId })
      .populate('teacherId', 'name')
      .populate('materials')
      .populate('assessments', 'title difficulty xpReward');
    res.json({ success: true, classes });
  } catch (err) { next(err); }
});

// GET invites for student
router.get('/invites', rbac('STUDENT'), async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const invites = await Invitation.find({ studentId, status: 'pending', expiresAt: { $gt: new Date() } })
      .populate('classId', 'name section subject')
      .populate('teacherId', 'name');
    res.json({ success: true, invites });
  } catch (err) { next(err); }
});

// RESPOND to invite
router.post('/invite/respond', rbac('STUDENT'), async (req, res, next) => {
  const { inviteId, status } = req.body;
  const studentId = req.user.id;
  try {
    const invite = await Invitation.findById(inviteId);
    if (!invite) return res.status(404).json({ success: false, message: 'Invite not found' });
    if (invite.studentId.toString() !== studentId) return res.status(403).json({ success: false, message: 'Not your invitation' });

    invite.status = status;
    await invite.save();

    if (status === 'accepted') {
      const cls = await Class.findById(invite.classId);
      // FIX: was cls.students.includes(studentId) which compares ObjectId vs string
      //      and always returns false, allowing duplicate enrollments.
      if (cls && !cls.students.some(id => id.toString() === studentId)) {
        cls.students.push(studentId);
        await cls.save();
      }
    }

    res.json({ success: true, message: `Invite ${status}` });
  } catch (err) { next(err); }
});

// ASSIGN level to class — teacher only
router.post('/assign-level', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { classId, levelId } = req.body;
  const teacherId = req.user.id;
  try {
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (cls.teacherId.toString() !== teacherId) return res.status(403).json({ success: false, message: 'Not your class' });
    if (cls.assessments.includes(levelId)) return res.status(400).json({ success: false, message: 'Level already assigned' });

    cls.assessments.push(levelId);
    await cls.save();

    if (cls.students.length > 0) {
      const notifications = cls.students.map(sid => ({
        userId: sid,
        message: `New learning task assigned in ${cls.name}`,
        type: 'assignment',
        link: `/student/classroom`
      }));
      await Notification.insertMany(notifications);
    }

    res.json({ success: true, message: 'Level assigned successfully' });
  } catch (err) { next(err); }
});

// ── Assessment Management ──────────────────────────────────────
const Assessment = require('../models/Assessment');

// CREATE & PUBLISH Assessment to Class — teacher only
// Requires: title, duration > 0, at least 1 question when publishing
router.post('/create-assessment', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { classId, title, subject, duration, scheduledDate, startTime, endTime, questions, status, isPublished } = req.body;
  const teacherId = req.user.id;
  try {
    // ── Basic field validation ──
    if (!classId) return res.status(400).json({ success: false, message: 'classId is required' });
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Assessment title is required' });

    const parsedDuration = Number(duration);
    if (!parsedDuration || parsedDuration < 1) {
      return res.status(400).json({ success: false, message: 'Duration must be at least 1 minute' });
    }

    const questionList = Array.isArray(questions) ? questions : [];

    // ── Enforce question requirement when publishing ──
    const willPublish = isPublished !== false; // default = true (publish)
    if (willPublish && questionList.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required before publishing. Add questions or save as Draft.' });
    }

    // ── Class ownership check ──
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (cls.teacherId.toString() !== teacherId) return res.status(403).json({ success: false, message: 'Not your class' });

    const now = new Date();
    const newAssessment = new Assessment({
      title: title.trim(),
      subject: (subject || '').trim() || cls.subject || '',
      teacherId,
      classId,
      duration: parsedDuration,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : now,
      startTime: startTime || '09:00 AM',
      endTime: endTime || '10:00 AM',
      status: status || 'Upcoming',
      isPublished: willPublish,
      publishedAt: willPublish ? now : null,
      questions: questionList
    });

    await newAssessment.save();

    // Notify enrolled students only when publishing
    if (willPublish && cls.students.length > 0) {
      const notifications = cls.students.map(sid => ({
        userId: sid,
        message: `New Assessment Published: ${newAssessment.title} in ${cls.name}`,
        type: 'assignment',
        link: `/student/dashboard`
      }));
      await Notification.insertMany(notifications);
    }

    const action = willPublish ? 'published' : 'saved as draft';
    res.status(201).json({ success: true, message: `Assessment ${action} successfully!`, assessment: newAssessment });
  } catch (err) { next(err); }
});

// GET all assessments for a class — teacher only (returns both published & draft)
router.get('/:classId/assessments', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { classId } = req.params;
  const teacherId = req.user.id;
  try {
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (cls.teacherId.toString() !== teacherId) return res.status(403).json({ success: false, message: 'Not your class' });

    const assessments = await Assessment.find({ classId })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, assessments });
  } catch (err) { next(err); }
});

// UNPUBLISH assessment — teacher only
router.patch('/assessments/:assessmentId/unpublish', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { assessmentId } = req.params;
  const teacherId = req.user.id;
  try {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    // Verify class ownership
    const cls = await Class.findById(assessment.classId);
    if (!cls || cls.teacherId.toString() !== teacherId) {
      return res.status(403).json({ success: false, message: 'Not your assessment' });
    }

    assessment.isPublished = false;
    assessment.publishedAt = null;
    await assessment.save();

    res.json({ success: true, message: 'Assessment unpublished (moved to Draft)', assessment });
  } catch (err) { next(err); }
});

// DELETE assessment — teacher only
router.delete('/assessments/:assessmentId', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  const { assessmentId } = req.params;
  const teacherId = req.user.id;
  try {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const cls = await Class.findById(assessment.classId);
    if (!cls || cls.teacherId.toString() !== teacherId) {
      return res.status(403).json({ success: false, message: 'Not your assessment' });
    }

    await Assessment.findByIdAndDelete(assessmentId);
    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
