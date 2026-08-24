const fs = require('fs');
let c = fs.readFileSync('src/pages/Epaper.jsx', 'utf8');
c = c.replace(/const res = await fetch\('\/api\/suvichar'\);\s+if \(res.ok\) \{\s+const data = await res.json\(\);\s+if \(data && data.text\)/, 
`const res = await fetch('/api/suvichar');
                if (res.ok) {
                    const dataArray = await res.json();
                    const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
                    if (data && data.text)`);
c = c.replace(/const res = await fetch\('\/api\/panchang'\);\s+if \(res.ok\) \{\s+const data = await res.json\(\);\s+if \(data && data.tithi\)/, 
`const res = await fetch('/api/panchang');
                if (res.ok) {
                    const dataArray = await res.json();
                    const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
                    if (data && data.tithi)`);
fs.writeFileSync('src/pages/Epaper.jsx', c);
console.log('Fixed array handling in Epaper.jsx');
