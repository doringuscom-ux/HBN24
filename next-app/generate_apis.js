const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app', 'api');

function createRoute(routePath, modelName) {
    const fullPath = path.join(baseDir, routePath, 'route.js');
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    
    const content = 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import  from '@/models/';
import { getAuthUser } from '@/utils/auth';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100;
        const items = await .find().sort({ createdAt: -1 }).limit(limit);
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
        const item = new (body);
        await item.save();
        return NextResponse.json(item, { status: 201 });
    } catch (err) {
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
;
    fs.writeFileSync(fullPath, content.trim());
}

createRoute('breaking', 'BreakingNews');
createRoute('epaper', 'Epaper');
createRoute('polls', 'Poll');
createRoute('panchang', 'Panchang');
createRoute('rashifal', 'Rashifal');
createRoute('suvichar', 'Suvichar');
createRoute('contact', 'ContactMessage');

