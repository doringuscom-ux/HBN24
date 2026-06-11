const fs = require('fs');
const path = 'd:/Rakesh React/HBN24/frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. fetchUsers
content = content.replace(
    /headers: \{ 'Authorization': `Bearer \$\{token\}` \}\s*\n\s*\}\);\s*\n\s*if \(res\.ok\) \{/g,
    `headers: { 'Authorization': \`Bearer \${token}\` }
            });
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
                return;
            }
            if (res.ok) {`
);

// 2. fetchMissingCount
content = content.replace(
    /const res = await fetch\(__API_URL__ \+ '\/api\/seo\/missing-count', \{\s*\n\s*headers: \{ 'Authorization': `Bearer \$\{token\}` \}\s*\n\s*\}\);\s*\n\s*const data = await res\.json\(\);/g,
    `const res = await fetch(__API_URL__ + '/api/seo/missing-count', {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                });
                if (res.status === 401) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                    return;
                }
                const data = await res.json();`
);

// 3. fetchBulkStatus
content = content.replace(
    /const res = await fetch\(__API_URL__ \+ '\/api\/seo\/bulk-status', \{\s*\n\s*headers: \{ 'Authorization': `Bearer \$\{token\}` \}\s*\n\s*\}\);\s*\n\s*const data = await res\.json\(\);/g,
    `const res = await fetch(__API_URL__ + '/api/seo/bulk-status', {
                    headers: { 'Authorization': \`Bearer \${token}\` }
                });
                if (res.status === 401) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                    return;
                }
                const data = await res.json();`
);

// 4. fetchSeo (page seo list)
content = content.replace(
    /const res = await fetch\(__API_URL__ \+ '\/api\/seo\/pages', \{\s*\n\s*headers: \{ 'Authorization': `Bearer \$\{token\}` \}\s*\n\s*\}\);\s*\n\s*const data = await res\.json\(\);/g,
    `const res = await fetch(__API_URL__ + '/api/seo/pages', {
                headers: { 'Authorization': \`Bearer \${token}\` }
            });
            if (res.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
                return;
            }
            const data = await res.json();`
);

fs.writeFileSync(path, content);
console.log('Successfully updated additional fetch calls.');
