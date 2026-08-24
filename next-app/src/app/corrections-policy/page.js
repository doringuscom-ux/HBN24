import CorrectionsPolicy from '@/views/CorrectionsPolicy';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/corrections-policy' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/corrections-policy' },
      };
    }
  } catch (e) {}
  return {
    title: 'Corrections Policy - HBN24 News',
    alternates: { canonical: '/corrections-policy' },
  };
}

export default function Page() {
  return <CorrectionsPolicy />;
}
