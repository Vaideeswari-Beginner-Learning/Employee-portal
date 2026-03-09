const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    checkIn: { type: String },
    checkOut: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    locationName: { type: String }, // Human-readable address
    biometricPhoto: { type: String },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
