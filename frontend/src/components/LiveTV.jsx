import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function LiveTV() {
    const videoRef = useRef(null);
    const [src, setSrc] = useState('');
    const [isYouTube, setIsYouTube] = useState(false);

    useEffect(() => {
        const fetchSeo = async () => {
            try {
                const res = await fetch(__API_URL__ + '/api/seo');
                const data = await res.json();
                if (data && data.liveTvUrl) {
                    setSrc(data.liveTvUrl);
                    setIsYouTube(data.liveTvType === 'youtube');
                } else {
                    setSrc("https://vidcdn.vidgyor.com/news24-origin/liveabr/playlist.m3u8");
                }
            } catch (error) {
                console.error("Error fetching Live TV URL:", error);
                setSrc("https://vidcdn.vidgyor.com/news24-origin/liveabr/playlist.m3u8");
            }
        };
        fetchSeo();
    }, []);
    useEffect(() => {
        if (!src || isYouTube) return;

        const video = videoRef.current;
        if (!video) return;

        let hls;
        if (Hls.isSupported()) {
            hls = new Hls({
                autoStartLoad: true,
                startPosition: -1,
                debug: false
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(e => console.log("Autoplay prevented:", e));
            });
        }
        // Fallback for native HLS support (like Safari)
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function() {
                video.play().catch(e => console.log("Autoplay prevented:", e));
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src, isYouTube]);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytVideoId = isYouTube ? getYouTubeId(src) : null;

    return (
        <div className="w-full bg-[#111] rounded-[8px] overflow-hidden shadow-lg mb-8 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-red-600 to-red-800">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <h2 className="text-white font-bold text-lg tracking-wide">LIVE TV</h2>
                </div>
                <span className="text-white/90 text-[11px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">HBN 24</span>
            </div>
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                {src ? (
                    isYouTube && ytVideoId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&playsinline=1`}
                            title="YouTube Live TV"
                            className="absolute top-0 left-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <video 
                            ref={videoRef} 
                            controls 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover absolute top-0 left-0"
                        />
                    )
                ) : (
                    <div className="text-white text-sm">Loading Live TV...</div>
                )}
            </div>
        </div>
    );
}
