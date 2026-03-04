const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { auth, adminAuth } = require('../middleware/auth');

// Get all announcements (All users)
router.get('/', auth, async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('author', 'name email employeeId')
            .sort({ createdAt: -1 });
        res.send(announcements);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Create announcement (Admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const announcement = new Announcement({
            ...req.body,
            author: req.user._id
        });
        await announcement.save();
        res.status(201).send(announcement);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete announcement (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).send();
        res.send(announcement);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
