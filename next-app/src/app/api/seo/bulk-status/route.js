import { NextResponse } from 'next/server';
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

let bulkStatus = {
    isRunning: false,
    total: 0,
    processed: 0,
    success: 0,
    failed: 0
};

export async function GET(req) {
    if (!verifyAuth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(bulkStatus);
}

