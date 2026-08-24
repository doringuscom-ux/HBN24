require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const PageSeo = require('./src/models/PageSeo');

async function getPages() {
    await mongoose.connect(process.env.MONGODB_URI);
    const pages = await PageSeo.find({}, 'pageUrl metaTitle');
    console.log(pages);
    process.exit(0);
}
getPages();
