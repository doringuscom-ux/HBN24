const express = require('express');
const router = express.Router();
const Suvichar = require('../../models/Suvichar');
const authMiddleware = require('../middleware/authMiddleware');

const defaultSuvichar = 'मंजिलें क्या हैं, रास्ता क्या है? हौसला हो तो फासला क्या है?';

// @route   GET /api/suvichar
// @desc    Get the current suvichar data
// @access  Public
router.get('/', async (req, res) => {
    try {
        let suvichar = await Suvichar.findOne().sort({ date: -1 });
        if (!suvichar) {
            return res.json({ text: defaultSuvichar });
        }
        res.json(suvichar);
    } catch (error) {
        console.error('Error fetching suvichar:', error);
        res.status(500).json({ message: 'Server error fetching suvichar' });
    }
});

// @route   POST /api/suvichar
// @desc    Update or create suvichar data
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ message: 'Invalid suvichar text.' });
        }

        let suvichar = await Suvichar.findOne();
        
        if (suvichar) {
            suvichar.text = text;
            suvichar.date = Date.now();
            await suvichar.save();
        } else {
            suvichar = new Suvichar({ text });
            await suvichar.save();
        }

        res.json({ message: 'Suvichar updated successfully', data: suvichar });
    } catch (error) {
        console.error('Error updating suvichar:', error);
        res.status(500).json({ message: 'Server error updating suvichar' });
    }
});

// @route   POST /api/suvichar/generate-ai
// @desc    Auto-generate today's suvichar using AI
// @access  Private (Admin only)
router.post('/generate-ai', authMiddleware, async (req, res) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

        if (!apiKey) {
            return res.status(500).json({ message: 'OpenRouter API Key missing' });
        }

        const promptText = `Generate a beautiful, inspiring daily thought (Suvichar) in Hindi. Strict rules: It MUST be exactly 15 to 18 words long. It MUST be short enough to fit comfortably in 2 to 3 lines. Only return the pure Hindi text, without any quotes, labels, markdown formatting, or English translations.`;

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

        if (!response.ok) {
            const errText = await response.text();
            console.error('AI Error:', errText);
            return res.status(500).json({ message: 'Error from AI service' });
        }

        const data = await response.json();
        let aiMessage = data.choices[0].message.content.trim();
        
        // Cleanup AI response just in case
        let text = aiMessage.replace(/["']/g, '').replace(/^सुविचार:?\s*/i, '').trim();

        if (!text) {
            return res.status(500).json({ message: 'AI returned empty response.' });
        }

        // Save to DB
        let suvichar = await Suvichar.findOne();
        if (suvichar) {
            suvichar.text = text;
            suvichar.date = Date.now();
            await suvichar.save();
        } else {
            suvichar = new Suvichar({ text });
            await suvichar.save();
        }

        res.json({ message: 'Suvichar auto-generated successfully!', data: suvichar });

    } catch (error) {
        console.error('Error generating AI suvichar:', error);
        res.status(500).json({ message: 'Server error generating AI suvichar' });
    }
});

module.exports = router;
