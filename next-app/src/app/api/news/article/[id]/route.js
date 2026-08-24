import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = global.newsCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCache) global.newsCache = cache;

export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        
        // params in Next.js 15+ needs to be awaited if accessing asynchronously, but in Route Handlers we can access it directly or await it.
        // It's safer to await params just in case.
        const { id } = await params;
        
        const cacheKey = `article_${id}`;
        if (cache.has(cacheKey)) {
            return NextResponse.json(cache.get(cacheKey));
        }

        let article;

        if (mongoose.Types.ObjectId.isValid(id)) {
            article = await News.findById(id);
        }

        if (!article) {
            article = await News.findOne({ slug: id });
        }

        if (!article) {
            article = await News.findOne({ previousSlugs: id });
            if (article) {
                return NextResponse.json({ redirect: true, newSlug: article.slug || article._id });
            }
        }

        if (!article) {
            return NextResponse.json({ message: 'News not found' }, { status: 404 });
        }

        cache.set(cacheKey, article);
        return NextResponse.json(article);
    } catch (error) {
        console.error('Error fetching single article:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
