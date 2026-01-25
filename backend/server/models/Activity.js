const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String, // material, assessment, badge
    title: String,
    time: String // or Date
});

module.exports = mongoose.model('Activity', activitySchema);
