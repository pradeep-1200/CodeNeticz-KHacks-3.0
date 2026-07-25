const express = require('express');
const router = express.Router();
const Level = require('../models/Level');
const User  = require('../models/User');

// Helper: map supportProfile domain bands to targetProfile strings
const getSupportTargetProfiles = (supportProfile) => {
    if (!supportProfile) return [];
    const targets = [];
    if (supportProfile.reading !== 'none') targets.push('READING_SUPPORT');
    if (supportProfile.math    !== 'none') targets.push('NUMBER_SUPPORT');
    if (supportProfile.writing !== 'none') targets.push('VOICE_INPUT');
    return targets;
};

// ─────────────────────────────────────────────────────────────
// GET /api/levels — all levels (teacher view, unfiltered)
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const levels = await Level.find().sort({ difficulty: 1, order: 1 });
        res.json({ success: true, levels });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/levels/for-student — profile-filtered levels for authenticated student
// Returns: all 'general' levels + 'support' levels matching student's support domains
// Sorted by difficulty tier, then order within tier
// ─────────────────────────────────────────────────────────────
router.get('/for-student', async (req, res) => {
    try {
        let supportTargets = [];

        // Try to read student's supportProfile from DB via JWT user
        if (req.user && req.user.id) {
            const user = await User.findById(req.user.id).select('supportProfile');
            if (user && user.supportProfile) {
                supportTargets = getSupportTargetProfiles(user.supportProfile);
            }
        }

        // Build query: general levels always shown; support levels only if profile matches
        const query = supportTargets.length > 0
            ? {
                $or: [
                    { levelType: 'general' },
                    { levelType: 'support', targetProfile: { $in: supportTargets } }
                ]
            }
            : { levelType: 'general' };

        const DIFFICULTY_ORDER = { easy: 1, medium: 2, hard: 3 };
        const levels = await Level.find(query).lean();

        // Sort by difficulty tier first, then by order within tier
        levels.sort((a, b) => {
            const da = DIFFICULTY_ORDER[a.difficulty] || 1;
            const db = DIFFICULTY_ORDER[b.difficulty] || 1;
            if (da !== db) return da - db;
            return (a.order || 0) - (b.order || 0);
        });

        res.json({ success: true, levels });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/levels/:id — single level by ID (for playing)
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
        res.json({ success: true, level });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/levels — create a new level (teacher)
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const {
        title, description, difficulty, tasks, xpReward,
        targetProfile, levelType, order, xpMultiplier
    } = req.body;

    try {
        // Auto-set xpMultiplier to 1.2 for support levels if not explicitly provided
        const resolvedMultiplier = xpMultiplier !== undefined
            ? xpMultiplier
            : (levelType === 'support' ? 1.2 : 1.0);

        const newLevel = new Level({
            title,
            description,
            difficulty,
            tasks,
            xpReward: xpReward || 500,
            targetProfile: targetProfile || 'DEFAULT',
            levelType: levelType || 'general',
            order: order || 0,
            xpMultiplier: resolvedMultiplier,
            createdBy: req.user?.id
        });
        await newLevel.save();
        res.status(201).json({ success: true, level: newLevel });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/levels/ai-generate — smart template task generation
// Profile-aware templates that simulate AI generation
// ─────────────────────────────────────────────────────────────
router.post('/ai-generate', async (req, res) => {
    try {
        const { targetProfile, difficulty, taskType } = req.body;

        // Template library keyed by profile and task type
        const templates = {
            READING_SUPPORT: {
                quiz: [
                    {
                        type: 'quiz',
                        props: {
                            question: 'Read the sentence slowly: "The farmer waters his crops every morning." What does the farmer do?',
                            options: ['Sells crops', 'Waters crops', 'Buys crops', 'Harvests crops'],
                            correctAnswer: 'Waters crops',
                            hint: 'Focus on what the farmer does to the crops.',
                            ttsEnabled: true,
                            fontSize: 'large'
                        }
                    },
                    {
                        type: 'quiz',
                        props: {
                            question: 'Which word means "happy"?',
                            options: ['Sad', 'Joyful', 'Angry', 'Bored'],
                            correctAnswer: 'Joyful',
                            hint: 'Think of a word that means feeling really good.',
                            ttsEnabled: true
                        }
                    }
                ],
                jumbled: [
                    {
                        type: 'jumbled',
                        props: {
                            sentence: 'The sun rises in the east',
                            ttsEnabled: true,
                            hint: 'Think about where the sun appears in the morning.'
                        }
                    }
                ],
                speech: [
                    {
                        type: 'speech',
                        props: {
                            promptText: 'Read this sentence aloud clearly: "Birds fly high in the blue sky."',
                            expectedKeywords: ['birds', 'fly', 'sky'],
                            displayText: 'Birds fly high in the blue sky.',
                            ttsEnabled: true
                        }
                    }
                ]
            },
            NUMBER_SUPPORT: {
                quiz: [
                    {
                        type: 'quiz',
                        props: {
                            question: '🟡🟡🟡 + 🔵🔵 = How many circles in total?',
                            options: ['4', '5', '6', '7'],
                            correctAnswer: '5',
                            hint: 'Count all the coloured circles.',
                            visualAidEnabled: true
                        }
                    },
                    {
                        type: 'quiz',
                        props: {
                            question: 'Priya had 12 candies. She gave 4 to her friend. How many does she have now?',
                            options: ['6', '7', '8', '9'],
                            correctAnswer: '8',
                            hint: 'Subtract the candies she gave away.',
                            visualAidEnabled: true,
                            numberHighlight: true
                        }
                    }
                ],
                jumbled: [
                    {
                        type: 'jumbled',
                        props: {
                            sentence: 'First add then subtract the numbers',
                            hint: 'Order of operations matters in math.',
                            visualAidEnabled: true
                        }
                    }
                ],
                speech: [
                    {
                        type: 'speech',
                        props: {
                            promptText: 'Say the answer aloud: What is 3 times 4?',
                            expectedKeywords: ['twelve', '12'],
                            visualAidEnabled: true
                        }
                    }
                ]
            },
            VOICE_INPUT: {
                quiz: [
                    {
                        type: 'quiz',
                        props: {
                            question: 'Which of these is a verb (action word)?',
                            options: ['Table', 'Run', 'Blue', 'Heavy'],
                            correctAnswer: 'Run',
                            hint: 'A verb is something you do.',
                            sttEnabled: true
                        }
                    }
                ],
                jumbled: [
                    {
                        type: 'jumbled',
                        props: {
                            sentence: 'She writes a letter to her friend',
                            hint: 'Think about the subject doing the action.',
                            sttEnabled: true
                        }
                    }
                ],
                speech: [
                    {
                        type: 'speech',
                        props: {
                            promptText: 'Speak your answer: Tell me one word that means "big".',
                            expectedKeywords: ['large', 'huge', 'enormous', 'giant', 'big'],
                            sttEnabled: true
                        }
                    }
                ]
            },
            DEFAULT: {
                quiz: [
                    {
                        type: 'quiz',
                        props: {
                            question: 'What is the capital of India?',
                            options: ['Mumbai', 'Delhi', 'Chennai', 'Kolkata'],
                            correctAnswer: 'Delhi',
                            hint: 'It is in the northern part of India.'
                        }
                    }
                ],
                jumbled: [
                    {
                        type: 'jumbled',
                        props: {
                            sentence: 'Learning is a lifelong journey'
                        }
                    }
                ],
                speech: [
                    {
                        type: 'speech',
                        props: {
                            promptText: 'Say aloud: "Knowledge is power."',
                            expectedKeywords: ['knowledge', 'power']
                        }
                    }
                ]
            }
        };

        const profile = templates[targetProfile] || templates['DEFAULT'];
        const taskTemplates = profile[taskType] || profile['quiz'];
        const randomTask = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];

        res.json({ success: true, task: { ...randomTask, id: Date.now() } });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/levels/:id — delete a level
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Level deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
