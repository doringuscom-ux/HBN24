import Sports from '@/views/Sports';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/sports' });
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
  return <Sports />;
}
