const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Admin or Manager
    },
    month: {
        type: String, // e.g., "March 2026"
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
    metrics: {
        tasksCompleted: Number,
        attendanceRate: Number,
        onTimeArrival: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
