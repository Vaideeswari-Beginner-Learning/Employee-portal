const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PerformanceReview = require('../models/PerformanceReview');
const { managerAuth } = require('../middleware/auth');

// @route   POST /api/performance/rate/:employeeId
// @desc    Rate an employee and add a monthly review
// @access  Admin/Manager
router.post('/rate/:employeeId', managerAuth, async (req, res) => {
    try {
        const { rating, comment, month, metrics } = req.body;
        const employeeId = req.params.employeeId;

        const employee = await User.findById(employeeId);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const review = new PerformanceReview({
            employeeId,
            reviewerId: req.user._id,
            month: month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            rating,
            comment,
            metrics
        });

        await review.save();

        // Update employee's overall rating (simple average or latest)
        // For simplicity, we'll store the latest or re-calculate
        const allReviews = await PerformanceReview.find({ employeeId });
        const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

        employee.performanceRating = Math.round(avgRating * 10) / 10;
        employee.performanceReviews.push(review._id);
        await employee.save();

        res.status(201).json({ message: 'Performance synchronized', rating: employee.performanceRating });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// @route   GET /api/performance/history/:employeeId
// @desc    Get performance history for an employee
// @access  Private (Admin/Manager/Self)
router.get('/history/:employeeId', async (req, res) => {
    try {
        const reviews = await PerformanceReview.find({ employeeId: req.params.employeeId })
            .populate('reviewerId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
