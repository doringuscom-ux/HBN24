import TermsConditions from '@/views/TermsConditions';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/terms' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/terms' },
      };
    }
  } catch (e) {}
  return {
    title: 'Terms & Conditions - HBN24 News',
    alternates: { canonical: '/terms' },
  };
}

export default function Page() {
  return <TermsConditions />;
}
