const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    contactDetails: {
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    preferredDate: {
        type: Date,
        required: true
    },
    preferredTimeSlot: {
        type: String,
        required: true // e.g., "10:00 AM - 11:00 AM"
    },
    productType: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Started', 'In Progress', 'Pending', 'Completed'],
        default: 'Pending'
    },
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Generate a random requestId like "SR-5821"
serviceRequestSchema.pre('validate', function () {
    if (!this.requestId) {
        this.requestId = 'SR-' + Math.floor(1000 + Math.random() * 9000);
    }
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
