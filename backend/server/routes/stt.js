const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configure upload
const upload = multer({
    dest: 'uploads/', // Temporary folder
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/process', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No audio file uploaded" });
    }

    const audioPath = path.resolve(req.file.path);
    const scriptPath = path.join(__dirname, '../bridge_stt.py');

    console.log(`Processing audio: ${audioPath} with script: ${scriptPath}`);

    // Spawn Python process using the specific venv python to ensure dependencies (whisper) are available
    const pythonExecutable = "d:\\student_backend\\Dysgraphia\\stt\\venv\\Scripts\\python.exe";
    const pythonProcess = spawn(pythonExecutable, [scriptPath, audioPath]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        // Don't treat all stderr as fatal error, as Whisper prints progress to stderr
        console.log(`[Python Log]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        // cleanup temp file
        fs.unlink(audioPath, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });

        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            console.error(`STDERR: ${errorString}`);
            return res.status(500).json({
                success: false,
                message: "Transcription process failed",
                error: errorString,
                details: "Check server logs for full stderr"
            });
        }

        try {
            // Find the last valid JSON line
            const lines = dataString.trim().split('\n');
            let result = null;

            // Iterate ALL lines to find the relevant JSON
            for (let i = 0; i < lines.length; i++) {
                try {
                    // Start from end is better for result, but let's be robust
                    const line = lines[lines.length - 1 - i].trim();
                    if (!line) continue;

                    const parsed = JSON.parse(line);

                    if ('text' in parsed) {
                        result = parsed;
                        break;
                    }
                    if (parsed.error && !result) {
                        result = parsed; // Keep error if no text found yet
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!result) {
                console.error("DEBUG: Raw Python output was:", dataString);
                throw new Error("No valid JSON output found from script");
            }

            if (result.error) {
                return res.status(500).json({ success: false, message: result.error, traceback: result.traceback });
            }

            res.json({
                success: true,
                text: result.text,
                language: result.language,
                original_result: result
            });

        } catch (err) {
            console.error("JSON Parse Error:", err, "\nRaw Output:", dataString);
            res.status(500).json({ success: false, message: "Failed to parse transcription output" });
        }
    });
});

module.exports = router;
