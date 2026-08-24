import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
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

export async function GET(req) {
    if (!verifyAuth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await connectToDatabase();
        const count = await News.countDocuments({
            $or: [
                { metaDescription: { $exists: false } },
                { metaDescription: "" }
            ]
        });
        return NextResponse.json({ missingCount: count });
    } catch (err) {
        return NextResponse.json({ message: 'Error fetching count' }, { status: 500 });
    }
}

