const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const PageSeo = require('./src/models/PageSeo');

async function getPages() {
    await mongoose.connect(process.env.MONGODB_URI);
    const pages = await PageSeo.find();
    console.log(JSON.stringify(pages, null, 2));
    process.exit(0);
}
getPages();
