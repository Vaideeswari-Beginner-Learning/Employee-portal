const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    location: { type: String, required: true },
    isInstalled: { type: String, default: 'Yes' },
    workType: { type: String },
    cameraCount: { type: String },
    issues: { type: String },
    image: { type: String },
    reportTime: { type: String },
    adminStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
