const mongoose = require('mongoose');

const PageSeoSchema = new mongoose.Schema({
    pageUrl: {
        type: String,
        required: true,
        unique: true
    },
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    metaKeywords: {
        type: String,
        default: ''
    },
    robots: {
        type: String,
        default: 'index, follow'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.PageSeo || mongoose.model('PageSeo', PageSeoSchema);

