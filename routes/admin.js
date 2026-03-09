const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Report = require('../models/Report');
const { adminAuth } = require('../middleware/auth');

// Apply admin auth to all routes
router.use(adminAuth);

// Create Employee
router.post('/employees', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get All Employees
router.get('/employees', async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' });
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Delete Employee
router.delete('/employees/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send();
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Update Employee
router.put('/employees/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'employeeId', 'password', 'expertise'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send();

        updates.forEach((update) => {
            if (update === 'password') {
                if (req.body.password && req.body.password.trim() !== '') {
                    user.password = req.body.password;
                }
            } else {
                user[update] = req.body[update];
            }
        });

        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Admin Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: 'employee' });
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = await Attendance.countDocuments({ date: today, status: 'Present' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const todayReports = await Report.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        res.send({
            totalEmployees,
            todayAttendance,
            pendingLeaves,
            todayReports
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Attendance Management
router.get('/attendance', async (req, res) => {
    try {
        const query = {};
        if (req.query.date) query.date = req.query.date;
        const attendance = await Attendance.find(query).populate('employee', 'name employeeId');
        res.send(attendance);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get All Leave Requests (Admin)
router.get('/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employee', 'name email employeeId')
            .sort({ createdAt: -1 });
        res.send(leaves);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Leave Management (Support both PUT and PATCH)
router.route('/leaves/:id').put(async (req, res) => {
    try {
        const { status } = req.body;
        const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!leave) return res.status(404).send();
        res.send(leave);
    } catch (e) {
        res.status(400).send(e);
    }
}).patch(async (req, res) => {
    try {
        const { status } = req.body;
        const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!leave) return res.status(404).send();
        res.send(leave);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Report Management
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('employee', 'name email employeeId')
            .sort({ createdAt: -1 });
        res.send(reports);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
