const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Report = require('../models/Report');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const Task = require('../models/Task');

// Top-level: Allow both Admins and Managers to access the Command Center APIs
router.use(managerAuth);

// Create Employee
router.post('/employees', managerAuth, async (req, res) => {
    try {
        const body = { ...req.body };
        // Auto-generate employeeId if not provided, to avoid unique index conflicts
        if (!body.employeeId || body.employeeId.trim() === '') {
            body.employeeId = 'EMP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        const user = new User(body);
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).send({ error: errors.join(', ') });
        }
        if (e.code === 11000) {
            const field = Object.keys(e.keyPattern || {})[0] || 'field';
            return res.status(400).send({ error: `Duplicate value: ${field} already exists. Please use a unique email or employee ID.` });
        }
        res.status(400).send({ error: e.message });
    }
});

// Get All Personnel (Employees & Managers)
router.get('/employees', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['employee', 'manager'] } });
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Delete Employee
router.delete('/employees/:id', managerAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send();
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Update Employee
router.put('/employees/:id', managerAuth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'employeeId', 'password', 'expertise', 'role'];
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
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const activeServiceRequests = await ServiceRequest.countDocuments({ status: { $ne: 'Completed' } });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = await Attendance.countDocuments({ date: today, status: 'Present' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const pendingTasks = await Task.countDocuments({ status: { $ne: 'Completed' } });
        const todayReports = await Report.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        res.send({
            totalEmployees,
            todayAttendance,
            pendingLeaves,
            todayReports,
            totalProducts,
            totalOrders,
            activeServiceRequests,
            totalCustomers,
            pendingTasks
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

// Manager Dashboard Performance Stats (Calculates team averages)
router.get('/manager-stats', async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' });
        const PerformanceReview = require('../models/PerformanceReview');

        let totalRating = 0;
        let totalTask = 0;
        let totalAttendance = 0;
        let totalTeamwork = 0;
        let reviewCount = 0;

        for (const emp of employees) {
            totalRating += (emp.performanceRating || 0);

            // Get their latest review for detailed metrics
            const latestReview = await PerformanceReview.findOne({ employeeId: emp._id }).sort({ createdAt: -1 });
            if (latestReview && latestReview.metrics) {
                totalTask += (latestReview.metrics.taskCompletion || 0);
                totalAttendance += (latestReview.metrics.attendanceScore || 0);
                totalTeamwork += (latestReview.metrics.teamworkScore || 0);
                reviewCount++;
            }
        }

        const empCount = employees.length || 1; // avoid division by zero
        const revCount = reviewCount || 1;

        res.send({
            avgRating: (totalRating / empCount).toFixed(1),
            avgTaskCompletion: Math.round(totalTask / revCount),
            avgAttendanceScore: Math.round(totalAttendance / revCount),
            avgTeamworkScore: Math.round(totalTeamwork / revCount),
            totalEmployees: employees.length,
            reviewsLogged: reviewCount
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

// Update Attendance Status (Admin)
router.patch('/attendance/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected', 'Flagged'].includes(status)) {
            return res.status(400).send({ error: 'Invalid status update.' });
        }
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!attendance) return res.status(404).send({ error: 'Attendance record not found' });
        res.send(attendance);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete Attendance Record (Admin)
router.delete('/attendance/:id', async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!attendance) return res.status(404).send({ error: 'Attendance record not found' });
        res.send({ message: 'Attendance record purged successfully', attendance });
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
// Create a leave for an employee (Admin/Manager assigned)
router.post('/leaves', async (req, res) => {
    try {
        const leave = new Leave({
            ...req.body,
            status: 'Approved',
            isAdminEntered: true
        });
        await leave.save();
        res.status(201).send(leave);
    } catch (e) {
        res.status(400).send(e);
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

// Update Report Status (Approve/Reject)
router.patch('/reports/:id/status', async (req, res) => {
    try {
        const { adminStatus } = req.body;
        if (!['Approved', 'Rejected'].includes(adminStatus)) {
            return res.status(400).send({ error: 'Invalid status update.' });
        }
        const report = await Report.findByIdAndUpdate(req.params.id, { adminStatus }, { new: true });
        if (!report) return res.status(404).send({ error: 'Report not found' });
        res.send(report);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete Report
router.delete('/reports/:id', managerAuth, async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).send({ error: 'Report not found' });
        res.send({ message: 'Report deleted successfully', report });
    } catch (e) {
        res.status(500).send(e);
    }
});

// ====================== HOLIDAY MANAGEMENT ======================
const Holiday = require('../models/Holiday');

// Get all holidays
router.get('/holidays', async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.send(holidays);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Create a holiday (admin only)
router.post('/holidays', adminAuth, async (req, res) => {
    try {
        const holiday = new Holiday(req.body);
        await holiday.save();
        res.status(201).send(holiday);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete a holiday (admin only)
router.delete('/holidays/:id', adminAuth, async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        if (!holiday) return res.status(404).send({ error: 'Holiday not found' });
        res.send({ message: 'Deleted', holiday });
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
