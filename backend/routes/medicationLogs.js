const express = require('express');
const router = express.Router();
const MedicationLog = require('../models/MedicationLog');

// Log medication administration
router.post('/', async (req, res) => {
    try {
        const { patientId, prescriptionId, medicationName, dosageGiven, notes, route } = req.body;

        const medicationLog = new MedicationLog({
            patientId,
            prescriptionId,
            administeredBy: req.user?.id,
            medicationName,
            dosageGiven,
            notes,
            route
        });

        await medicationLog.save();

        res.status(201).json({
            success: true,
            message: 'Medication administration logged',
            data: medicationLog
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient medication logs
router.get('/patient/:patientId', async (req, res) => {
    try {
        const logs = await MedicationLog.find({ patientId: req.params.patientId })
            .populate('administeredBy', 'userName')
            .sort({ administeredAt: -1 });

        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
