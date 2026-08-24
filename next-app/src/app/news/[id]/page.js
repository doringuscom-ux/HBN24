import SingleArticle from '@/views/SingleArticle';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(`http://localhost:3000/api/news/article/${id}`, { next: { revalidate: 60 } });
    const data = await res.json();
    
    if (data && data._id) {
      return {
        title: data.metaTitle || data.title || 'HBN24 News',
        description: data.metaDescription || '',
        keywords: data.metaKeywords || '',
        robots: data.robots || 'index, follow',
        alternates: {
          canonical: `/news/${data.slug || data._id || id}`,
        },
        openGraph: {
          title: data.metaTitle || data.title,
          description: data.metaDescription,
          images: [data.image],
        }
      };
    }
  } catch (error) {
    console.error('Error fetching metadata for article:', error);
  }
  return {
    title: 'HBN24 News',
  };
}

export default function Page() {
  return <SingleArticle />;
}
