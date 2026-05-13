const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configure upload
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/ocr/scan
router.post('/scan', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const imagePath = path.resolve(req.file.path);
    const scriptPath = path.join(__dirname, '../utils/ocr.py');

    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

    console.log(`[OCR] Processing image: ${imagePath}`);
    const pythonProcess = spawn(pythonExecutable, [scriptPath, imagePath]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.log(`[OCR Python Log]: ${data}`);
    });

    pythonProcess.on('error', (error) => {
        console.error('[OCR] Failed to start Python process:', error);
        fs.unlink(imagePath, () => { });
        return res.status(500).json({
            success: false,
            message: "Failed to start OCR process",
            error: error.message
        });
    });

    pythonProcess.on('close', (code) => {
        // cleanup temp file
        fs.unlink(imagePath, (err) => {
            if (err) console.error("[OCR] Failed to delete temp file:", err);
        });

        if (code !== 0) {
            return res.status(500).json({
                success: false,
                message: "OCR process failed",
                error: errorString
            });
        }

        try {
            const result = JSON.parse(dataString.trim());
            if (result.error) {
                return res.status(500).json({ success: false, message: result.error });
            }
            res.json({
                success: true,
                text: result.text
            });
        } catch (err) {
            console.error("[OCR] JSON Parse Error:", err, "\nRaw Output:", dataString);
            res.status(500).json({ success: false, message: "Failed to parse OCR output" });
        }
    });
});

module.exports = router;
