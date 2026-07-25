const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    improvementData: [{
        subject:  { type: String, default: '' },
        score:    { type: Number, default: 0 },
        improved: { type: Number, default: 0 }
    }],
    skillData: [{
        name:     { type: String, default: '' },
        progress: { type: Number, default: 0 }
    }],
    strengths:      [{ type: String }],
    areasToExplore: [{ type: String }],
    beforeStats: [{ label: String, value: Number, display: String }],
    afterStats:  [{ label: String, value: Number, display: String }],
    submissionHistory: [{ date: String, count: { type: Number, default: 1 } }],
    // FIX: added default: 0 on all numeric subfields so they are never undefined
    problemStats: {
        easy:   { solved: { type: Number, default: 0 }, total: { type: Number, default: 100 } },
        medium: { solved: { type: Number, default: 0 }, total: { type: Number, default: 80 } },
        hard:   { solved: { type: Number, default: 0 }, total: { type: Number, default: 30 } },
        total:  { solved: { type: Number, default: 0 }, total: { type: Number, default: 210 } }
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
