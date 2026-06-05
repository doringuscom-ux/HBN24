const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hbn24';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Models
const News = require('./models/News');

const Parser = require('rss-parser');
const parser = new Parser();

// Routes
const epaperRoutes = require('./src/routes/epaperRoutes');
const authRoutes = require('./src/routes/authRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const rashifalRoutes = require('./src/routes/rashifalRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');

app.use('/api/epaper', epaperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rashifal', rashifalRoutes);

// Add a root route so Vercel doesn't show "Cannot GET /"
app.get('/', (req, res) => {
    res.send('HBN24 Backend API is running successfully!');
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

app.post('/api/news', authMiddleware, async (req, res) => {
    try {
        const newNews = new News(req.body);
        const savedNews = await newNews.save();
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

        const fetchShorts = async () => {
            const response = await fetch('https://www.youtube.com/@HBNNews24x7/shorts');
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

        const [videos, shorts] = await Promise.all([fetchVideos(), fetchShorts()]);
        
        res.json({ videos, shorts });
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

// Start Server
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB successfully');
        await seedAdmin(); // Ensure default admin exists
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Required for Vercel serverless deployment
module.exports = app;
