const mongoose = require('mongoose');

const dailyTipSchema = new mongoose.Schema({
    title:   { type: String, default: 'Daily Tip' },
    content: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DailyTip', dailyTipSchema);
