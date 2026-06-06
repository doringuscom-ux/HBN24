const express = require('express');
const router = express.Router();
const GlobalSeo = require('../../models/GlobalSeo');
const News = require('../../models/News');
const PageSeo = require('../../models/PageSeo');
const authMiddleware = require('../middleware/authMiddleware');

let bulkStatus = {
    isRunning: false,
    total: 0,
    processed: 0,
    success: 0,
    failed: 0
};

// Get Global SEO settings
router.get('/', async (req, res) => {
    try {
        let seo = await GlobalSeo.findOne();
        if (!seo) {
            // Create default if it doesn't exist
            seo = new GlobalSeo();
            await seo.save();
        }
        res.json(seo);
    } catch (error) {
        console.error('Error fetching global SEO:', error);
        res.status(500).json({ message: 'Server error fetching SEO settings' });
    }
});

// Update Global SEO settings
router.post('/', authMiddleware, async (req, res) => {
    try {
        let seo = await GlobalSeo.findOne();
        if (seo) {
            seo.siteTitle = req.body.siteTitle;
            seo.metaDescription = req.body.metaDescription;
            seo.metaKeywords = req.body.metaKeywords;
            seo.robots = req.body.robots;
            seo.googleAnalyticsId = req.body.googleAnalyticsId;
            seo.updatedAt = Date.now();
            await seo.save();
        } else {
            seo = new GlobalSeo(req.body);
            await seo.save();
        }
        res.json({ message: 'SEO settings updated successfully', seo });
    } catch (error) {
        console.error('Error updating global SEO:', error);
        res.status(500).json({ message: 'Server error updating SEO settings' });
    }
});

// Auto-generate SEO using OpenRouter AI
router.post('/generate-ai', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title && !content) {
            return res.status(400).json({ message: 'Title or Content is required to generate SEO.' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

        if (!apiKey) {
            return res.status(500).json({ message: 'OpenRouter API Key is missing in backend configuration.' });
        }

        // Clean content from HTML tags for better AI understanding
        const cleanContent = content ? content.replace(/<[^>]*>?/gm, ' ') : '';
        const promptText = `
You are an expert SEO specialist. Based on the following news article title and content, generate SEO metadata.
Ensure the output is ONLY a valid JSON object without any markdown formatting, code blocks, or extra text.

Title: ${title}
Content: ${cleanContent.substring(0, 3000)}

Return EXACTLY this JSON structure and nothing else:
{
  "metaTitle": "A catchy, SEO-friendly title under 60 characters",
  "metaDescription": "A compelling summary under 160 characters",
  "metaKeywords": "comma, separated, relevant, keywords, max 10"
}
`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: promptText }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', errorText);
            return res.status(500).json({ message: 'Error from AI service.' });
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        
        // Sometimes AI wraps JSON in ```json ... ``` blocks, so we parse carefully
        let jsonStr = aiMessage.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const seoResult = JSON.parse(jsonStr);
        res.json(seoResult);

    } catch (error) {
        console.error('Error generating AI SEO:', error);
        res.status(500).json({ message: 'Server error while generating SEO.' });
    }
});

// Bulk AI SEO Generator routes
router.get('/missing-count', authMiddleware, async (req, res) => {
    try {
        const count = await News.countDocuments({
            $or: [
                { metaDescription: { $exists: false } },
                { metaDescription: "" }
            ]
        });
        res.json({ missingCount: count });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching count' });
    }
});

router.get('/bulk-status', authMiddleware, (req, res) => {
    res.json(bulkStatus);
});

router.post('/start-bulk', authMiddleware, async (req, res) => {
    if (bulkStatus.isRunning) {
        return res.status(400).json({ message: 'A bulk process is already running.' });
    }
    
    try {
        const articles = await News.find({
            $or: [
                { metaDescription: { $exists: false } },
                { metaDescription: "" }
            ]
        });

        if (articles.length === 0) {
            return res.json({ message: 'No articles missing SEO found.' });
        }

        bulkStatus = {
            isRunning: true,
            total: articles.length,
            processed: 0,
            success: 0,
            failed: 0,
            type: 'articles'
        };

        // Start background async process
        processBulkSeo(articles);

        res.json({ message: 'Background AI SEO Generation started', status: bulkStatus });
    } catch (err) {
        res.status(500).json({ message: 'Error starting bulk process.' });
    }
});

