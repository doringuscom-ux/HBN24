import AboutUs from '@/views/AboutUs';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/about' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/about' },
      };
    }
  } catch (e) {}
  return {
    title: 'About Us - HBN24 News',
    alternates: { canonical: '/about' },
  };
}

export default function Page() {
  return <AboutUs />;
}
