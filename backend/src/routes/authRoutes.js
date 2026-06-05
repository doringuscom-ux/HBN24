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

module.exports = router;
