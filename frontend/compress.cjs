const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'assets');
const files = fs.readdirSync(dir);

async function compress() {
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp')) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.size > 200000) { // greater than 200kb
        console.log(`Compressing ${file} (${(stat.size / 1024).toFixed(2)} KB)`);
        
        let targetWidth = 1200;
        if (file.includes('Thumbnail')) targetWidth = 300; // Logos should be small
        
        const tempPath = path.join(dir, 'temp_' + file);
        
        await sharp(filePath)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(tempPath + '.webp');
          
        fs.unlinkSync(filePath); // delete original
        
        // Ensure the new file is named with .webp extension
        const newFileName = file.replace(/\.(png|jpg|jpeg)$/, '.webp');
        fs.renameSync(tempPath + '.webp', path.join(dir, newFileName));
        console.log(`Saved as ${newFileName}`);
      }
    }
  }
}

compress().then(() => console.log('All done!')).catch(console.error);
