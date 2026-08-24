import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Epaper from '@/models/Epaper';
import { getAuthUser } from '@/utils/auth';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100;
        const items = await Epaper.find().sort({ createdAt: -1 }).limit(limit);
        return NextResponse.json(items);
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const item = new Epaper(body);
        await item.save();
        return NextResponse.json(item, { status: 201 });
    } catch (err) {
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
