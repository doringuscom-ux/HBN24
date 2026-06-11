const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: false },
    previousSlugs: [{ type: String }],
    image: { type: String, required: true },
    imageAlt: { type: String, required: false },
    category: { type: [String], required: true },
    content: { type: String, required: false },
    metaTitle: { type: String, required: false },
    metaDescription: { type: String, required: false },
    metaKeywords: { type: String, required: false },
    robots: { type: String, default: 'index, follow' },
    likes: { type: Number, default: 0 },
    canonicalUrl: { type: String, required: false },
    placement: { type: String, default: 'auto' }, // no longer required, placement is now automatic by index
    isEpaper: { type: Boolean, default: false },
    location: { type: String, default: 'नई दिल्ली' },
    author: { type: String, default: 'एडमिन' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
