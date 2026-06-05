import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function BreakingNews({ news = [] }) {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const breakingNewsItems = news.slice(0, 5);

    useEffect(() => {
        if (breakingNewsItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % breakingNewsItems.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [breakingNewsItems.length]);

    if (!isVisible || breakingNewsItems.length === 0) return null;

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 mt-6">
            <div className="flex items-center bg-[#da0000] text-white rounded-full overflow-hidden shadow-md pl-5 pr-3 py-1.5 h-12">
                
                {/* Left Side: Breaking News Tag */}
                <div className="flex items-center flex-shrink-0">
                    <span className="font-extrabold italic text-xl tracking-wide whitespace-nowrap drop-shadow-sm">
                        BREAKING NEWS
                    </span>
                    <div className="h-5 w-[2px] bg-white/40 mx-4"></div>
                </div>

                {/* Center: Headline (Animated Ticker) */}
                <div className="flex-1 overflow-hidden relative h-full flex items-center">
                    {breakingNewsItems.map((item, index) => (
                        <Link 
                            key={item._id || index} 
                            to={`/news/${item.slug || item._id}`} 
                            className={`block absolute w-full transition-all duration-500 ease-in-out ${
                                index === currentIndex 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 -translate-y-4 pointer-events-none'
                            }`}
                        >
                            <p className="text-xl font-bold truncate cursor-pointer hover:underline">
                                {item.title}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Right Side: Close Button */}
                <button 
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 ml-4 hover:bg-white/20 p-1 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

            </div>
        </div>
    );
}
