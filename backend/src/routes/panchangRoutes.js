const express = require('express');
const router = express.Router();
const Panchang = require('../../models/Panchang');
const authMiddleware = require('../middleware/authMiddleware');

const defaultPanchang = {
    tithi: "ज्येष्ठ कृष्ण पक्ष, तृतीया",
    samvat: "विक्रम संवत 2083 • बुधवार"
};

// @route   GET /api/panchang
// @desc    Get the current panchang data
// @access  Public
router.get('/', async (req, res) => {
    try {
        let panchang = await Panchang.findOne().sort({ date: -1 });
        if (!panchang) {
            return res.json(defaultPanchang);
        }
        res.json({ tithi: panchang.tithi, samvat: panchang.samvat });
    } catch (error) {
        console.error('Error fetching panchang:', error);
        res.status(500).json({ message: 'Server error fetching panchang' });
    }
});

// @route   POST /api/panchang
// @desc    Update panchang manually
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { tithi, samvat } = req.body;
        if (!tithi || !samvat) {
            return res.status(400).json({ message: 'Tithi and Samvat are required' });
        }

        let panchang = await Panchang.findOne();
        if (panchang) {
            panchang.tithi = tithi;
            panchang.samvat = samvat;
            panchang.date = Date.now();
            await panchang.save();
        } else {
            panchang = new Panchang({ tithi, samvat });
            await panchang.save();
        }

        res.json({ message: 'Panchang updated successfully', data: panchang });
    } catch (error) {
        console.error('Error updating panchang:', error);
        res.status(500).json({ message: 'Server error updating panchang' });
    }
});

module.exports = router;
