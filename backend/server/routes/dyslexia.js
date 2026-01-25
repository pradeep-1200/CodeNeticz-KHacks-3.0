const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// MOCK MODE - Set to true to test without Python
const MOCK_MODE = false;

// Path to virtual environment Python (fallback to system python if venv doesn't exist)
const venvPython = path.join(__dirname, '../../../Dyslexia/venv/Scripts/python.exe');
const pythonCommand = fs.existsSync(venvPython) ? venvPython : 'python';

console.log('Dyslexia Routes - Mock Mode:', MOCK_MODE);
if (!MOCK_MODE) {
    console.log('Python command:', pythonCommand);
    console.log('Venv exists:', fs.existsSync(venvPython));
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
                return res.status(500).json({ error: 'Summarization failed', details: errorOutput || 'Unknown error' });
            }
            res.json({ summary: output.trim() });
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
        console.log('Spawning Python for Simplification:', pythonCommand, pythonScript);
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
                console.error('Simplification error output:', errorOutput);
                return res.status(500).json({ error: 'Simplification failed', details: errorOutput || 'Unknown error' });
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
