import React from 'react';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SidebarNews({ news = [] }) {
    const displayNews = news.slice(0, 7); // Display top 7 superfast news to balance layout with Live TV

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-end gap-3 mb-6 border-b border-gray-200 pb-3">
                <div className="flex items-end text-[#da0000]">
                    <h2 className="text-[32px] font-black italic tracking-tighter leading-none" style={{ textShadow: "0.5px 0.5px 0px #da0000" }}>सुपरफ़ास्ट</h2>
                    <div className="flex flex-col ml-1.5 pb-0.5">
                        <div className="w-[32px] h-[3px] bg-[#da0000] mb-[3px]"></div>
                        <div className="w-[32px] h-[3px] bg-[#da0000] mb-[3px]"></div>
                        <div className="w-[32px] h-[3px] bg-[#da0000] mb-[1px]"></div>
                        <span className="text-[10px] font-black leading-none tracking-wider text-center mt-0.5">NEWS</span>
                    </div>
                </div>
                <p className="text-[15px] text-gray-600 font-medium pb-1.5 ml-2">सबसे कम समय में सबसे ज्यादा खबरें...</p>
            </div>

            {/* List */}
            <div className="flex flex-col gap-5">
                {displayNews.map((item, index) => (
                    <Link to={`/news/${item.slug || item._id}`} key={item._id || index} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                        {/* Image */}
                        <div className="relative w-[110px] h-[75px] flex-shrink-0 overflow-hidden rounded-[4px]">
                            <img
                                src={item.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop"}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between pt-0.5">
                            <h3 className="text-[15px] font-bold text-[#222] leading-[1.35] group-hover:text-[#da0000] transition-colors">
                                {item.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
