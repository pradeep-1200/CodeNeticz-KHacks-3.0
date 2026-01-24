const Material = require('../models/Material');
const Classroom = require('../models/Classroom');

// @desc    Add material to a classroom
// @route   POST /api/materials
// @access  Private/Teacher
const addMaterial = async (req, res) => {
    const { classroomId, title, description, type, content } = req.body;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // Ensure user is the teacher of the classroom
    if (classroom.teacher.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'Not authorized to add material to this classroom' });
        return;
    }

    const material = await Material.create({
        classroom: classroomId,
        title,
        description,
        type,
        content,
        createdBy: req.user._id,
    });

    res.status(201).json(material);
};

// @desc    Get materials for a classroom
// @route   GET /api/materials/:classroomId
// @access  Private
const getMaterials = async (req, res) => {
    const classroom = await Classroom.findById(req.params.classroomId);

    if (!classroom) {
        res.status(404).json({ message: 'Classroom not found' });
        return;
    }

    // Check access
    const isTeacher = classroom.teacher.toString() === req.user._id.toString();
    const isStudent = classroom.students.includes(req.user._id);

    if (!isTeacher && !isStudent) {
        res.status(403).json({ message: 'Not authorized to view materials for this classroom' });
        return;
    }

    const materials = await Material.find({ classroom: req.params.classroomId }).sort({ createdAt: -1 });

    res.json(materials);
};

module.exports = { addMaterial, getMaterials };
