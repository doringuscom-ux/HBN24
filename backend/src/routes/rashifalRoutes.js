const express = require('express');
const router = express.Router();
const Rashifal = require('../../models/Rashifal');
const authMiddleware = require('../middleware/authMiddleware');

const defaultZodiacs = [
    { id: 0, sign: 'Aries', hindi: 'मेष राशि', desc: 'आज का दिन आपके लिए ऊर्जावान रहेगा। नए कार्यों की शुरुआत करने के लिए समय अनुकूल है। स्वास्थ्य पर ध्यान दें।' },
    { id: 1, sign: 'Taurus', hindi: 'वृषभ राशि', desc: 'आर्थिक मामलों में सावधानी बरतें। किसी पुराने मित्र से मुलाकात हो सकती है। परिवार में शांति का माहौल रहेगा।' },
    { id: 2, sign: 'Gemini', hindi: 'मिथुन राशि', desc: 'रचनात्मक कार्यों में आपकी रुचि बढ़ेगी। कार्यस्थल पर आपको नए मौके मिलेंगे। वाणी पर संयम रखें।' },
    { id: 3, sign: 'Cancer', hindi: 'कर्क राशि', desc: 'आज आप भावनात्मक रूप से मजबूत रहेंगे। रुके हुए काम पूरे होने की संभावना है। सेहत में सुधार होगा।' },
    { id: 4, sign: 'Leo', hindi: 'सिंह राशि', desc: 'आज आप आत्मविश्वास से भरे रहेंगे। करियर में नई ऊंचाइयों को छू सकते हैं। विवादों से दूर रहें।' },
    { id: 5, sign: 'Virgo', hindi: 'कन्या राशि', desc: 'परिश्रम का फल मिलेगा। व्यापार में लाभ की संभावना है। जीवनसाथी के साथ समय बिताने का मौका मिलेगा।' },
    { id: 6, sign: 'Libra', hindi: 'तुला राशि', desc: 'मानसिक शांति मिलेगी। किसी धार्मिक यात्रा पर जाने का प्लान बन सकता है। पैसों के लेन-देन में सावधानी बरतें।' },
    { id: 7, sign: 'Scorpio', hindi: 'वृश्चिक राशि', desc: 'हर काम सावधानी से करें, भावनाओं में बह कर फैसला करने से बचें, काम करने का तरीका बदलें लाभ होगा, अचानक धन लाभ के अवसर मिलेंगे।' },
    { id: 8, sign: 'Sagittarius', hindi: 'धनु राशि', desc: 'पारिवारिक जीवन में सुख-शांति रहेगी। आपके काम की प्रशंसा होगी। खान-पान पर ध्यान दें और क्रोध से बचें।' },
    { id: 9, sign: 'Capricorn', hindi: 'मकर राशि', desc: 'मेहनत का सकारात्मक परिणाम मिलेगा। कोई शुभ समाचार प्राप्त हो सकता है। क्रोध पर नियंत्रण रखें।' },
    { id: 10, sign: 'Aquarius', hindi: 'कुंभ राशि', desc: 'सामाजिक कार्यों में आपकी हिस्सेदारी बढ़ेगी। दोस्तों का सहयोग मिलेगा। स्वास्थ्य सामान्य रहेगा।' },
    { id: 11, sign: 'Pisces', hindi: 'मीन राशि', desc: 'आज आपको मानसिक संतोष मिलेगा। कला और संगीत में रुचि बढ़ेगी। धन लाभ के योग बन रहे हैं।' }
];

// @route   GET /api/rashifal
// @desc    Get the current rashifal data
// @access  Public
router.get('/', async (req, res) => {
    try {
        let rashifal = await Rashifal.findOne().sort({ date: -1 });
        if (!rashifal) {
            // Return defaults if none in DB
            return res.json({ signs: defaultZodiacs });
        }
        res.json(rashifal);
    } catch (error) {
        console.error('Error fetching rashifal:', error);
        res.status(500).json({ message: 'Server error fetching rashifal' });
    }
});

// @route   POST /api/rashifal
// @desc    Update or create rashifal data
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { signs } = req.body;
        if (!signs || !Array.isArray(signs) || signs.length !== 12) {
            return res.status(400).json({ message: 'Invalid signs data. Expected array of 12 signs.' });
        }

        // We only keep one document to serve the latest
        let rashifal = await Rashifal.findOne();
        
        if (rashifal) {
            rashifal.signs = signs;
            rashifal.date = Date.now();
            await rashifal.save();
        } else {
            rashifal = new Rashifal({ signs });
            await rashifal.save();
        }

        res.json({ message: 'Rashifal updated successfully', data: rashifal });
    } catch (error) {
        console.error('Error updating rashifal:', error);
        res.status(500).json({ message: 'Server error updating rashifal' });
    }
});

// @route   POST /api/rashifal/generate-ai
// @desc    Auto-generate today's rashifal using AI
// @access  Private (Admin only)
router.post('/generate-ai', authMiddleware, async (req, res) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

        if (!apiKey) {
            return res.status(500).json({ message: 'OpenRouter API Key missing' });
        }

        const dateStr = new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const promptText = `You are an expert Hindu astrologer. Generate the daily horoscope (Rashifal) for today (${dateStr}) in Hindi for all 12 zodiac signs.
Return EXACTLY a valid JSON array of objects. Do not use any markdown formatting, code blocks, or extra text.
The JSON array should have exactly 12 objects, ordered from Aries to Pisces.
Each object must have this exact structure:
{
  "id": number (0 to 11, matching the traditional zodiac order where Aries=0, Taurus=1, etc.),
  "sign": "English Sign Name",
  "hindi": "Hindi Sign Name (e.g., मेष राशि)",
  "desc": "Today's prediction in Hindi (around 20-30 words, make it sound authentic and based on daily planetary movements)."
}`;

        let signs;
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
                        messages: [ { role: 'user', content: promptText } ]
                    })
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                let aiMessage = data.choices[0].message.content.trim();
                
                // Robust JSON extraction
                let jsonStr = aiMessage;
                const jsonMatch = aiMessage.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                } else {
                    jsonStr = aiMessage.replace(/```json/g, '').replace(/```/g, '').trim();
                }

                jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1'); // Fix trailing commas

                signs = JSON.parse(jsonStr);

                if (!Array.isArray(signs) || signs.length !== 12) {
                    throw new Error('AI returned invalid format. Expected exactly 12 signs.');
                }
                
                lastError = null;
                break; // Success
            } catch (err) {
                lastError = err;
                console.error(`AI Fetch/Parse attempt ${i + 1} failed:`, err.message);
                if (i < 2) await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (lastError) {
            return res.status(500).json({ message: 'Error from AI service or invalid format after retries' });
        }

        // Save to DB
        let rashifal = await Rashifal.findOne();
        if (rashifal) {
            rashifal.signs = signs;
            rashifal.date = Date.now();
            await rashifal.save();
        } else {
            rashifal = new Rashifal({ signs });
            await rashifal.save();
        }

        res.json({ message: 'Rashifal auto-generated successfully!', data: rashifal });

    } catch (error) {
        console.error('Error generating AI rashifal:', error);
        res.status(500).json({ message: 'Server error generating AI rashifal' });
    }
});

module.exports = router;