async function processBulkSeo(articles) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

    if (!apiKey) {
        bulkStatus.isRunning = false;
        return;
    }

    for (let i = 0; i < articles.length; i++) {
        // Stop if status was somehow reset
        if (!bulkStatus.isRunning) break;
        
        const article = articles[i];
        try {
            const cleanContent = article.content ? article.content.replace(/<[^>]*>?/gm, ' ') : '';
            if (!article.title && !cleanContent) {
                bulkStatus.processed++;
                bulkStatus.failed++;
                continue;
            }

            const promptText = `You are an expert SEO specialist. Based on the following news article title and content, generate SEO metadata.
Ensure the output is ONLY a valid JSON object without any markdown formatting, code blocks, or extra text.

Title: ${article.title}
Content: ${cleanContent.substring(0, 3000)}

Return EXACTLY this JSON structure and nothing else:
{
  "metaTitle": "A catchy, SEO-friendly title under 60 characters",
  "metaDescription": "A compelling summary under 160 characters",
  "metaKeywords": "comma, separated, relevant, keywords, max 10"
}`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [ { role: 'user', content: promptText } ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage = data.choices[0].message.content;
                let jsonStr = aiMessage.trim();
                if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
                else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();

                const seoResult = JSON.parse(jsonStr);
                
                article.metaTitle = seoResult.metaTitle || article.metaTitle;
                article.metaDescription = seoResult.metaDescription || '';
                article.metaKeywords = seoResult.metaKeywords || '';
                await article.save();
                
                bulkStatus.success++;
            } else {
                bulkStatus.failed++;
            }
        } catch (error) {
            console.error('Error generating AI SEO for article', article._id, error);
            bulkStatus.failed++;
        }
        
        bulkStatus.processed++;
        
        // Wait 2.5 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    bulkStatus.isRunning = false;
}

// Page SEO routes
router.get('/pages', async (req, res) => {
    try {
        const pages = await PageSeo.find();
        res.json(pages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching page SEOs' });
    }
});

router.post('/pages', authMiddleware, async (req, res) => {
    try {
        const { pageUrl, metaTitle, metaDescription, metaKeywords, robots } = req.body;
        if (!pageUrl) return res.status(400).json({ message: 'Page URL is required' });

        let pageSeo = await PageSeo.findOne({ pageUrl });
        if (pageSeo) {
            pageSeo.metaTitle = metaTitle;
            pageSeo.metaDescription = metaDescription;
            pageSeo.metaKeywords = metaKeywords;
            pageSeo.robots = robots || 'index, follow';
            pageSeo.updatedAt = Date.now();
            await pageSeo.save();
        } else {
            pageSeo = new PageSeo({ pageUrl, metaTitle, metaDescription, metaKeywords, robots });
            await pageSeo.save();
        }
        res.json({ message: 'Page SEO saved', pageSeo });
    } catch (err) {
        res.status(500).json({ message: 'Error saving page SEO' });
    }
});

// Generate Static Pages AI (Background)
router.post('/generate-static-pages', authMiddleware, async (req, res) => {
    if (bulkStatus.isRunning) {
        return res.status(400).json({ message: 'A bulk process is already running.' });
    }

    try {
        const staticPages = [
            { url: '/', title: 'Home Page' },
            { url: '/entertainment', title: 'Entertainment News' },
            { url: '/religion', title: 'Religion and Spirituality News' },
            { url: '/sports', title: 'Sports News' },
            { url: '/lifestyle', title: 'Lifestyle and Health News' },
            { url: '/business', title: 'Business and Finance News' },
            { url: '/technology', title: 'Technology News' },
            { url: '/epaper', title: 'E-Paper and Print Edition' }
        ];

        bulkStatus = {
            isRunning: true,
            total: staticPages.length,
            processed: 0,
            success: 0,
            failed: 0,
            type: 'static_pages'
        };

        // Start background async process
        processStaticPagesSeo(staticPages);

        res.json({ message: 'Background AI SEO Generation started for static pages', status: bulkStatus });
    } catch (err) {
        console.error('Error starting static pages SEO process:', err);
        res.status(500).json({ message: 'Server error starting static pages SEO' });
    }
});

async function processStaticPagesSeo(staticPages) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

    if (!apiKey) {
        bulkStatus.isRunning = false;
        return;
    }

    for (const page of staticPages) {
        if (!bulkStatus.isRunning) break;

        try {
            const promptText = `You are an expert SEO specialist for a Hindi News Portal named 'HBN24'. 
Generate SEO metadata for the static page: ${page.title} (URL: ${page.url}).
Ensure the output is ONLY a valid JSON object without any markdown formatting, code blocks, or extra text.

Return EXACTLY this JSON structure:
{
  "metaTitle": "A catchy, SEO-friendly title under 60 characters",
  "metaDescription": "A compelling summary under 160 characters",
  "metaKeywords": "comma, separated, relevant, keywords, max 10"
}`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [ { role: 'user', content: promptText } ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                let jsonStr = data.choices[0].message.content.trim();
                if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
                else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();

                const seoResult = JSON.parse(jsonStr);

                let pageSeo = await PageSeo.findOne({ pageUrl: page.url });
                if (pageSeo) {
                    pageSeo.metaTitle = seoResult.metaTitle;
                    pageSeo.metaDescription = seoResult.metaDescription;
                    pageSeo.metaKeywords = seoResult.metaKeywords;
                    pageSeo.updatedAt = Date.now();
                } else {
                    pageSeo = new PageSeo({
                        pageUrl: page.url,
                        metaTitle: seoResult.metaTitle,
                        metaDescription: seoResult.metaDescription,
                        metaKeywords: seoResult.metaKeywords
                    });
                }
                await pageSeo.save();
                bulkStatus.success++;
            } else {
                bulkStatus.failed++;
            }
        } catch (error) {
            console.error('Error generating AI SEO for static page', page.url, error);
            bulkStatus.failed++;
        }

        bulkStatus.processed++;
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    bulkStatus.isRunning = false;
}

module.exports = router;
