const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: false },
    slug: { type: String, required: false },
    previousSlugs: [{ type: String }],
    image: { type: String, required: false },
    imageAlt: { type: String, required: false },
    category: { type: [String], required: false, default: [] },
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
    status: { type: String, default: 'published' },
    createdAt: { type: Date, default: Date.now }
});
newsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        if (ret.image && ret.image.includes('res.cloudinary.com')) {
            // Apply Cloudinary optimization to reduce image size by 90% (WebP format)
            if (!ret.image.includes('f_auto') && ret.image.includes('/upload/')) {
                ret.image = ret.image.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
            }
        }
        return ret;
    }
});

module.exports = mongoose.model('News', newsSchema);
