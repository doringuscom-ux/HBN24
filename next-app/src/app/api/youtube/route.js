import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const isWithin5Days = (text) => {
            if (!text) return false;
            const lower = text.toLowerCase();
            if (lower === "recently") return true;
            if (lower.includes('minute') || lower.includes('hour') || lower.includes('second')) return true;
            if (lower.includes('day')) {
                const match = lower.match(/(\d+)/);
                if (match) {
                    return parseInt(match[1]) <= 5;
                }
            }
            return false;
        };

        const fetchVideos = async () => {
            const response = await fetch('https://www.youtube.com/@HBNNews24x7/videos', { next: { revalidate: 3600 } });
            const html = await response.text();
            const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
            if (!match) return [];
            const ytData = JSON.parse(match[1]);
            const tabs = ytData.contents.twoColumnBrowseResultsRenderer.tabs;
            const videosTab = tabs.find(t => t.tabRenderer.title === 'Videos' || t.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.includes('/videos'));
            if (!videosTab) return [];
            const items = videosTab.tabRenderer.content.richGridRenderer.contents;
            return items.filter(item => item.richItemRenderer && (item.richItemRenderer.content.videoRenderer || item.richItemRenderer.content.lockupViewModel)).map(item => {
                const content = item.richItemRenderer.content;
                if (content.videoRenderer) {
                    const video = content.videoRenderer;
                    return {
                        videoId: video.videoId,
                        title: video.title.runs[0].text,
                        link: `https://www.youtube.com/watch?v=${video.videoId}`,
                        image: video.thumbnail.thumbnails[video.thumbnail.thumbnails.length - 1].url,
                        publishedAt: video.publishedTimeText?.simpleText || "Recently",
                        duration: video.lengthText?.simpleText || "Watch"
                    };
                } else {
                    const video = content.lockupViewModel;
                    const videoId = video.contentId;
                    const titleMatch = JSON.stringify(video).match(/"content":"([^"]+)"/);
                    const title = titleMatch ? titleMatch[1] : "YouTube Video";
                    return {
                        videoId: videoId,
                        title: title,
                        link: `https://www.youtube.com/watch?v=${videoId}`,
                        image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                        publishedAt: "Recently",
                        duration: "Watch"
                    };
                }
            }).slice(0, 10);
        };

        const fetchShorts = async (url) => {
            const response = await fetch(url, { next: { revalidate: 3600 } });
            const html = await response.text();
            const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
            if (!match) return [];
            const ytData = JSON.parse(match[1]);
            const tabs = ytData.contents.twoColumnBrowseResultsRenderer.tabs;
            const shortsTab = tabs.find(t => t.tabRenderer.title === 'Shorts' || (t.tabRenderer.endpoint && t.tabRenderer.endpoint.commandMetadata && t.tabRenderer.endpoint.commandMetadata.webCommandMetadata.url.includes('/shorts')));
            if (!shortsTab) return [];
            const items = shortsTab.tabRenderer.content.richGridRenderer.contents;
            return items.filter(item => item.richItemRenderer && item.richItemRenderer.content.shortsLockupViewModel).map(item => {
                const short = item.richItemRenderer.content.shortsLockupViewModel;
                const videoId = short.entityId.replace('shorts-shelf-item-', '');
                return {
                    videoId: videoId,
                    title: short.overlayMetadata?.primaryText?.content || short.accessibilityText || "YouTube Short",
                    link: `https://www.youtube.com/shorts/${videoId}`,
                    image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    publishedAt: "Recently",
                    duration: "Short"
                };
            }).slice(0, 6); // Limiting to fewer shorts to roughly approximate 5 days since they lack exact dates
        };

        const [videos, shorts, news24Shorts] = await Promise.all([
            fetchVideos(), 
            fetchShorts('https://www.youtube.com/@HBNNews24x7/shorts'),
            fetchShorts('https://www.youtube.com/@News24thinkfirst/shorts')
        ]);

        return NextResponse.json({ videos, shorts, news24Shorts });
    } catch (error) {
        console.error('Error fetching YouTube Data:', error);
        return NextResponse.json({ message: 'Error fetching videos' }, { status: 500 });
    }
}

