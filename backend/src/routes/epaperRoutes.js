const express = require('express');
const router = express.Router();
const Epaper = require('../models/Epaper');
const upload = require('../middleware/upload');

// GET all epapers
router.get('/', async (req, res) => {
    try {
        const epapers = await Epaper.find().sort({ date: -1 });
        res.json(epapers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET epaper by date
router.get('/date/:date', async (req, res) => {
    try {
        // Find exact date
        const startOfDay = new Date(req.params.date);
        startOfDay.setUTCHours(0,0,0,0);
        const endOfDay = new Date(req.params.date);
        endOfDay.setUTCHours(23,59,59,999);

        const epaper = await Epaper.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!epaper) {
            return res.status(404).json({ message: 'Epaper not found for this date' });
        }
        res.json(epaper);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET latest epaper
router.get('/latest', async (req, res) => {
    try {
        const epaper = await Epaper.findOne().sort({ date: -1 });
        if (!epaper) return res.status(404).json({ message: 'No epaper found' });
        res.json(epaper);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new epaper
router.post('/', upload.array('pages', 50), async (req, res) => {
    try {
        const { date, editionName } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No page images uploaded' });
        }

        const pageUrls = req.files.map(file => file.path);

        const epaper = new Epaper({
            date: new Date(date),
            editionName: editionName || 'Main Edition',
            pages: pageUrls
        });

        const newEpaper = await epaper.save();
        res.status(201).json(newEpaper);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'An Epaper for this date already exists.' });
        }
        res.status(400).json({ message: err.message });
    }
});

// DELETE epaper
router.delete('/:id', async (req, res) => {
    try {
        const epaper = await Epaper.findById(req.params.id);
        if (!epaper) return res.status(404).json({ message: 'Epaper not found' });
        
        await epaper.deleteOne();
        res.json({ message: 'Epaper deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
