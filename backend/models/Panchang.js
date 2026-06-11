const mongoose = require('mongoose');

const panchangSchema = new mongoose.Schema({
    tithi: {
        type: String,
        required: true
    },
    samvat: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Panchang', panchangSchema);
