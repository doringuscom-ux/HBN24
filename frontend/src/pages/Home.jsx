import React, { useState, useEffect } from 'react';
import BreakingNews from "../components/BreakingNews"
import MainContent from "../components/MainContent"
import VideoSection from "../components/VideoSection"
import SportsSection from "../components/SportsSection"
import ReligionSection from "../components/ReligionSection"
import LifestyleSection from "../components/LifestyleSection"
import TechnologySection from "../components/TechnologySection"
import BusinessSection from "../components/BusinessSection"
import ShortVideos from "../components/ShortVideos"

export default function Home() {
    const [news, setNews] = useState({
        latestNews: [], mixNews: [], sports: [], religion: [], lifestyle: [], technology: [], business: [], entertainment: [], superfast: [], featured: []
    });
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [news24Shorts, setNews24Shorts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, videoRes] = await Promise.all([
                    fetch(__API_URL__ + '/api/news/home'),
                    fetch(__API_URL__ + '/api/youtube')
                ]);
                let newsData = await newsRes.json();
                const videoData = await videoRes.json();

                // Optimize Cloudinary images on the fly to drastically reduce LCP
                const optimizeCloudinaryUrl = (url) => {
                    if (!url || typeof url !== 'string') return url;
                    if (url.includes('cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/q_auto')) {
                        return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
                    }
                    return url;
                };

                // newsData is now an object of arrays. Optimize images in all arrays.
                Object.keys(newsData).forEach(key => {
                    if (Array.isArray(newsData[key])) {
                        newsData[key] = newsData[key].map(item => ({
                            ...item,
                            image: optimizeCloudinaryUrl(item.image)
                        }));
                    }
                });

                setNews(newsData);
                setVideos(videoData.videos || []);
                setShorts(videoData.shorts || []);
                setNews24Shorts(videoData.news24Shorts || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching home data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;



    return (
        <div className="bg-white">
            <BreakingNews news={news.latestNews} />
            <MainContent mixNews={news.mixNews} entertainmentNews={news.entertainment} superfastNews={news.superfast} featuredNews={news.featured} videos={videos} shorts={shorts} />
            <VideoSection videos={videos} />
            <SportsSection news={news.sports} />
            <ReligionSection news={news.religion} />
            <LifestyleSection news={news.lifestyle} />
            
            {news24Shorts.length > 0 && (
                <div className="w-full max-w-[1280px] mx-auto px-4 mb-12">
                    <ShortVideos shorts={news24Shorts} title="Ref by न्यूज़24 शॉर्ट्स" />
                </div>
            )}

            <TechnologySection news={news.technology} />
            <BusinessSection news={news.business} />
        </div>
    );
}
