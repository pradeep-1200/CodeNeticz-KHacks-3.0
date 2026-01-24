const express = require('express');
const router = express.Router();
const { addMaterial, getMaterials } = require('../controllers/materialController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.post('/', protect, teacher, addMaterial);
router.get('/:classroomId', protect, getMaterials);

module.exports = router;
