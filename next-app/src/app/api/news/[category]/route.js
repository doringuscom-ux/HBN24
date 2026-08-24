import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = global.newsCategoryCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCategoryCache) global.newsCategoryCache = cache;

export async function GET(req, { params }) {
    try {
        const { category } = await params;
        if (!category) {
            return NextResponse.json({ message: 'Category is required' }, { status: 400 });
        }

        await connectToDatabase();
        
        // Use lowercase for case-insensitive match
        const cacheKey = `news_category_${category.toLowerCase()}`;
        
        if (cache.has(cacheKey)) {
            return NextResponse.json(cache.get(cacheKey));
        }

        // Case-insensitive regex search for category
        const newsList = await News.find({ 
            category: { $regex: new RegExp(`^${category}$`, 'i') } 
        }).sort({ createdAt: -1 });

        cache.set(cacheKey, newsList);
        
        return NextResponse.json(newsList);
    } catch (error) {
        console.error(`Error fetching ${params?.category} news:`, error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
