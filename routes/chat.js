const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const Task = require('../models/Task');
const { auth, adminAuth } = require('../middleware/auth'); // Both roles can access their chats

// Multer setup for chat attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // e.g. chat-1623490234-file.png
        cb(null, 'chat-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Helper to check if user has access to employee chat
const canAccessChat = (employeeId, user) => {
    if (user.email === 'admin@cctv.com' || user.role === 'admin' || user.role === 'Admin') return true;
    return employeeId?.toString() === user._id?.toString();
};



// @route   GET /api/chat/:employeeId
// @desc    Get all messages for a specific employee
// @access  Private
router.get('/:employeeId', auth, async (req, res) => {
    try {
        const targetId = req.params.employeeId === 'me' ? req.user._id.toString() : req.params.employeeId;

        if (!canAccessChat(targetId, req.user)) {
            return res.status(403).json({ message: 'Access denied to this chat room' });
        }

        const messages = await Message.find({ employeeId: targetId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        console.error('Error fetching chat messages:', err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

// @route   POST /api/chat/:employeeId
// @desc    Post a new message or upload an attachment to an employee chat
// @access  Private
router.post('/:employeeId', auth, upload.single('attachment'), async (req, res) => {
    try {
        const targetId = req.params.employeeId === 'me' ? req.user._id.toString() : req.params.employeeId;

        if (!canAccessChat(targetId, req.user)) {
            return res.status(403).json({ message: 'Access denied to this chat room' });
        }

        const { content, attachmentType } = req.body;

        let attachmentUrl = null;
        let finalAttachmentType = attachmentType || 'none';

        if (req.file) {
            attachmentUrl = req.file.filename;
            // Best effort type inference if not provided explicitly by frontend
            if (finalAttachmentType === 'none') {
                const ext = path.extname(req.file.originalname).toLowerCase();
                if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
                    finalAttachmentType = 'image';
                } else if (['.wav', '.mp3', '.webm', '.ogg'].includes(ext)) {
                    finalAttachmentType = 'voice';
                } else {
                    finalAttachmentType = 'document';
                }
            }
        }

        const newMessage = new Message({
            employeeId: targetId,
            sender: req.user._id,
            senderName: `${req.user.name || req.user.firstName + ' ' + req.user.lastName}`,
            content: content || '',
            attachmentUrl,
            attachmentType: finalAttachmentType
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);

    } catch (err) {
        console.error('Error posting chat message:', err);
        res.status(500).json({ message: 'Server error posting message' });
    }
});

module.exports = router;
