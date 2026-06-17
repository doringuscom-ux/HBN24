const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const webpush = require('web-push');

// Configure web-push
webpush.setVapidDetails(
    'mailto:contact@hbnnews24.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hbn24';

// Middleware
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Models
const News = require('./models/News');
const Comment = require('./models/Comment');
const Subscription = require('./src/models/Subscription');

const Parser = require('rss-parser');
const parser = new Parser();

// Serverless connection middleware
app.use(async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log('Connected to MongoDB successfully (Serverless)');
            await seedAdmin(); // Ensure default admin exists
        }
        next();
    } catch (error) {
        console.error('MongoDB connection error in middleware:', error);
        res.status(500).json({ message: 'Database connection error' });
    }
});

// Routes
const epaperRoutes = require('./src/routes/epaperRoutes');
const authRoutes = require('./src/routes/authRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const rashifalRoutes = require('./src/routes/rashifalRoutes');
const seoRoutes = require('./src/routes/seoRoutes');
const suvicharRoutes = require('./src/routes/suvicharRoutes');
const panchangRoutes = require('./src/routes/panchangRoutes');
const cronRoutes = require('./src/routes/cronRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');

app.use('/api/epaper', epaperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rashifal', rashifalRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/suvichar', suvicharRoutes);
app.use('/api/panchang', panchangRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/contact', contactRoutes);

// Add a root route so Vercel doesn't show "Cannot GET /"
app.get('/', (req, res) => {
    res.send('HBN24 Backend API is running successfully!');
});

// Notifications Route
app.post('/api/notifications/subscribe', async (req, res) => {
    try {
        const subscription = req.body;
        // Check if exists
        const existing = await Subscription.findOne({ endpoint: subscription.endpoint });
        if (!existing) {
            await new Subscription(subscription).save();
        }
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Server error saving subscription' });
    }
});

app.get('/sitemap.xml', async (req, res) => {
    try {
        const newsList = await News.find().sort({ createdAt: -1 });
        const baseUrl = req.query.host || (req.protocol + '://' + req.get('host'));

        const staticPages = [
            '',
            '/entertainment',
            '/religion',
            '/sports',
            '/lifestyle',
            '/business',
            '/technology',
            '/epaper'
        ];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        staticPages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${page}</loc>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        newsList.forEach(news => {
            const slug = news.slug || news._id;
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/news/${slug}</loc>\n`;
            const lastModDate = news.updatedAt || news.createdAt;
            if (lastModDate) {
                xml += `    <lastmod>${new Date(lastModDate).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const newsList = await News.find().sort({ createdAt: -1 });
        res.json(newsList);
    } catch (error) {
        console.error('Error fetching all news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cache for Homepage API
let homeCache = { data: null, timestamp: 0 };

// Optimized route for Homepage
app.get('/api/news/home', async (req, res) => {
    try {
        // Return from cache if younger than 2 minutes (120,000 ms)
        const now = Date.now();
        if (homeCache.data && (now - homeCache.timestamp < 120000)) {
            return res.json(homeCache.data);
        }
        const categories = ['sports', 'religion', 'lifestyle', 'technology', 'business', 'entertainment', 'superfast', 'featured'];
        
        // Fire parallel queries for each category + mix news + fallback news
        const queries = categories.map(cat => 
            News.find({ category: cat }).sort({ createdAt: -1 }).limit(12)
        );
        
        // Get 12 latest mix news (not in the specific categories)
        queries.push(
            News.find({ category: { $nin: categories } }).sort({ createdAt: -1 }).limit(12)
        );
        
        // Get 20 latest general news for fallbacks
        queries.push(
            News.find().sort({ createdAt: -1 }).limit(20)
        );

        const results = await Promise.all(queries);
        
        const homeData = {};
        categories.forEach((cat, index) => {
            homeData[cat] = results[index];
        });
        homeData.mixNews = results[categories.length];
        const latestFallback = results[categories.length + 1];

        // Apply fallback filling logic
        const fillNews = (categoryNews, excludeIds = new Set()) => {
            if (categoryNews.length >= 12) return categoryNews;
            const borrowed = latestFallback.filter(n => {
                if (categoryNews.some(cn => cn._id.equals(n._id))) return false;
                if (excludeIds.has(n._id.toString())) return false;
                return true;
            });
            return [...categoryNews, ...borrowed].slice(0, 12);
        };

        // Fill top sections first
        homeData.superfast = fillNews(homeData.superfast);
        homeData.featured = fillNews(homeData.featured);

        // Collect IDs to exclude from lower sections
        const topNewsIds = new Set();
        homeData.superfast.forEach(n => topNewsIds.add(n._id.toString()));
        homeData.featured.forEach(n => topNewsIds.add(n._id.toString()));

        // Fill remaining sections excluding top news
        homeData.mixNews = fillNews(homeData.mixNews, topNewsIds);
        categories.forEach(cat => {
            if (cat !== 'superfast' && cat !== 'featured') {
                homeData[cat] = fillNews(homeData[cat], topNewsIds);
            }
        });
        
        homeData.latestNews = latestFallback;

        // Update cache
        homeCache = { data: homeData, timestamp: Date.now() };

        res.json(homeData);
    } catch (error) {
        console.error('Error fetching home news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search route
app.get('/api/news/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        let searchQueryText = q;

        // Try to translate query to Hindi so English queries match Hindi content
        try {
            const { translate } = await import('@vitalets/google-translate-api');
            const translation = await translate(q, { to: 'hi' });
            searchQueryText = translation.text;
        } catch (translateError) {
            console.error('Translation failed, falling back to original query:', translateError);
        }

        // Search by regex in title, shortDescription, or content using BOTH original and translated queries
        const originalRegex = new RegExp(q, 'i');
        const translatedRegex = new RegExp(searchQueryText, 'i');

        const searchResults = await News.find({
            $or: [
                { title: originalRegex },
                { shortDescription: originalRegex },
                { content: originalRegex },
                { tags: originalRegex },
                { title: translatedRegex },
                { shortDescription: translatedRegex },
                { content: translatedRegex },
                { tags: translatedRegex }
            ]
        }).sort({ createdAt: -1 });

        res.json(searchResults);
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
});

app.get('/api/news/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const newsList = await News.find({ category }).sort({ createdAt: -1 });
        res.json(newsList);
    } catch (error) {
        console.error('Error fetching news by category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/news/article/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let article;

        // Find by ObjectId or fallback to Slug
        if (mongoose.Types.ObjectId.isValid(id)) {
            article = await News.findById(id);
        }

        // If not found by ID, try finding by slug
        if (!article) {
            article = await News.findOne({ slug: id });
        }

        // If not found by slug, try previousSlugs
        if (!article) {
            article = await News.findOne({ previousSlugs: id });
            if (article) {
                return res.json({ redirect: true, newSlug: article.slug || article._id });
            }
        }

        if (!article) return res.status(404).json({ message: 'News not found' });

        res.json(article);
    } catch (error) {
        console.error('Error fetching single article:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like an article
app.put('/api/news/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        let article;
        if (mongoose.Types.ObjectId.isValid(id)) {
            article = await News.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
        }
        if (!article) {
            article = await News.findOneAndUpdate({ slug: id }, { $inc: { likes: 1 } }, { new: true });
        }
        if (!article) return res.status(404).json({ message: 'News not found' });
        res.json({ likes: article.likes });
    } catch (error) {
        console.error('Error liking article:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get comments for an article
app.get('/api/news/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        let article;
        if (mongoose.Types.ObjectId.isValid(id)) {
            article = await News.findById(id);
        }
        if (!article) {
            article = await News.findOne({ slug: id });
        }
        if (!article) return res.status(404).json({ message: 'News not found' });

        const comments = await Comment.find({ newsId: article._id }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a comment
app.post('/api/news/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, text } = req.body;
        
        if (!name || !text) {
            return res.status(400).json({ message: 'Name and text are required' });
        }

        let article;
        if (mongoose.Types.ObjectId.isValid(id)) {
            article = await News.findById(id);
        }
        if (!article) {
            article = await News.findOne({ slug: id });
        }
        if (!article) return res.status(404).json({ message: 'News not found' });

        const newComment = new Comment({
            newsId: article._id,
            name,
            text
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a comment
app.put('/api/news/:newsId/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const updatedComment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true });
        if (!updatedComment) return res.status(404).json({ message: 'Comment not found' });
        
        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a comment
app.delete('/api/news/:newsId/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        
        if (!deletedComment) return res.status(404).json({ message: 'Comment not found' });
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/news', authMiddleware, async (req, res) => {
    try {
        if (req.body.slug) req.body.slug = req.body.slug.trim();
        
        // Ensure location is set
        if (!req.body.location || req.body.location.trim() === '') {
            req.body.location = 'नई दिल्ली';
        }

        // Set author based on logged-in admin
        if (req.admin && req.admin.id) {
            const Admin = require('./models/Admin');
            const adminUser = await Admin.findById(req.admin.id);
            if (adminUser && adminUser.username) {
                // Capitalize first letter or use as is, for simplicity use as is, or we can map 'admin' to 'एडमिन'
                req.body.author = adminUser.username === 'admin' ? 'एडमिन' : adminUser.username;
            } else {
                req.body.author = 'एडमिन';
            }
        } else {
            req.body.author = 'एडमिन';
        }

        const newNews = new News(req.body);
        const savedNews = await newNews.save();

        // Send Push Notifications in background
        const subscriptions = await Subscription.find();
        const payload = JSON.stringify({
            title: savedNews.title,
            body: savedNews.shortDescription || 'नयी खबर पढ़ें!',
            url: `https://hbnnews24.com/news/${savedNews.slug || savedNews._id}`,
            icon: 'https://hbnnews24.com/favicon.png',
            image: savedNews.image || null
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push notification failed:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid
                    Subscription.findByIdAndDelete(sub._id).exec();
                }
            });
        });

        res.status(201).json(savedNews);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/news/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const currentNews = await News.findById(id);
        if (!currentNews) return res.status(404).json({ message: 'News not found' });

        // Check if slug is being updated
        if (req.body.slug && currentNews.slug && req.body.slug !== currentNews.slug) {
            const oldSlug = currentNews.slug;
            if (!req.body.previousSlugs) {
                req.body.previousSlugs = currentNews.previousSlugs || [];
            }
            if (!req.body.previousSlugs.includes(oldSlug)) {
                req.body.previousSlugs.push(oldSlug);
            }
        }

        const updatedNews = await News.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedNews);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/news/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) return res.status(404).json({ message: 'News not found' });
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/youtube', async (req, res) => {
    try {
        const fetchVideos = async () => {
            const response = await fetch('https://www.youtube.com/@HBNNews24x7/videos');
            const html = await response.text();
            const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
            if (!match) return [];
            const ytData = JSON.parse(match[1]);
            const tabs = ytData.contents.twoColumnBrowseResultsRenderer.tabs;
            const videosTab = tabs.find(t => t.tabRenderer.title === 'Videos' || t.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.includes('/videos'));
            if (!videosTab) return [];
            const items = videosTab.tabRenderer.content.richGridRenderer.contents;
            return items.filter(item => item.richItemRenderer && (item.richItemRenderer.content.videoRenderer || item.richItemRenderer.content.lockupViewModel)).map(item => {
                const content = item.richItemRenderer.content;
                if (content.videoRenderer) {
                    const video = content.videoRenderer;
                    return {
                        videoId: video.videoId,
                        title: video.title.runs[0].text,
                        link: `https://www.youtube.com/watch?v=${video.videoId}`,
                        image: video.thumbnail.thumbnails[video.thumbnail.thumbnails.length - 1].url,
                        publishedAt: video.publishedTimeText?.simpleText || "Recently",
                        duration: video.lengthText?.simpleText || "Watch"
                    };
                } else {
                    const video = content.lockupViewModel;
                    const videoId = video.contentId;
                    const titleMatch = JSON.stringify(video).match(/"content":"([^"]+)"/);
                    const title = titleMatch ? titleMatch[1] : "YouTube Video";
                    return {
                        videoId: videoId,
                        title: title,
                        link: `https://www.youtube.com/watch?v=${videoId}`,
                        image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        publishedAt: "Recently",
                        duration: "Watch"
                    };
                }
            }).slice(0, 10);
        };

        const fetchShorts = async (url) => {
            const response = await fetch(url);
            const html = await response.text();
            const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
            if (!match) return [];
            const ytData = JSON.parse(match[1]);
            const tabs = ytData.contents.twoColumnBrowseResultsRenderer.tabs;
            const shortsTab = tabs.find(t => t.tabRenderer.title === 'Shorts' || (t.tabRenderer.endpoint && t.tabRenderer.endpoint.commandMetadata && t.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.includes('/shorts')));
            if (!shortsTab) return [];
            const items = shortsTab.tabRenderer.content.richGridRenderer.contents;
            return items.filter(item => item.richItemRenderer && item.richItemRenderer.content.shortsLockupViewModel).map(item => {
                const short = item.richItemRenderer.content.shortsLockupViewModel;
                const videoId = short.entityId.replace('shorts-shelf-item-', '');
                return {
                    videoId: videoId,
                    title: short.overlayMetadata?.primaryText?.content || short.accessibilityText || "YouTube Short",
                    link: `https://www.youtube.com/shorts/${videoId}`,
                    image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    publishedAt: "Recently",
                    duration: "Short"
                };
            }).slice(0, 10);
        };

        const [videos, shorts, news24Shorts] = await Promise.all([
            fetchVideos(), 
            fetchShorts('https://www.youtube.com/@HBNNews24x7/shorts'),
            fetchShorts('https://www.youtube.com/@News24thinkfirst/shorts')
        ]);

        res.json({ videos, shorts, news24Shorts });
    } catch (error) {
        console.error('Error fetching YouTube Data:', error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

const Admin = require('./models/Admin');

const seedAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const defaultAdmin = new Admin({
                username: 'admin',
                password: 'admin123'
            });
            await defaultAdmin.save();
            console.log('Default admin user created: admin / admin123');
        }
    } catch (err) {
        console.error('Error seeding admin user:', err);
    }
};

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
    mongoose.connect(MONGODB_URI)
        .then(async () => {
            console.log('Connected to MongoDB successfully (Local)');
            await seedAdmin();
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error);
        });
}

// Required for Vercel serverless deployment
module.exports = app;