const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type:   { type: String, default: 'general' }, // material, assessment, badge, general
    title:  { type: String, default: '' },
    time:   { type: String, default: '' }
// FIX: timestamps: true adds createdAt/updatedAt so Activity.sort({ createdAt: -1 }) works
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
