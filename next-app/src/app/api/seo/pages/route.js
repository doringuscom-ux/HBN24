import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
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
        const pages = await PageSeo.find();
        return NextResponse.json(pages);
    } catch (err) {
        return NextResponse.json({ message: 'Error fetching page SEOs' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!verifyAuth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    try {
        await connectToDatabase();
        const { pageUrl, metaTitle, metaDescription, metaKeywords, robots } = await req.json();
        if (!pageUrl) return NextResponse.json({ message: 'Page URL is required' }, { status: 400 });

        let pageSeo = await PageSeo.findOne({ pageUrl });
        if (pageSeo) {
            pageSeo.metaTitle = metaTitle;
            pageSeo.metaDescription = metaDescription;
            pageSeo.metaKeywords = metaKeywords;
            pageSeo.robots = robots || 'index, follow';
            pageSeo.updatedAt = Date.now();
            await pageSeo.save();
        } else {
            pageSeo = new PageSeo({ pageUrl, metaTitle, metaDescription, metaKeywords, robots });
            await pageSeo.save();
        }
        return NextResponse.json({ message: 'Page SEO saved', pageSeo });
    } catch (err) {
        return NextResponse.json({ message: 'Error saving page SEO' }, { status: 500 });
    }
}

