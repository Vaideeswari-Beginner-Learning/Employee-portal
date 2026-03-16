const mongoose = require('mongoose');

const installationRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    numberOfCameras: {
        type: Number,
        required: true,
        min: 1
    },
    installationType: {
        type: String,
        enum: ['Home', 'Office', 'Commercial', 'Other'],
        default: 'Home'
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Generate a random requestId like "INST-8492"
installationRequestSchema.pre('validate', function () {
    if (!this.requestId) {
        this.requestId = 'INST-' + Math.floor(1000 + Math.random() * 9000);
    }
});

module.exports = mongoose.model('InstallationRequest', installationRequestSchema);
