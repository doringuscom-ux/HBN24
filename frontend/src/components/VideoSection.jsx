import React, { useState } from "react";

const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
};

export default function VideoSection({ videos = [] }) {
    const [mainIndex, setMainIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [animate, setAnimate] = useState(false);

    let activeVideos = videos.map((v, i) => ({ ...v, originalIndex: i }));
    
    // Fill with loading placeholders if API fails or hasn't loaded
    while (activeVideos.length < 5) {
        activeVideos.push({ originalIndex: activeVideos.length, title: "Loading...", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop", duration: "0:00", link: "#" });
    }

    // Determine current main video
    const mainVideo = activeVideos[mainIndex];
    
    // Filter out the main video from the side columns
    const remainingVideos = activeVideos.filter((_, i) => i !== mainIndex);
    const leftVideos = remainingVideos.slice(0, 2);
    const rightVideos = remainingVideos.slice(2, 4);

    const ytId = getYouTubeId(mainVideo.link);

    const handleVideoClick = (e, index) => {
        const clickedVideo = activeVideos.find(v => v.originalIndex === index);
        const clickedYtId = getYouTubeId(clickedVideo?.link);
        
        if (clickedYtId) {
            e.preventDefault();
        } else {
            return; // Let standard link behavior happen
        }

        if (index !== mainIndex) {
            // Swap animation
            setAnimate(true);
            setTimeout(() => {
                setMainIndex(index);
                setPlaying(true);
                setAnimate(false);
            }, 300);
        } else {
            // Just play
            setPlaying(true);
        }
    };

    return (
        <section className="video-section-widget">
            <div className="video-container">
                <div className="widget-head">
                    <div className="widget-title">
                        <span className="title-icon"></span>
                        <h2>वीडियो</h2>
                    </div>

                    <a href="#" className="widget-more">
                        और भी <span>▶</span>
                    </a>
                </div>

                <div className="video-inner-body">
                    <div className="video-col">
                        {leftVideos.map((video) => (
                            <VideoCard key={video.originalIndex} video={video} onClick={handleVideoClick} />
                        ))}
                    </div>

                    <div className="video-middle">
                        <div 
                            className={`main-video block relative overflow-hidden transition-all duration-300 transform w-full aspect-[16/9] ${animate ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                        >
                            {playing && ytId ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`} 
                                    title={mainVideo.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                ></iframe>
                            ) : (
                                <a 
                                    href={mainVideo.link} 
                                    onClick={(e) => handleVideoClick(e, mainVideo.originalIndex)}
                                    className="block w-full h-full cursor-pointer group"
                                >
                                    <img src={mainVideo.image} alt={mainVideo.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="main-gradient absolute inset-0 pointer-events-none"></div>
                                    <div className="main-caption absolute bottom-0 left-0 w-full p-4 pointer-events-none z-10">
                                        <h3 className="text-white text-xl font-bold">{mainVideo.title}</h3>
                                        <div className="main-play-wrap mt-2 flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                                            <div className="main-play w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">▶</div>
                                            <div className="main-duration text-white font-medium">{mainVideo.duration}</div>
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="video-col right-col">
                        {rightVideos.map((video) => (
                            <VideoCard key={video.originalIndex} video={video} onClick={handleVideoClick} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function VideoCard({ video, onClick }) {
    return (
        <a 
            href={video.link} 
            onClick={(e) => onClick(e, video.originalIndex)}
            className="video-card block cursor-pointer group"
        >
            <div className="video-thumb overflow-hidden relative">
                <img src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="duration">
                    <span className="small-play">▶</span>
                    {video.duration}
                </div>
            </div>
            <h3 className="group-hover:text-red-500 transition-colors line-clamp-2 mt-2">{video.title}</h3>
        </a>
    );
}