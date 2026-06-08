import React from 'react';
import { Link } from 'react-router-dom';

export default function FeaturedNews({ news = [] }) {
    const defaultNews = {
        title: "Loading...",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
        description: "Please wait while we load the latest news...",
        category: "NEWS"
    };

    const featured = news.length > 0 ? news[0] : defaultNews;

    if (!featured._id) {
        return (
            <div className="w-full bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="relative overflow-hidden">
                    <img src={featured.image} alt="Featured" className="w-full object-cover bg-gray-100" />
                </div>
                <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                    <h1 className="text-[24px] md:text-[34px] font-black text-[#111] mb-4 leading-[1.25]">{featured.title}</h1>
                </div>
            </div>
        );
    }

    let displayCategory = '';
    if (Array.isArray(featured.category)) {
        const filtered = featured.category.filter(c => c.toLowerCase() !== 'superfast' && c.toLowerCase() !== 'featured');
        displayCategory = filtered.length > 0 ? filtered[0] : (featured.category[0] || '');
    } else if (typeof featured.category === 'string') {
        displayCategory = featured.category;
    }

    let displayDesc = featured.description;
    if (!displayDesc && featured.content) {
        displayDesc = featured.content.replace(/<[^>]+>/g, '').substring(0, 180) + '...';
    }
    if (!displayDesc) {
        displayDesc = "देश और दुनिया की तमाम बड़ी खबरों के लिए हमारे साथ बने रहें।";
    }

    return (
        <Link to={`/news/${featured.slug || featured._id}`} className="block w-full group cursor-pointer bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100">
            <div className="relative overflow-hidden">
                <img 
                    src={featured.image} 
                    alt="Featured" 
                    className="w-full object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {displayCategory && (
                    <div className="absolute top-4 left-4 bg-[#da0000] text-white text-[12px] font-bold px-4 py-1.5 rounded-full shadow-lg capitalize">
                        {displayCategory}
                    </div>
                )}
            </div>
            <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                <h1 className="text-[24px] md:text-[34px] font-black text-[#111] mb-4 group-hover:text-[#da0000] transition-colors leading-[1.25]">
                    {featured.title}
                </h1>
                <div className="w-12 h-1.5 bg-[#da0000] mb-4 rounded-full"></div>
                <p className="text-gray-600 text-[17px] leading-relaxed line-clamp-2">
                    {displayDesc}
                </p>
            </div>
        </Link>
    );
}
