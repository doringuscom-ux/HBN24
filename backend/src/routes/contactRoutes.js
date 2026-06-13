const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const auth = require('../middleware/authMiddleware');

// Public route to submit a new message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const newMessage = new ContactMessage({
            name,
            email,
            subject,
            message
        });

        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Protected route for admin to fetch all messages
router.get('/', auth, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
});

// Protected route to mark message as read
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { status } = req.body;
        const message = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ error: 'Failed to update message status.' });
    }
});

// Protected route to delete message
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!req.admin || req.admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const message = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message.' });
    }
});

module.exports = router;
