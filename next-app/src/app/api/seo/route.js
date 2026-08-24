import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GlobalSeo from '@/models/GlobalSeo';
import jwt from 'jsonwebtoken';

const verifyAuth = (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return false;
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        return true;
    } catch {
        return false;
    }
};

export async function GET() {
    try {
        await connectToDatabase();
        let seo = await GlobalSeo.findOne();
        if (!seo) {
            seo = new GlobalSeo();
            await seo.save();
        }
        return NextResponse.json(seo);
    } catch (error) {
        console.error('Error fetching global SEO:', error);
        return NextResponse.json({ message: 'Server error fetching SEO settings' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!verifyAuth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    try {
        await connectToDatabase();
        const body = await req.json();
        let seo = await GlobalSeo.findOne();
        if (seo) {
            seo.siteTitle = body.siteTitle;
            seo.metaDescription = body.metaDescription;
            seo.metaKeywords = body.metaKeywords;
            seo.robots = body.robots;
            seo.googleAnalyticsId = body.googleAnalyticsId;
            if (body.liveTvUrl !== undefined) seo.liveTvUrl = body.liveTvUrl;
            if (body.liveTvType !== undefined) seo.liveTvType = body.liveTvType;
            seo.updatedAt = Date.now();
            await seo.save();
        } else {
            seo = new GlobalSeo(body);
            await seo.save();
        }
        return NextResponse.json({ message: 'SEO settings updated successfully', seo });
    } catch (error) {
        console.error('Error updating global SEO:', error);
        return NextResponse.json({ message: 'Server error updating SEO settings' }, { status: 500 });
    }
}

