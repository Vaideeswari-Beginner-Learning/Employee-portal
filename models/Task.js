const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true,
        unique: true
    },
    clientName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    taskType: {
        type: String,
        enum: ['Installation', 'Maintenance', 'Repair', 'Inspection'],
        required: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Normal'],
        default: 'Normal'
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Awaiting Approval'],
        default: 'Pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timeElapsed: {
        type: Number, // Stored in minutes
        default: 0
    },
    notes: {
        type: String
    },
    inspectionChecklist: {
        type: Map,
        of: Boolean
    },
    lastStartTime: {
        type: Date
    },
    startLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    endLocation: {
        lat: Number,
        lng: Number,
        address: String
    }
}, { timestamps: true });

// Pre-save hook to generate a random friendly taskId like "T-8422" if not provided
taskSchema.pre('validate', function () {
    if (!this.taskId) {
        this.taskId = 'T-' + Math.floor(1000 + Math.random() * 9000);
    }
});

module.exports = mongoose.model('Task', taskSchema);
