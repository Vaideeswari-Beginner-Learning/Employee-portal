const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    locationName: { type: String },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    path: [{
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Tracking', trackingSchema);
