const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    attachmentUrl: {
        type: String,
        default: null
    },
    attachmentType: {
        type: String,
        enum: ['image', 'document', 'voice', 'none'],
        default: 'none'
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
