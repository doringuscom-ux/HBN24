import FactCheckPolicy from '@/views/FactCheckPolicy';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/fact-check-policy' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/fact-check-policy' },
      };
    }
  } catch (e) {}
  return {
    title: 'Fact Check Policy - HBN24 News',
    alternates: { canonical: '/fact-check-policy' },
  };
}

export default function Page() {
  return <FactCheckPolicy />;
}
