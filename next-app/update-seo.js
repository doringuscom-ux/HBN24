const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const GlobalSeo = require('../backend/models/GlobalSeo');
const PageSeo = require('../backend/models/PageSeo');

async function updateDb() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Update PageSeo for home page
    let pageSeo = await PageSeo.findOne({ pageUrl: '/' });
    if (!pageSeo) {
        pageSeo = new PageSeo({ pageUrl: '/' });
    }
    pageSeo.metaTitle = 'HBN News24: Latest News, Breaking News & Daily Headlines';
    pageSeo.metaDescription = 'Get latest Hindi news, breaking news, politics, sports, entertainment, business, and daily news updates from India and around the world on HBN News24.';
    pageSeo.metaKeywords = '????? ??????, ???????? ??????, ????, ???????, ???, ???????, ????? ?????, ????? ???????, HBN24';
    await pageSeo.save();

    console.log('Done updating DB');
    process.exit(0);
}
updateDb();
