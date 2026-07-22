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
            <div className="flex bg-[#da0000] text-white rounded-[6px] md:rounded-full overflow-hidden shadow-md md:h-12 md:items-center">
                
                {/* Left Side: Breaking News Tag */}
                <div className="flex flex-col md:flex-row items-center justify-center flex-shrink-0 bg-[#b30000] md:bg-transparent px-3 py-2 md:py-0 md:pl-5">
                    <span className="font-extrabold italic text-[11px] md:text-xl tracking-wide whitespace-nowrap drop-shadow-sm text-center leading-tight">
                        <span className="block md:inline">BREAKING</span>
                        <span className="block md:inline md:ml-1">NEWS</span>
                    </span>
                    <div className="hidden md:block h-5 w-[2px] bg-white/40 mx-4"></div>
                </div>

                {/* Center: Headline (Animated Ticker) */}
                <div className="flex-1 overflow-hidden relative min-h-[52px] md:min-h-0 md:h-full flex items-center px-3 py-1.5 md:py-0">
                    {breakingNewsItems.map((item, index) => (
                        <Link 
                            key={item._id || index} 
                            to={`/news/${item.slug || item._id}`} 
                            className={`block absolute w-[95%] transition-all duration-500 ease-in-out ${
                                index === currentIndex 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 -translate-y-4 pointer-events-none'
                            }`}
                        >
                            <p className="text-[13px] md:text-xl font-bold line-clamp-2 md:truncate cursor-pointer hover:underline leading-snug">
                                {item.title}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Right Side: Close Button */}
                <button 
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 self-center ml-1 md:ml-4 mr-2 md:mr-3 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <X className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                </button>

            </div>
        </div>
    );
}
