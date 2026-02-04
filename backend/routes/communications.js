const express = require('express');
const router = express.Router();
const Communication = require('../models/Communication');

// Send message
router.post('/', async (req, res) => {
    try {
        const { receiverId, patientId, messageType, message, priority } = req.body;

        const communication = new Communication({
            senderId: req.user?.id,
            receiverId,
            patientId,
            messageType,
            message,
            priority
        });

        await communication.save();

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: communication
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get inbox messages
router.get('/inbox', async (req, res) => {
    try {
        const messages = await Communication.find({ receiverId: req.user?.id })
            .populate('senderId', 'userName clinicName userType')
            .populate('patientId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
    try {
        const message = await Communication.findByIdAndUpdate(
            req.params.id,
            { readStatus: true, readAt: new Date() },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        res.json({ success: true, message: 'Message marked as read', data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get unread count
router.get('/unread/count', async (req, res) => {
    try {
        const count = await Communication.countDocuments({
            receiverId: req.user?.id,
            readStatus: false
        });

        res.json({ success: true, data: { unreadCount: count } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
