const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const Material = require('../models/Material');

// Upload Material Route
router.post('/upload', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        const newMaterial = new Material({
            title: req.body.title || req.file.originalname,
            type: req.body.type || 'pdf', // default or detect
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            likes: 0,
            url: result.secure_url,
            publicId: result.public_id
        });

        await newMaterial.save();

        res.json({
            success: true,
            material: newMaterial
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error during upload" });
    }
});

module.exports = router;
