import Entertainment from '@/views/Entertainment';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/entertainment' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: {
          canonical: '/entertainment',
        },
      };
    }
  } catch (e) {}
  return {
    title: 'मनोरंजन (Entertainment) - HBN24 News',
    description: 'बॉलीवुड, हॉलीवुड, टीवी और मनोरंजन जगत की ताज़ा ख़बरें।',
    robots: 'index, follow',
    alternates: {
      canonical: '/entertainment',
    },
  };
}


export default function Page() {
  return <Entertainment />;
}
