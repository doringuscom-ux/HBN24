const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const News = require('../../models/News');
const ActivityLog = require('../../models/ActivityLog');
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
                id: admin.id,
                role: admin.role || 'user'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: admin.username, role: admin.role || 'user' });
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
router.get('/verify', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ valid: true, adminId: req.admin.id, role: admin.role, username: admin.username });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
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
                id: admin.id,
                role: admin.role || 'user'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: admin.username, role: admin.role || 'user' });
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
    if (req.admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
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
    if (req.admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { username, password, role, email, phone, profileImage } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ message: 'User already exists' });
        }

        admin = new Admin({
            username,
            password,
            role: role || 'user',
            email,
            phone,
            profileImage
        });

        await admin.save();
        res.status(201).json({ message: 'User created successfully', user: { _id: admin._id, username: admin.username, role: admin.role, email: admin.email, phone: admin.phone, profileImage: admin.profileImage } });
    } catch (err) {
        console.error('Create user error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete an admin
// @access  Private
router.delete('/users/:id', authMiddleware, async (req, res) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
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

// @route   PUT /api/auth/users/:id/role
// @desc    Change user role
// @access  Private
router.put('/users/:id/role', authMiddleware, async (req, res) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { role } = req.body;
    try {
        const adminToUpdate = await Admin.findById(req.params.id);
        if (!adminToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent downgrading oneself?
        if (req.params.id === req.admin.id && role !== 'admin') {
            return res.status(400).json({ message: 'You cannot change your own role from admin' });
        }

        adminToUpdate.role = role;
        await adminToUpdate.save();
        res.json({ message: 'Role updated successfully', user: { _id: adminToUpdate._id, username: adminToUpdate.username, role: adminToUpdate.role } });
    } catch (err) {
        console.error('Update role error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user details (email, phone, password, role)
// @access  Private
router.put('/users/:id', authMiddleware, async (req, res) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { username, password, role, email, phone, profileImage } = req.body;
    try {
        const adminToUpdate = await Admin.findById(req.params.id);
        if (!adminToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username && username !== adminToUpdate.username) {
            const existing = await Admin.findOne({ username });
            if (existing && existing._id.toString() !== req.params.id) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            
            const oldUsername = adminToUpdate.username;
            adminToUpdate.username = username;

            // Update author name in News collection
            await News.updateMany(
                { author: oldUsername },
                { $set: { author: username } }
            );
        }

        if (password) adminToUpdate.password = password;
        if (role) {
            if (req.params.id === req.admin.id && role !== 'admin') {
                return res.status(400).json({ message: 'You cannot change your own role from admin' });
            }
            adminToUpdate.role = role;
        }
        if (email !== undefined && email !== adminToUpdate.email) {
            if (email !== '') {
                const existingEmail = await Admin.findOne({ email });
                if (existingEmail && existingEmail._id.toString() !== adminToUpdate._id.toString()) {
                    return res.status(400).json({ message: 'Email already taken by another user' });
                }
            }
            adminToUpdate.email = email;
        }

        if (phone !== undefined && phone !== adminToUpdate.phone) {
            if (phone !== '') {
                const existingPhone = await Admin.findOne({ phone });
                if (existingPhone && existingPhone._id.toString() !== adminToUpdate._id.toString()) {
                    return res.status(400).json({ message: 'Phone number already taken by another user' });
                }
            }
            adminToUpdate.phone = phone;
        }

        if (profileImage !== undefined) adminToUpdate.profileImage = profileImage;

        await adminToUpdate.save();
        res.json({ 
            message: 'User updated successfully', 
            user: { 
                _id: adminToUpdate._id, 
                username: adminToUpdate.username, 
                role: adminToUpdate.role,
                email: adminToUpdate.email,
                phone: adminToUpdate.phone,
                profileImage: adminToUpdate.profileImage
            } 
        });
    } catch (err) {
        console.error('Update user error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/profile/:username
// @desc    Get public profile of a user/admin
// @access  Public
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const searchName = username.replace(/-/g, ' ');
        const user = await Admin.findOne({ username: new RegExp('^' + searchName + '$', 'i') }).select('username role email profileImage');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Fetch profile error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/profile
// @desc    Get own full profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await Admin.findById(req.admin.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Fetch own profile error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/auth/profile
// @desc    Update own profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
    const { username, password, email, phone, profileImage } = req.body;
    try {
        const adminToUpdate = await Admin.findById(req.admin.id);
        if (!adminToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username && username !== adminToUpdate.username) {
            const existing = await Admin.findOne({ username: new RegExp('^' + username + '$', 'i') });
            if (existing && existing._id.toString() !== adminToUpdate._id.toString()) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        if (email && email !== adminToUpdate.email && email !== '') {
            const existingEmail = await Admin.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== adminToUpdate._id.toString()) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        if (phone && phone !== adminToUpdate.phone && phone !== '') {
            const existingPhone = await Admin.findOne({ phone });
            if (existingPhone && existingPhone._id.toString() !== adminToUpdate._id.toString()) {
                return res.status(400).json({ message: 'Phone number already taken' });
            }
        }

        let changes = [];
        if (username && username !== adminToUpdate.username) {
            const oldUsername = adminToUpdate.username;
            adminToUpdate.username = username;
            changes.push('username');
            
            // Update author name in News collection
            await News.updateMany(
                { author: oldUsername },
                { $set: { author: username } }
            );
        }

        if (password) {
            adminToUpdate.password = password;
            changes.push('password');
        }
        if (email !== undefined && email !== adminToUpdate.email) {
            adminToUpdate.email = email;
            changes.push('email');
        }
        if (phone !== undefined && phone !== adminToUpdate.phone) {
            adminToUpdate.phone = phone;
            changes.push('phone');
        }
        if (profileImage !== undefined && profileImage !== adminToUpdate.profileImage) {
            adminToUpdate.profileImage = profileImage;
            changes.push(!profileImage ? 'removed profile image' : 'updated profile image');
        }

        await adminToUpdate.save();

        if (changes.length > 0) {
            await ActivityLog.create({
                user: req.admin.id,
                username: adminToUpdate.username,
                action: 'PROFILE_UPDATE',
                details: `Updated: ${changes.join(', ')}`
            });
        }

        res.json({ 
            message: 'Profile updated successfully', 
            user: { 
                _id: adminToUpdate._id, 
                username: adminToUpdate.username, 
                role: adminToUpdate.role,
                email: adminToUpdate.email,
                phone: adminToUpdate.phone,
                profileImage: adminToUpdate.profileImage
            } 
        });
    } catch (err) {
        console.error('Update profile error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/logs
// @desc    Get activity logs
// @access  Private
router.get('/logs', authMiddleware, async (req, res) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        console.error('Fetch logs error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
