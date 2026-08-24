 'use client';
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaInstagram } from 'react-icons/fa6';

export default function BreakingNewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/breaking-news')
            .then(res => res.json())
            .then(data => {
                setNews(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleInstaShare = (text) => {
        const shareText = `BREAKING: ${text} \nRead more at: ${(typeof window !== 'undefined' ? window.location : { hostname: '' }).href}`;
        navigator.clipboard.writeText(shareText).then(() => {
            alert('News text and link copied! You can now paste it in Instagram.');
        });
    };

    // Format date as time ago
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return 'अभी-अभी';
        if (minutes < 60) return `${minutes} मिनट पहले`;
        if (hours < 24) return `${hours} घंटे पहले`;
        if (days === 1) return 'कल';
        return `${days} दिन पहले`;
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <Helmet>
                <title>Breaking News | HBN24</title>
                <meta name="description" content="Latest breaking news and live updates from HBN24." />
            </Helmet>

            {/* Premium Designer Header Banner - Lighter Red */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-red-400 text-white py-12 md:py-16 px-4 shadow-lg mb-4">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-10 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                        <AlertCircle size={400} />
                    </div>
                </div>

                <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-3 mb-4 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full shadow-sm">
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                        <span className="text-sm font-bold tracking-widest uppercase text-white">Live Updates</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-wider drop-shadow-lg text-white">
                        Breaking News
                    </h1>
                    <p className="text-red-50 text-lg md:text-xl mt-4 font-medium max-w-2xl drop-shadow-sm">
                        Catch the latest updates, exclusive reports, and breaking headlines as they happen.
                    </p>
                </div>
            </div>

            {/* News Feed */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#da0000]"></div>
                    </div>
                ) : news.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 mt-4">
                        <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-700">No Active Breaking News</h3>
                        <p className="text-gray-500 mt-2">Check back later for more updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {news.map((item, index) => (
                            <div key={item._id} className="p-5 rounded-xl shadow-sm bg-white border border-gray-100 hover:shadow-md transition-shadow hover:border-red-200">
                                <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        <span className="text-xs font-bold text-[#da0000]">BREAKING</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Clock size={14} />
                                        <span className="text-xs font-medium">{timeAgo(item.createdAt)}</span>
                                    </div>
                                </div>
                                <p className="text-gray-800 font-bold text-lg leading-relaxed">{item.text}</p>

                                {/* Share Buttons */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-start gap-3">
                                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest mr-2 shadow-sm border border-gray-200">Share</span>
                                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('BREAKING: ' + item.text + ' - ' + (typeof window !== 'undefined' ? window.location : { hostname: '' }).href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-green-500/20 hover:-translate-y-1 hover:shadow-green-500/40 transition-all duration-300" title="Share on WhatsApp">
                                        <FaWhatsapp size={16} />
                                    </a>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((typeof window !== 'undefined' ? window.location : { hostname: '' }).href)}&quote=${encodeURIComponent('BREAKING: ' + item.text)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 hover:-translate-y-1 hover:shadow-blue-500/40 transition-all duration-300" title="Share on Facebook">
                                        <FaFacebookF size={16} />
                                    </a>
                                    <button onClick={() => handleInstaShare(item.text)} className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 hover:-translate-y-1 hover:shadow-pink-500/40 transition-all duration-300" title="Share on Instagram">
                                        <FaInstagram size={16} />
                                    </button>
                                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('BREAKING: ' + item.text)}&url=${encodeURIComponent((typeof window !== 'undefined' ? window.location : { hostname: '' }).href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center shadow-md shadow-gray-900/20 hover:-translate-y-1 hover:shadow-gray-900/40 transition-all duration-300" title="Share on X (Twitter)">
                                        <FaXTwitter size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}




