const express = require('express');
const router  = express.Router();
const PrelimsTest = require('../models/PrelimsTest');
const User        = require('../models/User');
const { rbac }    = require('../src/middleware/rbac');

// ─────────────────────────────────────────────────────────────
// GET /api/prelims/questions — fetch all questions (no correct answers)
// ─────────────────────────────────────────────────────────────
router.get('/questions', async (req, res, next) => {
  try {
    const questions = await PrelimsTest.find()
      .select('-correctAnswer')          // Never send answers to client
      .sort({ domain: 1, orderInDomain: 1 });
    res.json(questions);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// POST /api/prelims/questions — create a question (staff only)
// ─────────────────────────────────────────────────────────────
router.post('/questions', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const {
      question, domain, type, options, correctAnswer, patternTag,
      passage, isUngraded, sequenceItems, orderInDomain
    } = req.body;

    const newQuestion = new PrelimsTest({
      question, domain, type, options, correctAnswer, patternTag,
      passage, isUngraded, sequenceItems, orderInDomain
    });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/prelims/questions/:id — delete a question (staff only)
// ─────────────────────────────────────────────────────────────
router.delete('/questions/:id', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    await PrelimsTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// POST /api/prelims/submit — score per domain, save supportProfile
// ─────────────────────────────────────────────────────────────
router.post('/submit', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions   = await PrelimsTest.find({ _id: { $in: questionIds } });

    // Per-domain tracking
    const domainStats = {
      reading: { correct: 0, total: 0 },
      writing:  { correct: 0, total: 0 },
      math:     { correct: 0, total: 0 }
    };

    // Preference answers (not graded)
    const prefAnswers = {};

    let totalCorrect = 0;

    answers.forEach(ans => {
      const q = questions.find(qu => qu._id.toString() === ans.questionId);
      if (!q) return;

      // Preference questions — collect but don't grade
      if (q.domain === 'preference' || q.isUngraded) {
        prefAnswers[q.question] = ans.answer;
        return;
      }

      // Graded domains
      const domain = q.domain; // 'reading' | 'writing' | 'math'
      if (!domainStats[domain]) return;

      domainStats[domain].total += 1;

      const isCorrect = ans.answer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
      if (isCorrect) {
        domainStats[domain].correct += 1;
        totalCorrect += 1;
      }
    });

    // ── Band assignment per domain ──────────────────────────────
    // ≥80% → 'none', 50–79% → 'mild', <50% → 'full'
    const assignBand = (stats) => {
      if (stats.total === 0) return 'none'; // No questions in domain → no support needed
      const pct = (stats.correct / stats.total) * 100;
      if (pct >= 80) return 'none';
      if (pct >= 50) return 'mild';
      return 'full';
    };

    const supportProfile = {
      reading: assignBand(domainStats.reading),
      writing:  assignBand(domainStats.writing),
      math:     assignBand(domainStats.math)
    };

    // Domain score percentages (for response)
    const domainScores = {
      reading: domainStats.reading.total > 0 ? Math.round((domainStats.reading.correct / domainStats.reading.total) * 100) : null,
      writing:  domainStats.writing.total  > 0 ? Math.round((domainStats.writing.correct  / domainStats.writing.total)  * 100) : null,
      math:     domainStats.math.total     > 0 ? Math.round((domainStats.math.correct     / domainStats.math.total)     * 100) : null
    };

    // ── Parse preference answers → accessibilityPrefs ──────────
    const accessibilityPrefs = {
      fontSize:  'normal',
      contrast:  'normal',
      readAloud: false
    };

    // Map common preference question answer patterns
    Object.entries(prefAnswers).forEach(([question, answer]) => {
      const q = question.toLowerCase();
      const a = (answer || '').toLowerCase();

      if (q.includes('font') || q.includes('text size')) {
        accessibilityPrefs.fontSize = a.includes('large') || a.includes('big') ? 'large' : 'normal';
      }
      if (q.includes('contrast') || q.includes('colour')) {
        accessibilityPrefs.contrast = a.includes('high') ? 'high' : 'normal';
      }
      if (q.includes('read aloud') || q.includes('text-to-speech') || q.includes('tts')) {
        accessibilityPrefs.readAloud = a.includes('yes') || a === 'true';
      }
    });

    // ── Derive legacy learningProfile from dominant support need ──
    // (backward compat — kept for older components that read learningProfile)
    const bandPriority = { full: 3, mild: 2, none: 1 };
    const dominant = Object.entries(supportProfile).sort((a, b) => bandPriority[b[1]] - bandPriority[a[1]])[0];

    let legacyProfile = 'DEFAULT';
    if (dominant[1] !== 'none') {
      if (dominant[0] === 'reading') legacyProfile = 'READING_SUPPORT';
      else if (dominant[0] === 'math') legacyProfile = 'NUMBER_SUPPORT';
      else if (dominant[0] === 'writing') legacyProfile = 'VOICE_INPUT';
    }

    // Check STT usage — override to VOICE_INPUT if heavily used
    const sttUsageCount = answers.filter(a => a.usedStt).length;
    if (sttUsageCount >= 2 && legacyProfile === 'DEFAULT') {
      legacyProfile = 'VOICE_INPUT';
    }

    const totalGradedQuestions = domainStats.reading.total + domainStats.writing.total + domainStats.math.total;
    const overallScore = totalGradedQuestions > 0 ? Math.round((totalCorrect / totalGradedQuestions) * 100) : 0;

    // ── Save to User ────────────────────────────────────────────
    await User.findByIdAndUpdate(userId, {
      isPrelimsCompleted: true,
      prelimsScore:       overallScore,
      learningProfile:    legacyProfile,
      supportProfile,
      accessibilityPrefs
    }, { new: true });

    res.json({
      success: true,
      score: overallScore,
      domainScores,
      supportProfile,
      accessibilityPrefs,
      legacyProfile,
      message: 'Assessment complete. Your learning tools have been personalised.'
    });

  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// GET /api/prelims/seed — populate sample structured questions (staff only)
// ─────────────────────────────────────────────────────────────
router.get('/seed', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    // Clear existing and re-seed
    await PrelimsTest.deleteMany({});

    const sampleQuestions = [
      // ── READING (8 questions) ──
      {
        domain: 'reading', type: 'mcq', orderInDomain: 1,
        passage: 'Sunita woke up early. She looked outside and saw dark clouds. She decided to carry an umbrella before leaving for school.',
        question: 'Why did Sunita carry an umbrella?',
        options: ['She forgot her bag', 'She saw dark clouds', 'Her mother told her', 'It was raining already'],
        correctAnswer: 'She saw dark clouds',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'mcq', orderInDomain: 2,
        passage: 'Sunita woke up early. She looked outside and saw dark clouds. She decided to carry an umbrella before leaving for school.',
        question: 'What time did Sunita wake up?',
        options: ['Late at night', 'In the afternoon', 'Early in the morning', 'At noon'],
        correctAnswer: 'Early in the morning',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'mcq', orderInDomain: 3,
        question: 'Which word means the opposite of "ancient"?',
        options: ['Old', 'Modern', 'Huge', 'Calm'],
        correctAnswer: 'Modern',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'mcq', orderInDomain: 4,
        question: 'Which sentence is written correctly?',
        options: ['She go to school.', 'He goes to school.', 'They goes home.', 'We is happy.'],
        correctAnswer: 'He goes to school.',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'sequence', orderInDomain: 5,
        question: 'Arrange these words to form a correct sentence.',
        sequenceItems: ['the', 'dog', 'barked', 'loudly'],
        correctAnswer: 'the dog barked loudly',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'sequence', orderInDomain: 6,
        question: 'Put these events in the correct order.',
        sequenceItems: ['She dried her hair.', 'She took a shower.', 'She woke up.', 'She went to school.'],
        correctAnswer: 'She woke up. She took a shower. She dried her hair. She went to school.',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'mcq', orderInDomain: 7,
        question: 'What does the word "enormous" mean?',
        options: ['Very small', 'Very fast', 'Very large', 'Very quiet'],
        correctAnswer: 'Very large',
        patternTag: 'reading-speed'
      },
      {
        domain: 'reading', type: 'mcq', orderInDomain: 8,
        question: 'Which word is spelled correctly?',
        options: ['Recieve', 'Beleive', 'Achieve', 'Percieve'],
        correctAnswer: 'Achieve',
        patternTag: 'reading-speed'
      },

      // ── WRITING (7 questions) ──
      {
        domain: 'writing', type: 'text', orderInDomain: 1,
        question: 'Listen and type: "The bright sun shines over the mountains."',
        correctAnswer: 'The bright sun shines over the mountains.',
        patternTag: 'attention'
      },
      {
        domain: 'writing', type: 'text', orderInDomain: 2,
        question: 'Correct the spelling mistake: "She weared a beautifull dress."',
        correctAnswer: 'She wore a beautiful dress.',
        patternTag: 'attention'
      },
      {
        domain: 'writing', type: 'mcq', orderInDomain: 3,
        question: 'Which sentence has a spelling error?',
        options: ['He is very happy.', 'She recieved a gift.', 'They went to school.', 'We are going home.'],
        correctAnswer: 'She recieved a gift.',
        patternTag: 'attention'
      },
      {
        domain: 'writing', type: 'text', orderInDomain: 4,
        question: 'Write one sentence about your favourite animal.',
        correctAnswer: 'any',  // Open-ended — graded as correct always
        isUngraded: true,
        patternTag: 'attention'
      },
      {
        domain: 'writing', type: 'text', orderInDomain: 5,
        question: 'Type the sentence exactly: "Ravi enjoys reading books every evening."',
        correctAnswer: 'Ravi enjoys reading books every evening.',
        patternTag: 'attention'
      },
      {
        domain: 'writing', type: 'mcq', orderInDomain: 6,
        question: 'Choose the correctly punctuated sentence.',
        options: ['Where are you going', 'where are you going?', 'Where are you going?', 'Where are you going!'],
        correctAnswer: 'Where are you going?',
        patternTag: 'attention'
      },
      {
        domain: 'writing', type: 'text', orderInDomain: 7,
        question: 'Type: "My school has a large garden and a library."',
        correctAnswer: 'My school has a large garden and a library.',
        patternTag: 'attention'
      },

      // ── MATH (9 questions) ──
      {
        domain: 'math', type: 'mcq', orderInDomain: 1,
        question: 'What is 24 + 37?',
        options: ['51', '61', '60', '71'],
        correctAnswer: '61',
        patternTag: 'numerical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 2,
        question: 'What is 9 × 7?',
        options: ['56', '63', '72', '54'],
        correctAnswer: '63',
        patternTag: 'numerical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 3,
        question: 'A bag has 15 apples. You eat 6. How many are left?',
        options: ['9', '11', '8', '10'],
        correctAnswer: '9',
        patternTag: 'numerical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 4,
        question: 'Riya has ₹50. She spends ₹18. How much does she have left?',
        options: ['₹30', '₹32', '₹28', '₹38'],
        correctAnswer: '₹32',
        patternTag: 'numerical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 5,
        question: 'Which is the largest number?',
        options: ['405', '450', '504', '540'],
        correctAnswer: '540',
        patternTag: 'numerical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 6,
        question: 'What comes next: 2, 4, 8, 16, ___?',
        options: ['18', '20', '32', '24'],
        correctAnswer: '32',
        patternTag: 'logical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 7,
        question: 'What is half of 84?',
        options: ['40', '42', '44', '46'],
        correctAnswer: '42',
        patternTag: 'numerical'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 8,
        question: 'Which shape has 4 equal sides?',
        options: ['Rectangle', 'Triangle', 'Square', 'Circle'],
        correctAnswer: 'Square',
        patternTag: 'spatial'
      },
      {
        domain: 'math', type: 'mcq', orderInDomain: 9,
        question: '🔴🔵🔴🔵🔴 — What comes next in the pattern?',
        options: ['🔴', '🔵', '🟡', '🟢'],
        correctAnswer: '🔵',
        patternTag: 'logical'
      },

      // ── PREFERENCES (4 ungraded questions) ──
      {
        domain: 'preference', type: 'mcq', orderInDomain: 1,
        isUngraded: true,
        question: 'What text size do you prefer when reading on screen?',
        options: ['Normal', 'Large'],
        correctAnswer: 'Normal'  // Not actually graded
      },
      {
        domain: 'preference', type: 'mcq', orderInDomain: 2,
        isUngraded: true,
        question: 'Do you prefer high contrast colours (darker background, brighter text)?',
        options: ['Normal contrast', 'High contrast'],
        correctAnswer: 'Normal contrast'
      },
      {
        domain: 'preference', type: 'mcq', orderInDomain: 3,
        isUngraded: true,
        question: 'Would you like questions to be read aloud to you by default?',
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      },
      {
        domain: 'preference', type: 'mcq', orderInDomain: 4,
        isUngraded: true,
        question: 'Do you find it easier to answer by speaking instead of typing?',
        options: ['Yes', 'No'],
        correctAnswer: 'No'
      }
    ];

    await PrelimsTest.insertMany(sampleQuestions);
    res.json({ success: true, message: `Seeded ${sampleQuestions.length} sample prelims questions` });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// GET /api/prelims/student/:id — get a student's support profile (staff only)
// ─────────────────────────────────────────────────────────────
router.get('/student/:id', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email supportProfile accessibilityPrefs isPrelimsCompleted learningProfile prelimsScore');
    if (!user) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, student: user });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/prelims/student/:id/override — staff manually overrides support profile
// ─────────────────────────────────────────────────────────────
router.put('/student/:id/override', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { supportProfile, accessibilityPrefs } = req.body;

    const updateFields = {};
    if (supportProfile) {
      if (supportProfile.reading) updateFields['supportProfile.reading'] = supportProfile.reading;
      if (supportProfile.writing)  updateFields['supportProfile.writing']  = supportProfile.writing;
      if (supportProfile.math)     updateFields['supportProfile.math']     = supportProfile.math;
    }
    if (accessibilityPrefs) {
      if (accessibilityPrefs.fontSize  !== undefined) updateFields['accessibilityPrefs.fontSize']  = accessibilityPrefs.fontSize;
      if (accessibilityPrefs.contrast  !== undefined) updateFields['accessibilityPrefs.contrast']  = accessibilityPrefs.contrast;
      if (accessibilityPrefs.readAloud !== undefined) updateFields['accessibilityPrefs.readAloud'] = accessibilityPrefs.readAloud;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true })
      .select('name email supportProfile accessibilityPrefs');

    res.json({ success: true, student: updated, message: 'Support profile updated by staff' });
  } catch (err) { next(err); }
});

module.exports = router;
