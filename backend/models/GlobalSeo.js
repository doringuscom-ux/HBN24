const mongoose = require('mongoose');

const globalSeoSchema = new mongoose.Schema({
    siteTitle: { type: String, default: 'HBN24 News' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    robots: { type: String, default: 'index, follow' },
    googleAnalyticsId: { type: String, default: '' },
    liveTvUrl: { type: String, default: 'https://vidcdn.vidgyor.com/news24-origin/liveabr/playlist.m3u8' },
    liveTvType: { type: String, enum: ['hls', 'youtube'], default: 'hls' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GlobalSeo', globalSeoSchema);
