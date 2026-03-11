const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Report = require('../models/Report');
const Holiday = require('../models/Holiday');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Apply auth to all routes
router.use(auth);

// Attendance - Consolidated Logic
const processAttendance = async (req, res, type) => {
    console.log(`[Attendance] Operation: ${type} for ${req.user.email}`);
    try {
        // Use local date for better alignment with user expectations
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const today = istDate.toISOString().split('T')[0];
        const time = istDate.toLocaleTimeString();

        console.log(`[Attendance] Calculated Date: ${today}, Time: ${time}`);

        let attendance = await Attendance.findOne({ employee: req.user._id, date: today });

        if (type === 'check-in' || type === 'checkIn') {
            if (attendance) return res.status(400).send({ message: 'Personnel node already active for today.' });
            attendance = new Attendance({
                employee: req.user._id,
                date: today,
                checkIn: time,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                locationName: req.body.locationName,
                biometricPhoto: req.body.biometricPhoto,
                status: 'Present'
            });
        } else if (type === 'check-out' || type === 'checkOut') {
            if (!attendance) return res.status(400).send({ message: 'Must initialize operational shift first.' });
            if (attendance.checkOut) return res.status(400).send({ message: 'Operational shift already terminated.' });
            attendance.checkOut = time;
        }

        if (attendance.isNew) {
            console.log(`[Attendance] Creating new record for ${req.user.email}`);
        } else {
            console.log(`[Attendance] Updating existing record for ${req.user.email}`);
        }

        await attendance.save();
        console.log(`[Attendance] Success: ${type} logged at ${today} ${time}`);
        res.send(attendance);
    } catch (e) {
        console.error('[Attendance] CRITICAL FAILURE:', e);
        res.status(400).send({
            message: 'Registry update failed.',
            details: e.message,
            stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
    }
};

router.post('/attendance', (req, res) => processAttendance(req, res, req.body.type));
router.post('/check-in', (req, res) => processAttendance(req, res, 'check-in'));
router.post('/check-out', (req, res) => processAttendance(req, res, 'check-out'));

// Get Attendance History
router.get('/attendance', async (req, res) => {
    try {
        const attendance = await Attendance.find({ employee: req.user._id }).sort({ createdAt: -1 });
        res.send(attendance);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Leave Request
router.post('/request-leave', async (req, res) => {
    console.log('Leave request received:', req.body);
    try {
        const leave = new Leave({
            ...req.body,
            employee: req.user._id
        });
        await leave.save();
        res.status(201).send(leave);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get Leave History
router.get('/leave', async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
        res.send(leaves);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get Global Holidays
router.get('/holidays', async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.send(holidays);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Submit Report
router.post('/submit-report', upload.single('image'), async (req, res) => {
    console.log('[Report] Request body:', req.body);
    console.log('[Report] File:', req.file);
    try {
        const reportData = { ...req.body };

        // Remove 'image' if it was sent as a field in req.body (e.g. from FormData.append('image', null))
        // Multer will populate req.file if a real image was uploaded.
        if (req.file) {
            reportData.image = req.file.filename;
        } else {
            delete reportData.image;
        }

        const report = new Report({
            ...reportData,
            employee: req.user._id
        });
        await report.save();
        res.status(201).send(report);
    } catch (e) {
        console.error('[Report] Submission error:', e);
        res.status(400).send({ error: e.message || 'Telemetry transmission failed.' });
    }
});

// Update Profile
router.patch('/profile', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['phone', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' });

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Change Password (Dedicated route for Settings.jsx)
router.put('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).send({ message: 'Current authorization key is invalid.' });
        }
        req.user.password = newPassword;
        await req.user.save();
        res.send({ message: 'Security Matrix Updated Successfully.' });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get Employee Reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find({ employee: req.user._id }).sort({ createdAt: -1 });
        res.send(reports);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
