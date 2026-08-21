const express = require('express');
const router = express.Router();
const BreakingNews = require('../../models/BreakingNews');
const authMiddleware = require('../middleware/authMiddleware');

// Get active breaking news (Public)
router.get('/', async (req, res) => {
    try {
        const breakingNews = await BreakingNews.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(breakingNews);
    } catch (error) {
        console.error('Error fetching breaking news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all breaking news (Admin)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const allNews = await BreakingNews.find().sort({ createdAt: -1 });
        res.json(allNews);
    } catch (error) {
        console.error('Error fetching all breaking news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create breaking news (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }
        const newNews = new BreakingNews({ text });
        await newNews.save();
        res.status(201).json(newNews);
    } catch (error) {
        console.error('Error creating breaking news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle breaking news active status (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        const updatedNews = await BreakingNews.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );
        
        if (!updatedNews) {
            return res.status(404).json({ message: 'Breaking news not found' });
        }
        
        res.json(updatedNews);
    } catch (error) {
        console.error('Error updating breaking news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete breaking news (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await BreakingNews.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Breaking news not found' });
        }
        
        res.json({ message: 'Breaking news deleted' });
    } catch (error) {
        console.error('Error deleting breaking news:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
