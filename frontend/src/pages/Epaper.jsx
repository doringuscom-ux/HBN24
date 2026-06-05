import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Epaper() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 11; // 11 stories per page to allow the last one to be wide

    useEffect(() => {
        const fetchEpaperNews = async () => {
            try {
                const res = await fetch(__API_URL__ + '/api/news');
                if (res.ok) {
                    const data = await res.json();
                    
                    // Get all e-paper news sorted by newest
                    const allEpaperNews = data
                        .filter(item => item.isEpaper)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        
                    // Calculate timestamp for 24 hours ago
                    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    
                    // Filter for news in the last 24 hours
                    const recentEpaperNews = allEpaperNews.filter(item => new Date(item.createdAt) >= twentyFourHoursAgo);
                    
                    // If no news updated in the last 24 hours, show old news so it doesn't stay empty!
                    if (recentEpaperNews.length > 0) {
                        setNews(recentEpaperNews);
                    } else {
                        setNews(allEpaperNews);
                    }
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEpaperNews();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ece4d7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#ece4d7]">
                <h2 className="text-3xl font-serif font-bold text-red-800">ई-पेपर उपलब्ध नहीं है</h2>
                <p className="text-gray-800 mt-2 font-sans">जल्द ही ताज़ा खबरें अपडेट की जाएंगी।</p>
            </div>
        );
    }

    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const totalPages = Math.ceil(news.length / itemsPerPage);
    const paginatedNews = news.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate dynamic time icon
    const currentHour = new Date().getHours();
    const timeIcon = (currentHour >= 6 && currentHour < 18) ? '☀️' : '🌙';

    // Assign newspaper layout roles
    const getStoryStyle = (index) => {
        if (index === 0) return 'headline'; // main top story
        if (index === 1) return 'double-column';
        if (index === 10) return 'bottom-wide'; // 11th item spans 2 columns
        if (index === 2 || index === 3) return 'feature';
        return 'normal';
    };

    return (
        <div className="min-h-screen bg-[#c9c1ae] py-6 px-4 md:px-8 selection:bg-yellow-900 selection:text-white">
            {/* Main newspaper wrapper with aged paper look */}
            <div
                className="max-w-[1300px] mx-auto bg-[#fef7e6] shadow-2xl border border-black/20"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-paper-texture.png")',
                    fontFamily: "'Playfair Display', 'Times New Roman', Times, serif",
                }}
            >
                {/* ========== REAL NEWSPAPER MASTHEAD ========== */}
                <div className="border-b-[6px] border-black/20 pb-4 pt-6 px-6 text-center">
                    <div className="flex justify-center text-[11px] font-mono border-b border-black/20 pb-1 mb-2 text-gray-700 uppercase">
                        <span>अंक 1</span>
                    </div>
                    <h1
                        className="text-7xl md:text-[110px] font-black tracking-tighter leading-none text-blue-950 uppercase"
                        style={{ textShadow: '6px 6px 0 rgba(0,0,0,0.05)' }}
                    >
                        HBN News 24
                    </h1>
                    <p className="text-[11px] tracking-[0.3rem] font-mono mt-1 text-gray-600">
                        राष्ट्रीय हिंदी दैनिक • स्थापना 2024
                    </p>
                    <div className="flex flex-wrap justify-between gap-2 text-[12px] font-medium border-t border-b border-black/20 py-2 mt-3 bg-black/5 px-2">
                        <span>
                            {new Date().toLocaleDateString('hi-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span>पृष्ठ {currentPage} / {totalPages}</span>
                    </div>
                </div>

                {/* ========== 5-COLUMN NEWSPAPER GRID (AKHBAAR STYLE) ========== */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 relative">
                    {paginatedNews.map((item, idx) => {
                        const style = getStoryStyle(idx);
                        const plainText = stripHtml(item.content);
                        const catHindi = {
                            politics: 'राजनीति',
                            sports: 'खेल',
                            entertainment: 'मनोरंजन',
                            business: 'अर्थ जगत',
                            tech: 'टेक्नोलॉजी',
                        }[item.category] || item.category;

                        // Dynamic column spans
                        let colSpan = 'col-span-1';
                        if (style === 'headline') colSpan = 'md:col-span-3 border-r-2 border-black/20 md:pr-6 md:pb-6';
                        if (style === 'double-column') colSpan = 'md:col-span-2 border-r border-black/15 md:pr-4 md:pb-6';
                        if (style === 'bottom-wide') colSpan = 'md:col-span-2 border-l border-black/15 md:pl-4';
                        if (style === 'feature') colSpan = 'md:col-span-1';

                        return (
                            <div
                                key={item._id}
                                className={`${colSpan} group break-inside-avoid pb-5 ${idx !== paginatedNews.length - 1 ? 'border-b md:border-b-0' : ''
                                    }`}
                            >
                                <article className="h-full flex flex-col">
                                    {/* category stripe */}
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 tracking-wider">
                                            {catHindi}
                                        </span>
                                        {style === 'headline' && (
                                            <span className="text-[10px] font-bold text-red-800 border-l-2 border-red-800 pl-2">
                                                विशेष संवाददाता
                                            </span>
                                        )}
                                    </div>

                                    {/* Headline */}
                                    <h2
                                        className={`font-black leading-tight mb-2 hover:text-red-700 transition ${style === 'headline'
                                                ? 'text-4xl md:text-5xl'
                                                : style === 'double-column'
                                                    ? 'text-2xl md:text-3xl'
                                                    : 'text-xl'
                                            }`}
                                    >
                                        <Link to={`/news/${item.slug || item._id}`}>{item.title}</Link>
                                    </h2>

                                    {/* Byline */}
                                    <div className="text-[11px] font-mono text-gray-600 uppercase border-b border-dotted border-gray-400 self-start mb-3">
                                        नई दिल्ली • हमारे संवाददाता
                                    </div>

                                    {/* Image – only if not text-only and exists */}
                                    {item.image && (
                                        <div className="mb-3 overflow-hidden border border-black/10 bg-white shadow-sm">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-auto transition duration-500 grayscale group-hover:grayscale-0"
                                                loading="lazy"
                                            />
                                            {style === 'headline' && (
                                                <p className="text-[9px] font-mono bg-gray-100 p-1 text-center border-t border-black/10">
                                                    📸 सांकेतिक तस्वीर | फोटो: HBN News 24
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Article text with real dropcap on headline */}
                                    <div className="text-gray-800 text-justify flex-1">
                                        <p
                                            className={`text-sm leading-relaxed ${style === 'headline'
                                                    ? 'first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-red-900 first-letter:leading-[0.8] line-clamp-[20]'
                                                    : style === 'double-column'
                                                    ? 'line-clamp-[12]'
                                                    : 'line-clamp-[8]'
                                                }`}
                                        >
                                            {plainText}
                                        </p>
                                    </div>

                                    {/* Read more + page reference (newspaper style) */}
                                    <div className="mt-4 pt-2 border-t border-black/20 flex justify-between items-center text-[11px] font-mono">
                                        <Link
                                            to={`/news/${item.slug || item._id}`}
                                            className="font-black uppercase tracking-wider text-black hover:text-red-700 flex items-center gap-1"
                                        >
                                            और पढ़ें <span className="text-base">→</span>
                                        </Link>
                                        <span className="text-gray-500">पेज {currentPage} • कॉलम {idx + 1}</span>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>

                {/* ========== PAGE TURNING (REAL AKHBAAR BUTTONS) ========== */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/30 px-6 py-5 bg-white/60">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-40 border border-black/60 font-mono font-bold py-2 px-4 hover:bg-black hover:text-white transition disabled:opacity-30 uppercase text-sm tracking-wider"
                        >
                            ← पिछला पृष्ठ
                        </button>
                        <div className="font-mono text-sm border-b-2 border-black px-2">
                            पृष्ठ {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-40 border border-black/60 font-mono font-bold py-2 px-4 hover:bg-black hover:text-white transition disabled:opacity-30 uppercase text-sm tracking-wider"
                        >
                            अगला पृष्ठ →
                        </button>
                    </div>
                )}

                {/* Footer imprint */}
                <div className="text-xs font-sans font-medium text-center border-t border-black/20 py-4 text-gray-700 tracking-wide">
                    प्रकाशक: HBN News 24 मीडिया | यह ई-पेपर मूल मुद्रित संस्करण के समान प्रमाणिक है।
                </div>
            </div>
        </div>
    );
}
