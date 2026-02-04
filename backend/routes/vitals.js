const express = require('express');
const router = express.Router();
const Vitals = require('../models/Vitals');

// Record vitals
router.post('/', async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            bloodPressure,
            pulse,
            temperature,
            oxygenLevel,
            weight,
            height,
            notes
        } = req.body;

        const vitals = new Vitals({
            patientId,
            appointmentId,
            recordedBy: req.user?.id,
            bloodPressure,
            pulse,
            temperature,
            oxygenLevel,
            weight,
            height,
            notes
        });

        await vitals.save();

        res.status(201).json({
            success: true,
            message: 'Vitals recorded successfully',
            data: vitals
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient vitals history
router.get('/patient/:patientId', async (req, res) => {
    try {
        const vitals = await Vitals.find({ patientId: req.params.patientId })
            .populate('recordedBy', 'userName')
            .sort({ recordedAt: -1 });

        res.json({ success: true, data: vitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get vitals for specific appointment
router.get('/appointment/:appointmentId', async (req, res) => {
    try {
        const vitals = await Vitals.findOne({ appointmentId: req.params.appointmentId })
            .populate('recordedBy', 'userName');

        if (!vitals) {
            return res.status(404).json({ success: false, message: 'Vitals not found' });
        }

        res.json({ success: true, data: vitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
