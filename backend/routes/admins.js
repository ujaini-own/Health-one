const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// @route   GET /api/admins
// @desc    Get all admins
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admins/:id
// @desc    Delete an admin
router.delete('/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Prevent deleting the last admin if needed, but for now allow simple delete
        await admin.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   PUT /api/admins/:id
// @desc    Update admin details
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        Object.keys(updates).forEach((key) => {
            admin[key] = updates[key];
        });

        await admin.save();

        res.json({ success: true, message: 'Admin updated successfully', data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
