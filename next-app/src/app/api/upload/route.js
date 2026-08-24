import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getAuthUser } from '@/utils/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    const authAdmin = await getAuthUser();
    if (!authAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get('image') || formData.get('file');

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'hbn24_news' },
                (error, result) => {
                    if (error) {
                        reject(NextResponse.json({ message: 'Error uploading file: ' + error.message }, { status: 500 }));
                    } else {
                        resolve(NextResponse.json({ message: 'Upload successful', imageUrl: result.secure_url }));
                    }
                }
            );
            uploadStream.end(buffer);
        });

    } catch (error) {
        return NextResponse.json({ message: 'Server error during upload processing' }, { status: 500 });
    }
}
