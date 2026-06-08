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
    const [news, setNews] = useState([]);
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [news24Shorts, setNews24Shorts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, videoRes] = await Promise.all([
                    fetch(__API_URL__ + '/api/news'),
                    fetch(__API_URL__ + '/api/youtube')
                ]);
                const newsData = await newsRes.json();
                const videoData = await videoRes.json();

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

    const filterCategory = (cat) => news.filter(n => {
        const itemCats = Array.isArray(n.category) ? n.category : (n.category ? [n.category] : []);
        return itemCats.includes(cat);
    });

    const specificCategories = ['sports', 'religion', 'lifestyle', 'technology', 'business', 'entertainment', 'superfast', 'featured'];
    const mixNews = news.filter(n => {
        const itemCats = Array.isArray(n.category) ? n.category : (n.category ? [n.category] : []);
        return !itemCats.some(c => specificCategories.includes(c));
    });

    const fillNews = (categoryNews) => {
        if (categoryNews.length >= 12) return categoryNews;
        const borrowed = news.filter(n => !categoryNews.some(cn => cn._id === n._id));
        return [...categoryNews, ...borrowed].slice(0, 12);
    };

    return (
        <div className="bg-white">
            <BreakingNews news={news} />
            <MainContent mixNews={fillNews(mixNews)} entertainmentNews={fillNews(filterCategory('entertainment'))} superfastNews={fillNews(filterCategory('superfast'))} featuredNews={fillNews(filterCategory('featured'))} videos={videos} shorts={shorts} />
            <VideoSection videos={videos} />
            <SportsSection news={fillNews(filterCategory('sports'))} />
            <ReligionSection news={fillNews(filterCategory('religion'))} />
            <LifestyleSection news={fillNews(filterCategory('lifestyle'))} />
            
            {news24Shorts.length > 0 && (
                <div className="w-full max-w-[1280px] mx-auto px-4 mb-12">
                    <ShortVideos shorts={news24Shorts} title="न्यूज़24 शॉर्ट्स" />
                </div>
            )}

            <TechnologySection news={fillNews(filterCategory('technology'))} />
            <BusinessSection news={fillNews(filterCategory('business'))} />
        </div>
    );
}
