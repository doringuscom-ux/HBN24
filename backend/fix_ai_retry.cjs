const fs = require('fs');

const rashifalPath = 'd:/Rakesh React/HBN24/backend/src/routes/rashifalRoutes.js';
let rashifalContent = fs.readFileSync(rashifalPath, 'utf8');

const rashifalOldFetch = `        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${apiKey}\`,
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
        
        // Robust JSON extraction
        let jsonStr = aiMessage;
        const jsonMatch = aiMessage.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        } else {
            // fallback cleanup
            jsonStr = aiMessage.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        }

        const signs = JSON.parse(jsonStr);

        if (!Array.isArray(signs) || signs.length !== 12) {
            return res.status(500).json({ message: 'AI returned invalid format. Expected exactly 12 signs.' });
        }`;

const rashifalNewFetch = `        let signs;
        let lastError = null;
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${apiKey}\`,
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
                const jsonMatch = aiMessage.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                } else {
                    jsonStr = aiMessage.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                }

                jsonStr = jsonStr.replace(/,\\s*([\\]}])/g, '$1'); // Fix trailing commas

                signs = JSON.parse(jsonStr);

                if (!Array.isArray(signs) || signs.length !== 12) {
                    throw new Error('AI returned invalid format. Expected exactly 12 signs.');
                }
                
                lastError = null;
                break; // Success
            } catch (err) {
                lastError = err;
                console.error(\`AI Fetch/Parse attempt \${i + 1} failed:\`, err.message);
                if (i < 2) await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (lastError) {
            return res.status(500).json({ message: 'Error from AI service or invalid format after retries' });
        }`;

rashifalContent = rashifalContent.replace(rashifalOldFetch, rashifalNewFetch);
fs.writeFileSync(rashifalPath, rashifalContent);


const suvicharPath = 'd:/Rakesh React/HBN24/backend/src/routes/suvicharRoutes.js';
let suvicharContent = fs.readFileSync(suvicharPath, 'utf8');

const suvicharOldFetch = `        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${apiKey}\`,
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
        const text = data.choices[0].message.content.trim();`;

const suvicharNewFetch = `        let text;
        let lastError = null;
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${apiKey}\`,
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
                text = data.choices[0].message.content.trim();
                
                lastError = null;
                break;
            } catch (err) {
                lastError = err;
                console.error(\`Suvichar AI attempt \${i + 1} failed:\`, err.message);
                if (i < 2) await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (lastError) {
             return res.status(500).json({ message: 'Error from AI service after retries' });
        }`;

suvicharContent = suvicharContent.replace(suvicharOldFetch, suvicharNewFetch);
fs.writeFileSync(suvicharPath, suvicharContent);

console.log('Successfully updated AI generation routes with retry logic.');
