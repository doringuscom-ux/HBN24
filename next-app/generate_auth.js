const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app', 'api', 'auth');

function createRoute(routePath, content) {
    const fullPath = path.join(baseDir, routePath, 'route.js');
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}

// /api/auth/login
createRoute('login', 
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(request) {
    await dbConnect();
    try {
        const { username, password } = await request.json();
        const admin = await Admin.findOne({ username });
        if (!admin) return NextResponse.json({ message: 'Invalid Credentials' }, { status: 400 });

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return NextResponse.json({ message: 'Invalid Credentials' }, { status: 400 });

        const payload = { admin: { id: admin.id, role: admin.role || 'user' } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

        return NextResponse.json({ token, username: admin.username, role: admin.role || 'user' });
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
);

// /api/auth/verify
createRoute('verify', 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getAuthUser } from '@/utils/auth';

export async function GET() {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const admin = await Admin.findById(authAdmin.id);
        if (!admin) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        return NextResponse.json({ valid: true, adminId: authAdmin.id, role: admin.role, username: admin.username });
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
);

// /api/auth/users
createRoute('users', 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getAuthUser } from '@/utils/auth';

export async function GET() {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin || authAdmin.role !== 'admin') return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });

    try {
        const users = await Admin.find().select('-password');
        return NextResponse.json(users);
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin || authAdmin.role !== 'admin') return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });

    try {
        const { username, password, role, email, phone, profileImage } = await request.json();
        let admin = await Admin.findOne({ username });
        if (admin) return NextResponse.json({ message: 'User already exists' }, { status: 400 });

        admin = new Admin({ username, password, role: role || 'user', email, phone, profileImage });
        await admin.save();
        return NextResponse.json({ message: 'User created successfully', user: admin }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
);
