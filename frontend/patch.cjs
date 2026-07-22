const fs = require('fs');
const files = ['TechnologySection.jsx', 'BusinessSection.jsx', 'LifestyleSection.jsx', 'ReligionSection.jsx', 'SportsSection.jsx'];
files.forEach(file => {
    const p = 'src/components/' + file;
    let code = fs.readFileSync(p, 'utf8');
    if(!code.includes('optimizeImage')) {
        code = code.replace(/import \{ Link \} from 'react-router-dom';/, `import { Link } from 'react-router-dom';\nimport { optimizeImage } from '../utils/imageOptimizer';`);
        code = code.replace(/const safeNews = \(index\) => \{/, `const safeNews = (index, width = 300) => {`);
        code = code.replace(/image: news\[index\]\.image/, `image: optimizeImage(news[index].image, width)`);
        code = code.replace(/const mainNews = safeNews\(0\);/, `const mainNews = safeNews(0, 600);`);
        fs.writeFileSync(p, code);
        console.log('Updated ' + file);
    }
});
