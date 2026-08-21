const express = require('express');
const router = express.Router();
const Poll = require('../../models/Poll');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/poll/active
// @desc    Get the active poll
// @access  Public
router.get('/active', async (req, res) => {
    try {
        const activePoll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
        if (!activePoll) {
            return res.status(404).json({ message: 'No active poll found.' });
        }

        // Format data to include percentages and total votes
        let totalVotes = 0;
        activePoll.options.forEach(opt => {
            totalVotes += (opt.initialVotes + opt.realVotes);
        });

        const formattedOptions = activePoll.options.map(opt => {
            const optionTotal = opt.initialVotes + opt.realVotes;
            const percentage = totalVotes === 0 ? 0 : Math.round((optionTotal / totalVotes) * 100);
            return {
                id: opt.id,
                text: opt.text,
                emoji: opt.emoji,
                percentage: percentage
            };
        });

        res.json({
            id: activePoll._id,
            question: activePoll.question,
            totalVotes: totalVotes,
            options: formattedOptions
        });
    } catch (error) {
        console.error('Error fetching active poll:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/poll/:id/vote
// @desc    Submit a vote to a poll
// @access  Public
router.post('/:id/vote', async (req, res) => {
    try {
        const { optionId } = req.body;
        const poll = await Poll.findById(req.params.id);
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found.' });
        }

        const optionIndex = poll.options.findIndex(opt => opt.id === parseInt(optionId));
        if (optionIndex === -1) {
            return res.status(400).json({ message: 'Invalid option.' });
        }

        // Increment real vote count
        poll.options[optionIndex].realVotes += 1;
        await poll.save();

        // Calculate updated percentages
        let totalVotes = 0;
        poll.options.forEach(opt => {
            totalVotes += (opt.initialVotes + opt.realVotes);
        });

        const formattedOptions = poll.options.map(opt => {
            const optionTotal = opt.initialVotes + opt.realVotes;
            const percentage = totalVotes === 0 ? 0 : Math.round((optionTotal / totalVotes) * 100);
            return {
                id: opt.id,
                text: opt.text,
                emoji: opt.emoji,
                percentage: percentage
            };
        });

        res.json({
            message: 'Vote successful',
            totalVotes: totalVotes,
            options: formattedOptions
        });
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/poll
// @desc    Create a new poll (Admin)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { question, options } = req.body;
        
        // Deactivate all previous polls
        await Poll.updateMany({}, { isActive: false });

        const newPoll = new Poll({
            question,
            options,
            isActive: true
        });

        await newPoll.save();
        res.status(201).json({ message: 'Poll created successfully', poll: newPoll });
    } catch (error) {
        console.error('Error creating poll:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/poll/deactivate
// @desc    Deactivate all polls (Admin)
// @access  Private
router.post('/deactivate', authMiddleware, async (req, res) => {
    try {
        await Poll.updateMany({}, { isActive: false });
        res.json({ message: 'All polls deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating polls:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
