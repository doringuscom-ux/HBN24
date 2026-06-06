const mongoose = require('mongoose');

const globalSeoSchema = new mongoose.Schema({
    siteTitle: { type: String, default: 'HBN24 News' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    robots: { type: String, default: 'index, follow' },
    googleAnalyticsId: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GlobalSeo', globalSeoSchema);
