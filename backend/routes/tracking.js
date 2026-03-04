const express = require('express');
const router = express.Router();
const Tracking = require('../models/Tracking');
const { auth, adminAuth } = require('../middleware/auth');

// Apply auth to all routes
router.use(auth);

// Start Tracking Session
router.post('/start', auth, async (req, res) => {
    try {
        const { latitude, longitude, locationName } = req.body;

        // Finalize any previous active sessions for this employee
        await Tracking.updateMany(
            { employee: req.user._id, status: 'active' },
            { status: 'completed', endTime: new Date() }
        );

        const tracking = new Tracking({
            employee: req.user._id,
            locationName,
            path: [{ latitude, longitude }]
        });

        await tracking.save();
        res.status(201).send(tracking);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Update Tracking Path
router.post('/update', auth, async (req, res) => {
    try {
        const { latitude, longitude, locationName } = req.body;
        const tracking = await Tracking.findOne({ employee: req.user._id, status: 'active' });

        if (!tracking) {
            return res.status(404).send({ message: 'No active session' });
        }

        tracking.path.push({ latitude, longitude });
        if (locationName) tracking.locationName = locationName;

        await tracking.save();
        res.send(tracking);
    } catch (e) {
        res.status(400).send(e);
    }
});

// End Tracking Session
router.post('/end', auth, async (req, res) => {
    try {
        const { latitude, longitude, locationName } = req.body;
        const tracking = await Tracking.findOne({ employee: req.user._id, status: 'active' });

        if (!tracking) {
            return res.status(404).send({ message: 'No active session' });
        }

        if (latitude && longitude) {
            tracking.path.push({ latitude, longitude });
        }
        if (locationName) tracking.locationName = locationName;

        tracking.status = 'completed';
        tracking.endTime = new Date();
        await tracking.save();
        res.send(tracking);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get All Sessions (History) (Admin Only)
router.get('/history', adminAuth, async (req, res) => {
    try {
        const sessions = await Tracking.find()
            .populate('employee', 'name email employeeId profilePhoto')
            .sort({ createdAt: -1 });
        res.send(sessions);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Delete Tracking Session (Admin Only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const session = await Tracking.findByIdAndDelete(req.params.id);
        if (!session) {
            return res.status(404).send({ message: 'Tracking session not found' });
        }
        res.send({ message: 'Session deleted successfully', _id: session._id });
    } catch (e) {
        res.status(500).send({ message: 'Error deleting tracking session', error: e.message });
    }
});

module.exports = router;
