const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');
const dirs = fs.readdirSync(appDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'api' && dirent.name !== 'admin' && dirent.name !== 'adminlogin' && dirent.name !== 'news')
  .map(dirent => dirent.name);

for (const dir of dirs) {
    const pagePath = path.join(appDir, dir, 'page.js');
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');
        
        // Remove 'use client'
        content = content.replace(/'use client';?\n?/, '');
        content = content.replace(/"use client";?\n?/, '');

        // Add generateMetadata
        const importSeo = "import connectToDatabase from '@/lib/mongodb';\nimport PageSeo from '@/models/PageSeo';\n";
        
        const generateMetadataFn = `
export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/${dir === 'page.js' ? '' : dir}' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
      };
    }
  } catch (e) {}
  return {};
}
`;
        
        if (!content.includes('generateMetadata')) {
            // Find the last import
            const lastImportIndex = content.lastIndexOf('import ');
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            
            content = content.substring(0, nextLineIndex + 1) + '\n' + importSeo + '\n' + generateMetadataFn + '\n' + content.substring(nextLineIndex + 1);
            fs.writeFileSync(pagePath, content, 'utf8');
            console.log('Updated ' + dir);
        }
    }
}
