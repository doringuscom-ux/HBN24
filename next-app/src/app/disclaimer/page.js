import Disclaimer from '@/views/Disclaimer';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/disclaimer' });
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


export default function Page() {
  return <Disclaimer />;
}
