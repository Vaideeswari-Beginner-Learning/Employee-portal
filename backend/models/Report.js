const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    location: { type: String, required: true },
    isInstalled: { type: String, default: 'Yes' },
    cameraCount: { type: String, required: true },
    issues: { type: String },
    image: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
