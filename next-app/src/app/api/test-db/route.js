import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function GET() {
    try {
        await connectToDatabase();
        const pages = await PageSeo.find({}, 'pageUrl metaTitle');
        return NextResponse.json(pages);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
