const mongoose = require('mongoose');

const breakingNewsSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BreakingNews', breakingNewsSchema);
