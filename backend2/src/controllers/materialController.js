const Material = require('../models/Material');
const Classroom = require('../models/Classroom');

// @desc    Add material to a classroom
// @route   POST /api/material/add
// @access  Private/Teacher
const addMaterial = async (req, res) => {
    const { classId, title, description, type, content } = req.body;

    const classroom = await Classroom.findById(classId);

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // Ensure user is the teacher of the classroom
    if (classroom.teacherId.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'Not authorized to add material to this classroom' });
        return;
    }

    const material = await Material.create({
        classId,
        title,
        description,
        type,
        content,
        createdBy: req.user._id,
    });

    res.status(201).json(material);
};

// @desc    Get materials for a classroom
// @route   GET /api/material/:classId
// @access  Private
const getMaterials = async (req, res) => {
    const classroom = await Classroom.findById(req.params.classId);

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // Check access: must be teacher or student of that class
    const isTeacher = classroom.teacherId.toString() === req.user._id.toString();
    // classroom.students contains ObjectIds, so we need to check string equality
    const isStudent = classroom.students.some(id => id.toString() === req.user._id.toString());

    if (!isTeacher && !isStudent) {
        res.status(403).json({ message: 'Not authorized to view materials for this classroom' });
        return;
    }

    const materials = await Material.find({ classId: req.params.classId }).sort({ createdAt: -1 });

    res.json(materials);
};

module.exports = { addMaterial, getMaterials };
