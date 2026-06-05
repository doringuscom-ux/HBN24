import React, { useState, useEffect } from 'react';
import BreakingNews from "../components/BreakingNews"
import MainContent from "../components/MainContent"
import VideoSection from "../components/VideoSection"
import SportsSection from "../components/SportsSection"
import ReligionSection from "../components/ReligionSection"
import LifestyleSection from "../components/LifestyleSection"
import TechnologySection from "../components/TechnologySection"
import BusinessSection from "../components/BusinessSection"

export default function Home() {
    const [news, setNews] = useState([]);
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, videoRes] = await Promise.all([
                    fetch('http://localhost:5000/api/news'),
                    fetch('http://localhost:5000/api/youtube')
                ]);
                const newsData = await newsRes.json();
                const videoData = await videoRes.json();

                setNews(newsData);
                setVideos(videoData.videos || []);
                setShorts(videoData.shorts || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching home data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;

    const filterCategory = (cat) => news.filter(n => n.category === cat);

    const specificCategories = ['sports', 'religion', 'lifestyle', 'technology', 'business', 'entertainment'];
    const mixNews = news.filter(n => !specificCategories.includes(n.category));

    return (
        <div className="bg-white">
            <BreakingNews news={news} />
            <MainContent mixNews={mixNews} entertainmentNews={filterCategory('entertainment')} videos={videos} shorts={shorts} />
            <VideoSection videos={videos} />
            <SportsSection news={filterCategory('sports')} />
            <ReligionSection news={filterCategory('religion')} />
            <LifestyleSection news={filterCategory('lifestyle')} />
            <TechnologySection news={filterCategory('technology')} />
            <BusinessSection news={filterCategory('business')} />
        </div>
    );
}
