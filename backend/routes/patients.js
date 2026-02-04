const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// @route   GET /api/patients
// @desc    Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   DELETE /api/patients/:id
// @desc    Delete a patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        await patient.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   PUT /api/patients/:id
// @desc    Update patient details
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        // Password handling should ideally be separate or hashed, but for simplicity we'll allow updating if provided
        // In a real app, use user.save() to trigger pre-save hooks for password hashing

        let patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Apply updates
        Object.keys(updates).forEach((key) => {
            patient[key] = updates[key];
        });

        await patient.save(); // Triggers password hashing if password changed

        res.json({ success: true, message: 'Patient updated successfully', data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
