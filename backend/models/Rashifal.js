const mongoose = require('mongoose');

const rashifalSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    signs: [
        {
            id: { type: Number, required: true },
            sign: { type: String, required: true },
            hindi: { type: String, required: true },
            desc: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model('Rashifal', rashifalSchema);
