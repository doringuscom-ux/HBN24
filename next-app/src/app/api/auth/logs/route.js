import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import jwt from 'jsonwebtoken';

const verifyAuth = (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        return decoded.admin;
    } catch {
        return null;
    }
};

export async function GET(req) {
    const adminData = verifyAuth(req);
    if (!adminData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (adminData.role !== 'admin') return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });

    try {
        await connectToDatabase();
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
        return NextResponse.json(logs);
    } catch (err) {
        console.error('Fetch logs error:', err.message);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

