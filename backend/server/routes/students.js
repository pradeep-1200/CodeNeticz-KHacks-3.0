'use strict';

/**
 * Student Profile Routes — Phase 1
 * GET  /api/students/:id  — fetch full profile (TEACHER or the student themselves)
 * PUT  /api/students/:id  — update profile    (TEACHER only)
 */

const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Class    = require('../models/Class');
const { rbac } = require('../src/middleware/rbac');

// ── helpers ──────────────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fields safe to return — never expose passwordHash
const SAFE_FIELDS =
  'name email role isActive level xp streak badges learningProfile ' +
  'isPrelimsCompleted prelimsScore rollNumber department year section ' +
  'classroomId phone gender dateOfBirth profileImage joinedAt status accessibilityProfile createdAt';

// ── GET /api/students/:id ─────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    // Allow TEACHER/ADMIN or the student viewing their own profile
    if (req.user.role === 'STUDENT' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = await User.findOne({ _id: id, role: 'STUDENT' })
      .select(SAFE_FIELDS)
      .populate('classroomId', 'name subject section code');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch all classes this student is enrolled in (for display)
    const classes = await Class.find({ students: id }).select('name subject section code');

    res.json({ success: true, student, classes });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/students/:id ─────────────────────────────────────
router.put('/:id', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    const student = await User.findOne({ _id: id, role: 'STUDENT' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Whitelist editable fields — never allow role / passwordHash changes here
    const {
      name,
      rollNumber,
      department,
      year,
      section,
      classroomId,
      phone,
      gender,
      dateOfBirth,
      profileImage,
      status,
    } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed || trimmed.length < 2) {
        return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
      }
      student.name = trimmed;
    }

    if (rollNumber !== undefined) student.rollNumber = String(rollNumber).trim();
    if (department  !== undefined) student.department  = String(department).trim();
    if (year        !== undefined) student.year        = String(year).trim();
    if (section     !== undefined) student.section     = String(section).trim();
    if (profileImage !== undefined) student.profileImage = String(profileImage).trim();

    if (phone !== undefined) {
      const ph = String(phone).trim();
      if (ph && !/^[+\d\s\-()]{7,20}$/.test(ph)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
      }
      student.phone = ph;
    }

    if (gender !== undefined) {
      const allowed = ['Male', 'Female', 'Other', 'Prefer not to say', ''];
      if (!allowed.includes(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender value' });
      }
      student.gender = gender;
    }

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null || dateOfBirth === '') {
        student.dateOfBirth = null;
      } else {
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid date of birth' });
        }
        student.dateOfBirth = dob;
      }
    }

    if (classroomId !== undefined) {
      if (classroomId === null || classroomId === '') {
        student.classroomId = null;
      } else {
        if (!isValidObjectId(classroomId)) {
          return res.status(400).json({ success: false, message: 'Invalid classroom ID' });
        }
        const cls = await Class.findById(classroomId);
        if (!cls) {
          return res.status(404).json({ success: false, message: 'Classroom not found' });
        }
        student.classroomId = classroomId;
      }
    }

    if (status !== undefined) {
      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be Active or Inactive' });
      }
      student.status   = status;
      student.isActive = status === 'Active';
    }

    await student.save();

    // Re-fetch with populated classroom
    const updated = await User.findById(id)
      .select(SAFE_FIELDS)
      .populate('classroomId', 'name subject section code');

    res.json({ success: true, message: 'Profile updated successfully', student: updated });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/:id/accessibility-profile ───────────────
router.get('/:id/accessibility-profile', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    // Allow TEACHER/ADMIN or the student viewing their own profile
    if (req.user.role === 'STUDENT' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = await User.findOne({ _id: id, role: 'STUDENT' }).select('accessibilityProfile');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const defaultProfile = {
      readingSupport: false,
      writingSupport: false,
      numberSupport: false,
      textToSpeech: false,
      speechToText: false,
      simplifiedReading: false,
      keywordHighlighting: false,
      visualMathAids: false,
      stepByStepHints: false,
      largeText: false,
      highContrast: false,
    };

    const profile = { ...defaultProfile, ...(student.accessibilityProfile?.toObject ? student.accessibilityProfile.toObject() : student.accessibilityProfile) };

    res.json({ success: true, accessibilityProfile: profile });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/students/:id/accessibility-profile ───────────────
router.put('/:id/accessibility-profile', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    const student = await User.findOne({ _id: id, role: 'STUDENT' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payload = req.body || {};
    const allowedKeys = [
      'readingSupport',
      'writingSupport',
      'numberSupport',
      'textToSpeech',
      'speechToText',
      'simplifiedReading',
      'keywordHighlighting',
      'visualMathAids',
      'stepByStepHints',
      'largeText',
      'highContrast',
    ];

    // Input validation
    for (const key of Object.keys(payload)) {
      if (!allowedKeys.includes(key)) {
        return res.status(400).json({ success: false, message: `Invalid accessibility profile field: ${key}` });
      }
      if (typeof payload[key] !== 'boolean') {
        return res.status(400).json({ success: false, message: `Field ${key} must be a boolean value` });
      }
    }

    // Merge existing profile values or defaults
    const currentProfile = {
      readingSupport: false,
      writingSupport: false,
      numberSupport: false,
      textToSpeech: false,
      speechToText: false,
      simplifiedReading: false,
      keywordHighlighting: false,
      visualMathAids: false,
      stepByStepHints: false,
      largeText: false,
      highContrast: false,
      ...(student.accessibilityProfile?.toObject ? student.accessibilityProfile.toObject() : student.accessibilityProfile),
    };

    const newProfile = { ...currentProfile, ...payload };

    // Apply auto-enable business rules if support toggles were switched to true in payload
    if (payload.readingSupport === true) {
      newProfile.textToSpeech = true;
      newProfile.simplifiedReading = true;
      newProfile.keywordHighlighting = true;
    }

    if (payload.writingSupport === true) {
      newProfile.speechToText = true;
    }

    if (payload.numberSupport === true) {
      newProfile.visualMathAids = true;
      newProfile.stepByStepHints = true;
    }

    student.accessibilityProfile = newProfile;
    await student.save();

    res.json({
      success: true,
      message: 'Accessibility profile updated successfully',
      accessibilityProfile: student.accessibilityProfile,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
