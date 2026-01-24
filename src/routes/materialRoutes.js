const express = require('express');
const router = express.Router();
const { addMaterial, getMaterials } = require('../controllers/materialController');
const { protect, teacherOnly } = require('../middleware/auth');

router.post('/add', protect, teacherOnly, addMaterial);
router.get('/:classId', protect, getMaterials);

module.exports = router;
