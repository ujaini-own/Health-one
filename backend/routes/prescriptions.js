const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');

// Create prescription
router.post('/', async (req, res) => {
    try {
        const { patientId, doctorId, consultationId, medications, digitalSignature, validUntil } = req.body;

        // Determine doctorId:
        // - If Admin, use the provided doctorId
        // - If Doctor, use their own ID
        // - If Clinic, use their ID
        let finalDoctorId;
        if (req.user && req.user.role === 'admin') {
            if (!doctorId) {
                return res.status(400).json({ success: false, message: 'Doctor ID is required for Admin entry' });
            }
            finalDoctorId = doctorId;
        } else {
            finalDoctorId = req.user?.id;
        }

        const prescription = new Prescription({
            patientId,
            doctorId: finalDoctorId,
            consultationId,
            medications,
            digitalSignature,
            validUntil
        });

        await prescription.save();

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            data: prescription
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update prescription (Admin only or specific logic)
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const prescription = await Prescription.findByIdAndUpdate(req.params.id, updates, { new: true });

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, message: 'Prescription updated', data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete prescription (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        await prescription.deleteOne();

        res.json({ success: true, message: 'Prescription deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get ALL prescriptions (for Admin/Staff view)
router.get('/', async (req, res) => {
    try {
        const prescriptions = await Prescription.find()
            .populate('patientId', 'name email')
            .populate('doctorId', 'userName clinicName')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient prescriptions
router.get('/patient/:patientId', async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.params.patientId })
            .populate('doctorId', 'userName clinicName')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patientId', 'name email phoneNumber')
            .populate('doctorId', 'userName clinicName nmrNumber');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Request refill
router.put('/:id/refill', async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { status: 'refill-requested' },
            { new: true }
        );

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, message: 'Refill requested', data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
