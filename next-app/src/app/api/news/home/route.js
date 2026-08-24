import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = global.newsCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCache) global.newsCache = cache;

export async function GET() {
    try {
        await connectToDatabase();
        const cacheKey = 'home_news';
        
        if (cache.has(cacheKey)) {
            return NextResponse.json(cache.get(cacheKey));
        }

        const categories = ['sports', 'religion', 'lifestyle', 'technology', 'business', 'entertainment', 'superfast', 'featured'];
        
        const queries = categories.map(cat => 
            News.find({ category: cat, status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(12)
        );
        
        queries.push(News.find({ category: { $nin: categories }, status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(12));
        queries.push(News.find({ status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(20));

        const results = await Promise.all(queries);
        
        const homeData = {};
        categories.forEach((cat, index) => {
            homeData[cat] = results[index];
        });
        homeData.mixNews = results[categories.length];
        const latestFallback = results[categories.length + 1];

        const fillNews = (categoryNews, excludeIds = new Set()) => {
            if (categoryNews.length >= 12) return categoryNews;
            const borrowed = latestFallback.filter(n => {
                if (categoryNews.some(cn => cn._id.equals(n._id))) return false;
                if (excludeIds.has(n._id.toString())) return false;
                return true;
            });
            return [...categoryNews, ...borrowed].slice(0, 12);
        };

        homeData.superfast = fillNews(homeData.superfast || []);
        homeData.featured = fillNews(homeData.featured || []);

        const topNewsIds = new Set();
        homeData.superfast.forEach(n => topNewsIds.add(n._id.toString()));
        homeData.featured.forEach(n => topNewsIds.add(n._id.toString()));

        homeData.mixNews = fillNews(homeData.mixNews || [], topNewsIds);
        categories.forEach(cat => {
            if (cat !== 'superfast' && cat !== 'featured') {
                homeData[cat] = fillNews(homeData[cat] || [], topNewsIds);
            }
        });
        
        homeData.latestNews = latestFallback;

        cache.set(cacheKey, homeData);
        return NextResponse.json(homeData);
    } catch (error) {
        console.error('Error fetching home news:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
