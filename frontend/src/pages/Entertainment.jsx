import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Star } from 'lucide-react';
import { FaXTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa6';
import { MdLocalMovies } from 'react-icons/md';
import cinemaImg from '../assets/Cinema.png';

export default function Entertainment() {
    const [newsData, setNewsData] = useState([]);
    const [latestNewsData, setLatestNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch entertainment specific news
                const entRes = await fetch('http://localhost:5000/api/news/entertainment');
                const entData = await entRes.json();
                
                // Fetch all news for the 'latest' sidebar across all fields
                const allRes = await fetch('http://localhost:5000/api/news');
                const allData = await allRes.json();

                setNewsData(entData);
                setLatestNewsData(allData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news:", error);
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const mainNews = newsData[0] || { title: 'Loading...', image: '' };
    const topSideNews = newsData[1] || { title: 'Loading...', image: '' };
    const bottomNews = newsData.slice(2, 5);
    const latestNews = latestNewsData.slice(0, 5);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6]">
            {/* Banner Section */}
            <div className="w-full h-[160px] bg-gradient-to-r from-[#b32b13] via-[#df6a22] to-[#f4b647] relative overflow-hidden flex items-center px-10">
                
                {/* Background Watermark Right */}
                <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 opacity-20 pointer-events-none">
                    <MdLocalMovies className="w-[200px] h-[200px] text-white" />
                </div>

                {/* Left side Graphics */}
                <div className="absolute left-0 bottom-0 h-full flex items-end">
                    {/* Stars Background */}
                    <div className="absolute inset-0 pointer-events-none w-[250px]">
                        <Star className="absolute top-4 left-6 text-white/40 w-6 h-6 fill-current animate-pulse" />
                        <Star className="absolute top-8 left-20 text-white/30 w-4 h-4 fill-current animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <Star className="absolute top-[50px] left-[130px] text-white/50 w-8 h-8 fill-current animate-pulse" style={{ animationDelay: '1s' }} />
                        <Star className="absolute bottom-6 left-[140px] text-white/20 w-5 h-5 fill-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <Star className="absolute top-1 left-28 text-white/60 w-3 h-3 fill-current" />
                    </div>

                    <div className="h-[140px] w-[140px] flex items-end pb-2 pl-4 relative z-10">
                         <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-110 transform translate-y-4 translate-x-2"></div>
                         <img src={cinemaImg} alt="Cinema" className="w-full h-full object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.4)] relative z-20" />
                    </div>
                </div>

                <div className="w-[1270px] mx-auto flex items-center justify-between relative z-10 pl-[120px]">
                    {/* Center Title */}
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-[#a61c0a] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px] leading-tight shadow-sm">Hindi News</span>
                            <span className="text-white text-[13px] font-bold">/ मनोरंजन</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded-full p-1.5 flex items-center justify-center shadow-md">
                                <MdLocalMovies className="text-[#df6a22] w-6 h-6" />
                            </div>
                            <h1 className="text-white text-[34px] font-black tracking-wide drop-shadow-md">मूवी मसाला</h1>
                        </div>
                    </div>

                    {/* Right side Feedback & Socials */}
                    <div className="flex flex-col items-end gap-3 pr-[40px]">
                        <button className="bg-white text-[#d32f2f] text-[12px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-gray-100 transition-colors">
                            <Pencil size={12} strokeWidth={3} /> Feedback
                        </button>
                        <div className="flex items-center gap-4 text-white">
                            <FaWhatsapp size={18} className="cursor-pointer hover:text-green-400 drop-shadow-sm" />
                            <FaFacebookF size={17} className="cursor-pointer hover:text-blue-500 drop-shadow-sm" />
                            <FaXTwitter size={17} className="cursor-pointer hover:text-black drop-shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="w-[1270px] mx-auto py-10">
                <div className="flex gap-6 mt-2">
                    {/* Left Main Content */}
                    <div className="w-[70%] flex flex-col gap-4">
                        {/* Top Row: 2 columns */}
                        <div className="grid grid-cols-3 gap-4 h-[360px]">
                            {/* Main Article (Takes 2 columns) */}
                            <Link to={`/news/${mainNews.slug || mainNews._id}`} className="col-span-2 relative group cursor-pointer overflow-hidden shadow-sm bg-black border border-gray-200 block">
                                <img src={mainNews.image} alt={mainNews.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100" />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-4 px-5">
                                    <h3 className="text-white text-[22px] font-bold leading-[1.4]">
                                        {mainNews.title}
                                    </h3>
                                </div>
                            </Link>

                            {/* Top Side Article (Takes 1 column) */}
                            <Link to={`/news/${topSideNews.slug || topSideNews._id}`} className="col-span-1 bg-[#f0f2f5] shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                <div className="w-full h-[200px] overflow-hidden">
                                    <img src={topSideNews.image} alt="news" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center bg-[#f0f2f5]">
                                    <h3 className="text-black text-[18px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors">
                                        {topSideNews.title}
                                    </h3>
                                </div>
                            </Link>
                        </div>

                        {/* Bottom Row: 3 columns */}
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            {bottomNews.map((news, idx) => (
                                <Link to={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                    <div className="w-full h-[180px] overflow-hidden relative">
                                        <img src={news.image} alt="news" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-black text-[16px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                            {news.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Rest of the news */}
                        {newsData.length > 5 && (
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                {newsData.slice(5).map((news, idx) => (
                                    <Link to={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                        <div className="w-full h-[180px] overflow-hidden relative">
                                            <img src={news.image} alt="news" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-black text-[16px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                                {news.title}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-[30%] bg-white p-5 shadow-sm border border-gray-200 h-fit sticky top-4">
                        <div className="flex items-center gap-2 mb-4 border-b-[2px] border-gray-100 pb-2">
                            <div className="w-0 h-0 border-t-[10px] border-t-[#d91f26] border-l-[10px] border-l-transparent"></div>
                            <h2 className="text-[20px] font-black text-black">लेटेस्ट</h2>
                        </div>
                        <div className="flex flex-col">
                            {latestNewsData.slice(0, 15).map((news, idx) => (
                                <Link to={`/news/${news.slug || news._id}`} key={idx} className={`flex gap-3 py-3.5 group cursor-pointer ${idx !== Math.min(latestNewsData.length, 15) - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="w-[100px] h-[65px] flex-shrink-0 overflow-hidden rounded-[2px]">
                                        <img src={news.image} alt="latest" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[14px] font-medium leading-[1.4] text-gray-800 group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                            {news.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

