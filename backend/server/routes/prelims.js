const express = require('express');
const router  = express.Router();
const PrelimsTest = require('../models/PrelimsTest');
const User        = require('../models/User');
const { rbac }    = require('../src/middleware/rbac');

// GET all questions
router.get('/questions', async (req, res, next) => {
  try {
    const questions = await PrelimsTest.find().select('-correctAnswer'); // Don't send answers to client
    res.json(questions);
  } catch (err) { next(err); }
});

// POST new question — staff only
router.post('/questions', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    // ETHICAL FIX: patternTag replaces disabilityMarker
    // Valid patternTags: 'reading-speed', 'logical', 'memory', 'attention', 'spatial', 'numerical'
    const { question, type, options, correctAnswer, patternTag } = req.body;
    const newQuestion = new PrelimsTest({ question, type, options, correctAnswer, patternTag });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) { next(err); }
});

// DELETE question — staff only
router.delete('/questions/:id', rbac('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    await PrelimsTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) { next(err); }
});

// POST submit — generates learning support recommendation (NOT a diagnosis)
router.post('/submit', async (req, res, next) => {
  try {
    const userId = req.user.id; // ← from JWT
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions   = await PrelimsTest.find({ _id: { $in: questionIds } });

    let correct = 0;
    const patternCounts = {};  // { 'reading-speed': 2, 'logical': 1 }

    answers.forEach(ans => {
      const q = questions.find(qu => qu._id.toString() === ans.questionId);
      if (!q) return;

      const isCorrect = ans.answer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
      if (isCorrect) correct++;

      // Track patterns from wrong answers to identify where support may help
      if (!isCorrect && q.patternTag) {
        patternCounts[q.patternTag] = (patternCounts[q.patternTag] || 0) + 1;
      }
    });

    const scorePercentage = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;

    // ETHICAL: generate a support MODE recommendation, not a disability diagnosis
    // Threshold: 2+ errors in a pattern area triggers a support suggestion
    let suggestedMode = 'standard';
    let suggestionReason = 'No specific support pattern detected';

    const topPattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0];
    if (topPattern && topPattern[1] >= 2) {
      const [pattern, count] = topPattern;
      if (pattern === 'reading-speed') {
        suggestedMode = 'reading-support';
        suggestionReason = 'Reading guide and text spacing tools were frequently helpful in this session';
      } else if (pattern === 'numerical') {
        suggestedMode = 'number-support';
        suggestionReason = 'Visual number aids and color-coded math tools may help in this area';
      } else if (pattern === 'attention') {
        suggestedMode = 'focus';
        suggestionReason = 'A focused, distraction-free learning environment may improve performance';
      }
    }

    // Check STT usage — suggest voice-input mode if heavily used
    const sttUsageCount = answers.filter(a => a.usedStt).length;
    if (sttUsageCount >= 2 && suggestedMode === 'standard') {
      suggestedMode = 'voice-input';
      suggestionReason = 'Voice input was used consistently and may work better for this learner';
    }

    // Update user record with completion and suggestion (not a label)
    await User.findByIdAndUpdate(userId, {
      isPrelimsCompleted: true,
      prelimsScore:       scorePercentage,
      // Store suggested mode as a preference suggestion (not a fixed diagnosis)
      learningProfile:    suggestedMode === 'standard' ? 'DEFAULT' : suggestedMode.toUpperCase().replace('-', '_')
    }, { new: true });

    res.json({
      success: true,
      score: scorePercentage,
      suggestedMode,
      suggestionReason,
      message: suggestedMode !== 'standard'
        ? `We recommend trying "${suggestedMode.replace('-', ' ')}" — you can change this anytime in your accessibility settings`
        : 'Assessment complete. Standard mode works well for you.'
    });
  } catch (err) { next(err); }
});

module.exports = router;
