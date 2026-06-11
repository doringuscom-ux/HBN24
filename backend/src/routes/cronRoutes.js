const express = require('express');
const router = express.Router();
const Rashifal = require('../../models/Rashifal');
const Suvichar = require('../../models/Suvichar');
const Panchang = require('../../models/Panchang');

const generateAiWithRetry = async (promptText, model, apiKey) => {
    let lastError = null;
    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: promptText }]
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err) {
            lastError = err;
            console.error(`AI Fetch attempt ${i + 1} failed:`, err.message);
            if (i < 2) await new Promise(r => setTimeout(r, 2000));
        }
    }
    throw lastError;
};

// @route   GET /api/cron/daily-update
// @desc    Triggered by Vercel Cron to generate daily content
// @access  Public (Protected by CRON_SECRET if set)
router.get('/daily-update', async (req, res) => {
    // Optional basic security for cron route
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET) {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ message: 'Unauthorized cron request' });
        }
    }

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

        if (!apiKey) {
            return res.status(500).json({ message: 'OpenRouter API Key missing' });
        }

        const dateStr = new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // 1. Generate Panchang
        try {
            const panchangPrompt = `You are a Hindu Panchang expert. For today's date (${dateStr}), provide the traditional Hindu calendar details in Hindi. Provide EXACTLY a valid JSON object with no markdown and no extra text. Format: {"tithi": "ज्येष्ठ कृष्ण पक्ष, तृतीया", "samvat": "विक्रम संवत 2083 • बुधवार"}`;
            const panchangRes = await generateAiWithRetry(panchangPrompt, model, apiKey);
            let jsonStr = panchangRes.replace(/```json/g, '').replace(/```/g, '').trim();
            const pData = JSON.parse(jsonStr);
            if (pData.tithi && pData.samvat) {
                let panchang = await Panchang.findOne();
                if (panchang) {
                    panchang.tithi = pData.tithi;
                    panchang.samvat = pData.samvat;
                    panchang.date = Date.now();
                    await panchang.save();
                } else {
                    await new Panchang(pData).save();
                }
            }
        } catch (e) {
            console.error('Failed to update Panchang via cron:', e);
        }

        // 2. Generate Rashifal
        try {
            const rashifalPrompt = `You are an expert Hindu astrologer. Generate the daily horoscope (Rashifal) for today (${dateStr}) in Hindi for all 12 zodiac signs.\nReturn EXACTLY a valid JSON array of objects. Do not use any markdown formatting, code blocks, or extra text.\nThe JSON array should have exactly 12 objects, ordered from Aries to Pisces.\nEach object must have this exact structure:\n{\n  "id": number (0 to 11),\n  "sign": "English Sign Name",\n  "hindi": "Hindi Sign Name",\n  "desc": "Today's prediction in Hindi (around 20-30 words)."\n}`;
            const rashifalRes = await generateAiWithRetry(rashifalPrompt, model, apiKey);
            let jsonStr = rashifalRes;
            const jsonMatch = rashifalRes.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) jsonStr = jsonMatch[0];
            else jsonStr = rashifalRes.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
            const signs = JSON.parse(jsonStr);

            if (Array.isArray(signs) && signs.length === 12) {
                let rashifal = await Rashifal.findOne();
                if (rashifal) {
                    rashifal.signs = signs;
                    rashifal.date = Date.now();
                    await rashifal.save();
                } else {
                    await new Rashifal({ signs }).save();
                }
            }
        } catch (e) {
            console.error('Failed to update Rashifal via cron:', e);
        }

        // 3. Generate Suvichar
        try {
            const suvicharPrompt = `Generate a beautiful, inspiring daily thought (Suvichar) in Hindi. Strict rules: It MUST be exactly 15 to 18 words long. It MUST be short enough to fit comfortably in 2 to 3 lines. Only return the pure Hindi text, without any quotes, labels, markdown formatting, or English translations.`;
            const suvicharText = await generateAiWithRetry(suvicharPrompt, model, apiKey);
            let suvichar = await Suvichar.findOne();
            if (suvichar) {
                suvichar.text = suvicharText;
                suvichar.date = Date.now();
                await suvichar.save();
            } else {
                await new Suvichar({ text: suvicharText }).save();
            }
        } catch (e) {
            console.error('Failed to update Suvichar via cron:', e);
        }

        res.json({ message: 'Daily cron update completed successfully' });
    } catch (error) {
        console.error('Daily cron update error:', error);
        res.status(500).json({ message: 'Server error during daily update' });
    }
});

module.exports = router;
