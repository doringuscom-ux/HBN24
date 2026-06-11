const fs = require('fs');
const path = 'd:/Rakesh React/HBN24/frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if\s*\(\s*res\.status\s*===\s*401\s*\)\s*\{\s*navigate\('\/admin\/login'\);\s*return;\s*\}/g, (match) => {
    return match.replace("navigate('/admin/login');", "localStorage.removeItem('adminToken');\n                navigate('/admin/login');");
});

fs.writeFileSync(path, content);
console.log('Successfully replaced 401 redirect logic.');
