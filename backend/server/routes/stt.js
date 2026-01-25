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

    // Validate file type (basic check)
    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    const allowedExtensions = ['.mp3', '.wav', '.webm', '.ogg', '.m4a', '.mp4'];

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const mimeType = req.file.mimetype;

    if (!allowedMimeTypes.includes(mimeType) && !allowedExtensions.includes(fileExt)) {
        // Clean up uploaded file
        fs.unlink(req.file.path, () => { });
        return res.status(400).json({
            success: false,
            message: "Invalid audio file format. Supported formats: MP3, WAV, WebM, OGG, M4A"
        });
    }

    const audioPath = path.resolve(req.file.path);
    const scriptPath = path.join(__dirname, '../bridge_stt.py');

    console.log(`Processing audio: ${audioPath} with script: ${scriptPath}`);

    // Spawn Python process - use environment variable or fallback to system python
    // Set PYTHON_EXECUTABLE in .env to point to your venv python if needed
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

    console.log(`Using Python executable: ${pythonExecutable}`);

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

    // Handle process spawn errors (e.g., Python not found)
    pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        fs.unlink(audioPath, () => { });
        return res.status(500).json({
            success: false,
            message: "Failed to start transcription process",
            error: error.message,
            hint: "Make sure Python is installed and PYTHON_EXECUTABLE is set correctly in .env"
        });
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
