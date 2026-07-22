const mongoose = require('mongoose');

const epaperSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    editionName: {
        type: String,
        default: 'Main Edition'
    },
    pages: [{
        type: String, // Array of image URLs
        required: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Epaper', epaperSchema);
