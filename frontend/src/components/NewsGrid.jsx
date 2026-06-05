import React from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsGrid({ news = [] }) {
    // Show 8 items starting from index 1 (since index 0 is featured)
    const gridItems = news.slice(1, 9);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {gridItems.map((item, index) => (
                <Link to={`/news/${item.slug || item._id}`} key={item._id || index} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 md:border-b-0 md:pb-0">
                    {/* Image */}
                    <div className="relative w-[140px] h-[90px] flex-shrink-0 overflow-hidden rounded-[4px]">
                        <img
                            src={item.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Icons */}
                        {item.isVideo && (
                            <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-white text-[11px] flex items-center gap-1 font-semibold backdrop-blur-sm">
                                <Play size={10} fill="white" /> {item.duration}
                            </div>
                        )}
                        {item.isGallery && (
                            <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-white text-[11px] flex items-center gap-1 font-semibold backdrop-blur-sm">
                                <ImageIcon size={10} className="text-[#da0000]" /> {item.count}
                            </div>
                        )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-1">
                        <h3 className="text-[16px] font-bold text-[#222] leading-[1.4] group-hover:text-[#da0000] transition-colors line-clamp-3">
                            {item.title}
                        </h3>
                    </div>
                </Link>
            ))}
        </div>
    );
}
