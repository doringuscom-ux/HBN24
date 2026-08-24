import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Initialize cache globally so it persists across requests 
const cache = global.newsCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCache) global.newsCache = cache;

export async function GET() {
  try {
    await connectToDatabase();
    const cacheKey = 'all_news';

    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const newsList = await News.find().sort({ createdAt: -1 });
    cache.set(cacheKey, newsList);

    return NextResponse.json(newsList);
  } catch (error) {
    console.error('Error fetching all news:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// TODO: Implement POST for adding news
