const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

    console.log("Using key:", apiKey?.substring(0, 10) + "...");
    console.log("Using model:", model);

    const promptText = `You are an expert SEO specialist for a Hindi News Portal named 'HBN24'. 
Generate SEO metadata for the static page: Home Page (URL: /).
Ensure the output is ONLY a valid JSON object without any markdown formatting, code blocks, or extra text.

Return EXACTLY this JSON structure:
{
  "metaTitle": "A catchy, SEO-friendly title under 60 characters",
  "metaDescription": "A compelling summary under 160 characters",
  "metaKeywords": "comma, separated, relevant, keywords, max 10"
}`;

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

        if (response.ok) {
            const data = await response.json();
            console.log("Response OK!");
            console.log(data.choices[0].message.content);
        } else {
            console.log("Response not OK:", response.status);
            console.log(await response.text());
        }
    } catch (e) {
        console.error("Error:", e);
    }
};

test();
