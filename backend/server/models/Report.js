const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    improvementData: [{
        subject: String,
        score: Number,
        improved: Number
    }],
    skillData: [{
        name: String,
        progress: Number
    }],
    strengths: [String],
    areasToExplore: [String],
    beforeStats: [{ label: String, value: Number, display: String }],
    afterStats: [{ label: String, value: Number, display: String }]
});

module.exports = mongoose.model('Report', reportSchema);
