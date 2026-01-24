const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activeClasses: {
        count: Number,
        newMaterial: Number
    },
    pendingInvites: {
        count: Number,
        actionRequired: Boolean
    },
    weeklyGoal: {
        progress: Number,
        status: String
    }
});

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);
