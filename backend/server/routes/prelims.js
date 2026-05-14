const express = require('express');
const router = express.Router();
const PrelimsTest = require('../models/PrelimsTest');
const User = require('../models/User');

// GET /api/prelims/questions - fetch all questions
router.get('/questions', async (req, res) => {
    try {
        const questions = await PrelimsTest.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// POST /api/prelims/questions - add new question (Staff)
router.post('/questions', async (req, res) => {
    try {
        const { question, type, options, correctAnswer, disabilityMarker } = req.body;
        const newQuestion = new PrelimsTest({ question, type, options, correctAnswer, disabilityMarker });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// DELETE /api/prelims/questions/:id - delete question (Staff)
router.delete('/questions/:id', async (req, res) => {
    try {
        await PrelimsTest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

// POST /api/prelims/submit - evaluate and assign learning profile
router.post('/submit', async (req, res) => {
    try {
        const { userId, answers } = req.body;
        
        if (!userId) return res.status(400).json({ error: "userId is required" });

        // Logic to determine profile
        // answers array of { questionId, answer, timeTaken, usedStt }
        let profile = 'DEFAULT';
        
        let dyslexiaErrors = 0;
        let dysgraphiaTriggers = 0;
        let dyscalculiaErrors = 0;
        
        const questions = await PrelimsTest.find({ _id: { $in: answers.map(a => a.questionId) } });

        let totalQuestions = answers.length;
        let correctAnswers = 0;

        answers.forEach(ans => {
            const q = questions.find(question => question._id.toString() === ans.questionId);
            if (!q) return;

            const isCorrect = ans.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            
            if (isCorrect) correctAnswers++;

            // Check usage of STT
            if (ans.usedStt) dysgraphiaTriggers++;

            if (!isCorrect) {
                if (q.disabilityMarker === 'DYSLEXIA') dyslexiaErrors++;
                if (q.disabilityMarker === 'DYSCALCULIA') dyscalculiaErrors++;
                if (q.disabilityMarker === 'DYSGRAPHIA') dysgraphiaTriggers++;
            }
        });

        const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        if (dyslexiaErrors > 1) profile = 'DYSLEXIA';
        else if (dyscalculiaErrors > 1) profile = 'DYSCALCULIA';
        else if (dysgraphiaTriggers > 1) profile = 'DYSGRAPHIA';
        
        // Update user
        const user = await User.findByIdAndUpdate(userId, {
            learningProfile: profile,
            isPrelimsCompleted: true,
            prelimsScore: scorePercentage
        }, { new: true });

        res.json({ profile, score: scorePercentage, message: `Profile assigned: ${profile}` });
    } catch (err) {
        console.error("Prelims Submit Error:", err);
        res.status(500).json({ error: 'Failed to submit test' });
    }
});

module.exports = router;
