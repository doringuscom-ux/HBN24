import EditorialPolicy from '@/views/EditorialPolicy';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/editorial-policy' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/editorial-policy' },
      };
    }
  } catch (e) {}
  return {
    title: 'Editorial Policy - HBN24 News',
    alternates: { canonical: '/editorial-policy' },
  };
}

export default function Page() {
  return <EditorialPolicy />;
}
