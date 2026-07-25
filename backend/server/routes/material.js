'use strict';

const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/upload');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const Material = require('../models/Material');
const { rbac } = require('../src/middleware/rbac');

// ── GET all materials ─────────────────────────────────────────
// FIX: this route was missing — api.js getAllMaterials() was getting 404
router.get('/', async (req, res, next) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.json({ success: true, materials });
    } catch (err) { next(err); }
});

// ── Upload Material (Teacher only) ────────────────────────────
router.post('/upload', rbac('TEACHER', 'ADMIN'), upload, async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        if (!req.body.title?.trim()) {
            return res.status(400).json({ success: false, message: 'Material title is required' });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        const newMaterial = new Material({
            title:    req.body.title.trim() || req.file.originalname,
            desc:     req.body.desc  || '',
            type:     req.body.type  || 'pdf',
            date:     new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            likes:    0,
            url:      result.secure_url,
            publicId: result.public_id
        });

        await newMaterial.save();

        // If classId provided, link material to that class
        if (req.body.classId) {
            const Class = require('../models/Class');
            const cls = await Class.findById(req.body.classId);
            if (cls) {
                cls.materials.push(newMaterial._id);
                await cls.save();
            }
        }

        res.status(201).json({ success: true, material: newMaterial });
    } catch (err) { next(err); }
});

module.exports = router;
