import ContactUs from '@/views/ContactUs';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/contact' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/contact' },
      };
    }
  } catch (e) {}
  return {
    title: 'Contact Us - HBN24 News',
    alternates: { canonical: '/contact' },
  };
}

export default function Page() {
  return <ContactUs />;
}
