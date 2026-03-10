const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['company', 'government', 'optional'], default: 'company' },
    description: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Holiday', HolidaySchema);
