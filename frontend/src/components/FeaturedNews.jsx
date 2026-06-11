import React from 'react';
import { Link } from 'react-router-dom';

import { optimizeImage } from '../utils/imageOptimizer';

export default function FeaturedNews({ news = [] }) {
    if (news.length === 0) {
        return (
            <div className="w-full bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-pulse">
                <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-200"></div>
                <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const featured = news[0];

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
    if (displayDesc) {
        displayDesc = displayDesc.replace(/&amp;nbsp;/gi, ' ').replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if (!displayDesc) {
        displayDesc = "देश और दुनिया की तमाम बड़ी खबरों के लिए हमारे साथ बने रहें।";
    }

    return (
        <Link to={`/news/${featured.slug || featured._id}`} className="block w-full group cursor-pointer bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100">
            <div className="relative overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
                <img 
                    src={optimizeImage(featured.image, 800)} 
                    alt="Featured" 
                    fetchPriority="high"
                    loading="eager"
                    className="w-full h-full object-cover bg-gray-100 group-hover:scale-95 transition-transform duration-700 ease-out rounded-[12px] group-hover:rounded-[16px]"
                />
                {/* Category badge removed as requested */}
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
