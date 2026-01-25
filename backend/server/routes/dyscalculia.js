const express = require('express');
const router = express.Router();
const { solveMathProblem } = require('../utils/dyscalculia/solver');

// POST /api/dyscalculia/solve
router.post('/solve', (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "No question provided" });
        }

        const solution = solveMathProblem(question);

        if (solution.error) {
            return res.status(200).json(solution); // Return 200 with error property as per frontend exp
        }

        res.json(solution);
    } catch (error) {
        console.error("Dyscalculia Solve Error:", error);
        res.status(500).json({ error: "Solver failed", message: error.message });
    }
});

module.exports = router;
