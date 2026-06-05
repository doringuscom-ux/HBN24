const fs = require('fs');
const path = require('path');

const dir = path.join('d:', 'Rakesh React', 'HBN24', 'frontend', 'src', 'components');

const filesToProcess = [
    'EntertainmentSection.jsx',
    'BusinessSection.jsx',
    'LifestyleSection.jsx',
    'ReligionSection.jsx',
    'SportsSection.jsx',
    'TechnologySection.jsx'
];

filesToProcess.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Add import { Link } from 'react-router-dom'; if not exists
        if (!content.includes('import { Link }')) {
            content = content.replace(/import React[^;]*;/, "$&\nimport { Link } from 'react-router-dom';");
        }

        // Replace div with cursor-pointer to Link
        // E.g. <div key={index} className="... cursor-pointer ..."> => <Link to={`/news/${news._id}`} key={index} className="...">
        // Note: The variable name for news item might be `news` or `item` or something else.
        // We'll have to be careful.

        fs.writeFileSync(fullPath, content, 'utf8');
    }
});
