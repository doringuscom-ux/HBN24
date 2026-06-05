const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hbn24_news', // The folder name in your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    }
});

const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary and return the URL
// @access  Private (Admin only)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Return the secure URL from Cloudinary
        res.json({ 
            message: 'Upload successful', 
            imageUrl: req.file.path 
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;
