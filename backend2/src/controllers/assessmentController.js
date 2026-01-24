const Assessment = require('../models/Assessment');

// @desc    Get user assessments (created by teacher)
// @route   GET /api/assessment
// @access  Private
const getAssessments = async (req, res) => {
    // If teacher, return assessments they created
    // If student, return assessments for their classes (todo: add student logic)
    const assessments = await Assessment.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(assessments);
};

// @desc    Create new assessment
// @route   POST /api/assessment
// @access  Private/Teacher
const createAssessment = async (req, res) => {
    const { title, dueDate, questions, type, classId } = req.body;

    const assessment = await Assessment.create({
        title,
        dueDate,
        questionCount: typeof questions === 'number' ? questions : (questions?.length || 0), // Handle both number input and array input
        type,
        classId,
        createdBy: req.user._id,
        status: 'Draft'
    });

    res.status(201).json(assessment);
};

// @desc    Update assessment status
// @route   PUT /api/assessment/:id
// @access  Private/Teacher
const updateAssessment = async (req, res) => {
    const assessment = await Assessment.findById(req.params.id);

    if (assessment) {
        if (assessment.createdBy.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        assessment.status = req.body.status || assessment.status;
        const updatedAssessment = await assessment.save();
        res.json(updatedAssessment);
    } else {
        res.status(404).json({ message: 'Assessment not found' });
    }
};

module.exports = { getAssessments, createAssessment, updateAssessment };
