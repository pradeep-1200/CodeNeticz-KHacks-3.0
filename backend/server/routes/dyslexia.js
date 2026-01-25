const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// MOCK MODE - Set to true to test without Python
const MOCK_MODE = false;

// Path to virtual environment Python (fallback to system python if venv doesn't exist)
// FORCE SYSTEM PYTHON to avoid Raghul_Sekar path issues
const pythonCommand = 'python';

console.log('Dyslexia Routes - Mock Mode:', MOCK_MODE);
if (!MOCK_MODE) {
    console.log('Python command (FORCED):', pythonCommand);
}

// POST /api/dyslexia/summarize
router.post('/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'No text provided' });

        // MOCK MODE - Return simulated summary
        if (MOCK_MODE) {
            const summary = `Summary: ${text.substring(0, 100)}... (This is a demo summary. Install Python packages to use real AI summarization)`;
            return res.json({ summary });
        }

        // REAL MODE - Use Python script
        const pythonScript = path.join(__dirname, '../../../Dyslexia/bart_summarization.py');
        console.log('Spawning Python for Summarization:', pythonCommand, pythonScript);
        const python = spawn(pythonCommand, [pythonScript]);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            console.log(`Python stdout: ${data}`);
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error(`Python stderr: ${data}`);
            errorOutput += data.toString();
        });

        python.on('error', (err) => {
            console.error('Failed to start Python process:', err);
            res.status(500).json({ error: 'Failed to start Python process', details: err.message });
        });

        python.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            if (code !== 0) {
                console.error('Summarization error output:', errorOutput);
                // Send the actual error message back to the frontend!
                return res.status(500).json({
                    error: 'Summarization failed',
                    details: errorOutput || 'Unknown error',
                    code: code
                });
            }
            try {
                // Ensure output is valid JSON if expected, or just text
                // Check if the output is just the summary string or a JSON object
                // The python script for BART prints just the text
                const result = output.trim();
                if (!result) throw new Error("Empty output from Python script");
                res.json({ summary: result });
            } catch (e) {
                console.error("Error parsing Python output:", e);
                res.status(500).json({ error: "Invalid output from AI model", details: output });
            }
        });

        python.stdin.write(text);
        python.stdin.end();

    } catch (err) {
        console.error('Summarize error:', err);
        res.status(500).json({ error: 'Summarization failed' });
    }
});

// POST /api/dyslexia/simplify
router.post('/simplify', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'No text provided' });

        // MOCK MODE - Return simulated simplified text
        if (MOCK_MODE) {
            const simplified = text
                .replace(/difficult/gi, 'hard')
                .replace(/complex/gi, 'hard')
                .replace(/utilize/gi, 'use')
                .replace(/demonstrate/gi, 'show')
                .replace(/consequently/gi, 'so')
                + '\n\n(Demo mode: Install Python packages for real AI text simplification)';
            return res.json({ simplified });
        }

        // REAL MODE - Use Python script
        const pythonScript = path.join(__dirname, '../../../Dyslexia/simplify_wrapper.py');
        console.log(`[Simplify] Spawning Python: ${pythonCommand} ${pythonScript}`);

        const python = spawn(pythonCommand, [pythonScript]);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            console.log(`[Simplify] stdout: ${data}`);
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error(`[Simplify] stderr: ${data}`);
            errorOutput += data.toString();
        });

        python.on('error', (err) => {
            console.error('[Simplify] Spawn Error:', err);
            res.status(500).json({ error: 'Failed to start Python process', details: err.message });
        });

        python.on('close', (code) => {
            console.log(`[Simplify] process exited with code ${code}`);
            if (code !== 0) {
                console.error('[Simplify] Error output:', errorOutput);
                return res.status(500).json({
                    error: 'Simplification failed',
                    details: errorOutput || 'Unknown error',
                    code: code
                });
            }
            res.json({ simplified: output.trim() });
        });

        python.stdin.write(text);
        python.stdin.end();

    } catch (err) {
        console.error('Simplify error:', err);
        res.status(500).json({ error: 'Simplification failed' });
    }
});

module.exports = router;
