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
