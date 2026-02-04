const express = require('express');
const router = express.Router();
const PatientRecord = require('../models/PatientRecord');
const Patient = require('../models/Patient');

// Create patient medical record
router.post('/', async (req, res) => {
    try {
        const { patientId, medicalHistory, allergies, bloodType, emergencyContact, insurance } = req.body;

        // Check if patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const patientRecord = new PatientRecord({
            patientId,
            medicalHistory,
            allergies,
            bloodType,
            emergencyContact,
            insurance,
            createdBy: req.user?.id // From auth middleware
        });

        await patientRecord.save();

        res.status(201).json({
            success: true,
            message: 'Patient record created successfully',
            data: patientRecord
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient record by patient ID
router.get('/patient/:patientId', async (req, res) => {
    try {
        const patientRecord = await PatientRecord.findOne({ patientId: req.params.patientId })
            .populate('patientId', 'name email phoneNumber');

        if (!patientRecord) {
            return res.status(404).json({ success: false, message: 'Patient record not found' });
        }

        res.json({ success: true, data: patientRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update patient record
router.put('/:id', async (req, res) => {
    try {
        const patientRecord = await PatientRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!patientRecord) {
            return res.status(404).json({ success: false, message: 'Patient record not found' });
        }

        res.json({ success: true, message: 'Patient record updated', data: patientRecord });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
