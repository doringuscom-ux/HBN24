import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Share2, MoreVertical } from 'lucide-react';

export default function SingleArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [latestNews, setLatestNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Fetch article and latest news
        const fetchData = async () => {
            try {
                // Fetch specific article
                const articleRes = await fetch(`${__API_URL__}/api/news/article/${id}`);
                const articleData = await articleRes.json();
                
                if (articleData.redirect) {
                    navigate(`/news/${articleData.newSlug}`, { replace: true });
                    return;
                }
                
                // Fetch latest news for sidebar
                const newsRes = await fetch(`${__API_URL__}/api/news`);
                const newsData = await newsRes.json();
                
                setArticle(articleData);
                // Filter out the current article from sidebar
                setLatestNews(newsData.filter(n => n._id !== id).slice(0, 8));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching article:", error);
                setLoading(false);
            }
        };
        fetchData();
        // Scroll to top when route changes
        window.scrollTo(0, 0);
        // Reset expanded state
        setIsExpanded(false);
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#da0000]"></div></div>;
    }

    if (!article) {
        return <div className="text-center py-20 text-xl font-bold">Article not found</div>;
    }

    const hasContent = article.content && article.content.trim() !== '' && article.content !== '<p><br></p>';

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 font-sans">
            
            {/* Left Column - Main Article */}
            <div className="w-full md:w-3/4 flex flex-col gap-5">
                <h1 className="text-3xl md:text-[38px] font-black text-[#111] leading-[1.3]">
                    {article.title}
                </h1>
                


                <div className="w-full bg-gray-100">
                    <img src={article.image} alt={article.title} className="w-full h-auto max-h-[500px] object-cover" />
                    <p className="text-sm text-gray-500 py-2 px-1 border-b border-gray-200">
                        {article.imageAlt || `${article.title} (Photo)`}
                    </p>
                </div>

                {/* Author & Share Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=da0000&color=fff" alt="Author" className="w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] text-gray-900">एडमिन</span>
                            <span className="text-[13px] text-gray-500">
                                नई दिल्ली, {new Date(article.createdAt || Date.now()).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, (अपडेटेड {new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                        <button className="flex items-center gap-1 hover:text-[#da0000]"><ThumbsUp size={18} /> <span className="text-xs">38</span></button>
                        <button className="hover:text-[#da0000]"><MessageCircle size={18} /></button>
                        <button className="text-green-500 hover:text-green-600">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        </button>
                        <button className="hover:text-[#da0000]"><Share2 size={18} /></button>
                        <button className="hover:text-[#da0000]"><MoreVertical size={18} /></button>
                    </div>
                </div>

                {/* Article Body */}
                {hasContent && (
                    <div className="relative">
                        <div 
                            className={`text-[18px] text-gray-800 leading-[1.8] font-serif overflow-hidden transition-all duration-500 ease-in-out [&>p]:mb-6 ${isExpanded ? 'max-h-none' : 'max-h-[300px]'}`}
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                        {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        )}
                    </div>
                )}

                {/* Read More Button OR End Text */}
                {hasContent && (
                    !isExpanded ? (
                        <div className="flex justify-center mt-4 relative z-10">
                            <button 
                                onClick={() => setIsExpanded(true)}
                                className="bg-[#da0000] text-white px-8 py-2 rounded-full font-bold text-lg hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
                            >
                                और पढ़ें <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 mt-8 text-gray-500 font-bold text-lg">
                            <span>---- समाप्त ----</span>
                            <div className="w-2 h-2 bg-[#da0000]"></div>
                        </div>
                    )
                )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="w-full md:w-1/4">
                <div className="sticky top-6 flex flex-col">
                    <div className="flex items-center gap-2 border-b-[2px] border-gray-200 pb-2 mb-4">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-[#da0000] border-b-[6px] border-b-transparent transform rotate-45"></div>
                        <h2 className="text-xl font-bold">लेटेस्ट</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                    {latestNews.map((news) => (
                        <Link to={`/news/${news.slug || news._id}`} key={news._id} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                            <div className="relative w-[110px] h-[75px] flex-shrink-0 overflow-hidden rounded-[4px]">
                                <img
                                    src={news.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop"}
                                    alt={news.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[15px] font-bold text-[#222] leading-[1.35] group-hover:text-[#da0000] transition-colors line-clamp-3">
                                    {news.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
