const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    text: { type: String, required: true },
    emoji: { type: String, default: '' },
    initialVotes: { type: Number, default: 0 },
    realVotes: { type: Number, default: 0 }
});

const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [OptionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Poll', PollSchema);
