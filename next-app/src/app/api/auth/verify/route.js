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
