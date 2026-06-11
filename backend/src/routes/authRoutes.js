const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Validate password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Return jsonwebtoken
        const payload = {
            admin: {
                id: admin.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: admin.username });
            }
        );
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/verify
// @desc    Verify if token is valid
// @access  Private
router.get('/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, adminId: req.admin.id });
});

// @route   GET /api/auth/refresh
// @desc    Refresh token and get a new 24h token
// @access  Private
router.get('/refresh', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const payload = {
            admin: {
                id: admin.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: admin.username });
            }
        );
    } catch (err) {
        console.error('Refresh token error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/users
// @desc    Get all admins
// @access  Private
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await Admin.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Fetch users error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/users
// @desc    Create a new admin
// @access  Private
router.post('/users', authMiddleware, async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ message: 'User already exists' });
        }

        admin = new Admin({
            username,
            password
        });

        await admin.save();
        res.status(201).json({ message: 'User created successfully', user: { _id: admin._id, username: admin.username } });
    } catch (err) {
        console.error('Create user error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete an admin
// @access  Private
router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        const adminIdToDelete = req.params.id;
        
        // Prevent deleting oneself
        if (adminIdToDelete === req.admin.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const admin = await Admin.findById(adminIdToDelete);
        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Admin.findByIdAndDelete(adminIdToDelete);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
