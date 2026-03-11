const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const { auth, adminAuth } = require('../middleware/auth');

// Multer setup for chat attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads/'));
    },
    filename: (req, file, cb) => {
        // e.g. chat-1623490234-file.png
        cb(null, 'chat-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const canAccessChat = (employeeId, user) => {
    // Standardized admin check
    const isAdmin = user.email === 'admin@cctv.com' || user.role === 'admin' || user.role === 'Admin';
    if (isAdmin) return true;

    // Employee can only access their own room
    return employeeId?.toString() === user._id?.toString();
};



const TEAM_ID = '000000000000000000000000'; // Special ID for Team Group Chat

// @route   GET /api/chat/:employeeId
// @desc    Get chat history for a specific employee room
// @access  Private
router.get('/:employeeId', auth, async (req, res) => {
    try {
        let targetId = req.params.employeeId === 'team' ? TEAM_ID : req.params.employeeId;
        if (targetId === 'me') targetId = req.user._id.toString();

        if (targetId !== TEAM_ID && !mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ error: 'Invalid room identification node' });
        }

        // Access Control
        if (targetId !== TEAM_ID && req.user.role !== 'admin' && req.user.role !== 'manager' && req.user._id.toString() !== targetId) {
            console.warn(`[ChatAccess] Denied: User ${req.user.email} attempted access to room ${targetId}`);
            return res.status(403).json({ error: 'Direct communication restricted to authorized personnel.' });
        }

        console.log(`[ChatFetch] Node ${req.user.name} accessing room ${targetId === TEAM_ID ? 'TEAM' : targetId}`);

        // Filter by visibleTo if the field exists (for new messages) or allow all for legacy messages
        const query = {
            employeeId: targetId,
            $or: [
                { visibleTo: { $exists: false } },
                { visibleTo: req.user.role }
            ]
        };

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .populate('sender', 'name role profilePhoto');
        res.json(messages);
    } catch (e) {
        console.error('Chat GET error:', e);
        res.status(500).send({ error: 'Comms sequence interrupted' });
    }
});

// @route   POST /api/chat/:employeeId
// @desc    Post a message to a chat room
// @access  Private
router.post('/:employeeId', auth, upload.single('attachment'), async (req, res) => {
    try {
        const { content, attachmentType } = req.body;

        let targetId = req.params.employeeId === 'team' ? TEAM_ID : req.params.employeeId;
        if (targetId === 'me') targetId = req.user._id.toString();

        if (targetId !== TEAM_ID && !mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ error: 'Invalid destination node' });
        }

        // Access Control: Admin/Manager can message any room; Employee can message their own room or team
        if (targetId !== TEAM_ID && req.user.role !== 'admin' && req.user.role !== 'manager' && req.user._id.toString() !== targetId) {
            return res.status(403).json({ error: 'Direct transmission restricted.' });
        }

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

        const senderNameStr = req.user.name || (req.user.role === 'admin' ? 'Admin Support' : 'Employee');

        // Determine visibility based on recipient and sender role
        let visibleTo = ['admin', 'employee']; // Always visible to Admin and the Employee room owner
        const recipient = req.body.recipient;

        if (targetId === TEAM_ID) {
            visibleTo = ['admin', 'manager', 'employee'];
        } else if (req.user.role === 'manager' || recipient === 'manager') {
            visibleTo = ['admin', 'manager', 'employee'];
        } else if (req.user.role === 'admin' || recipient === 'admin') {
            visibleTo = ['admin', 'employee'];
        }

        const newMessage = new Message({
            employeeId: targetId,
            sender: req.user._id,
            senderName: senderNameStr,
            content: content || '',
            attachmentUrl,
            attachmentType: finalAttachmentType,
            visibleTo
        });

        console.log(`[ChatPost] Creating message from ${req.user.name} (${req.user._id}) for room ${targetId}`);
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);

    } catch (err) {
        console.error('Error posting chat message:', err);
        res.status(500).json({ message: 'Server error posting message' });
    }
});

module.exports = router;
