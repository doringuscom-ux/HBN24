import React from 'react';
import FeaturedNews from './FeaturedNews';
import NewsGrid from './NewsGrid';
import ShortVideos from './ShortVideos';
import SidebarNews from './SidebarNews';
import EntertainmentSection from './EntertainmentSection';

export default function MainContent({ mixNews = [], entertainmentNews = [], videos = [], shorts = [], superfastNews = [] }) {
    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 mt-8 mb-12 flex flex-col gap-8">
            {/* Upper Section: Featured + NewsGrid on left, Sidebar on right */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column (70%) */}
                <div className="w-full lg:w-[70%] flex flex-col gap-8">
                    <FeaturedNews news={mixNews} />
                    <div className="w-full h-[1px] bg-gray-200"></div>
                    <NewsGrid news={mixNews} />
                </div>

                {/* Right Column (30%) - SidebarNews */}
                <div className="w-full lg:w-[30%]">
                    <div className="h-full">
                        <SidebarNews news={superfastNews} />
                    </div>
                </div>
            </div>

            <div className="w-full h-[1px] bg-gray-200"></div>

            {/* Lower Section: ShortVideos + Entertainment (Full Width) */}
            <div className="w-full flex flex-col gap-8">
                <ShortVideos shorts={shorts} />
                <EntertainmentSection news={entertainmentNews} />
            </div>
        </div>
    );
}
