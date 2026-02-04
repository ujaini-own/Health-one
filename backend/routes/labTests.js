const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');

// Order lab test
router.post('/', async (req, res) => {
    try {
        const { patientId, testName, testType } = req.body;

        const labTest = new LabTest({
            patientId,
            orderedBy: req.user?.id,
            testName,
            testType
        });

        await labTest.save();

        res.status(201).json({
            success: true,
            message: 'Lab test ordered successfully',
            data: labTest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get pending lab tests
router.get('/pending', async (req, res) => {
    try {
        const labTests = await LabTest.find({ status: { $ne: 'completed' } })
            .populate('patientId', 'name email')
            .populate('orderedBy', 'userName clinicName')
            .sort({ orderedAt: -1 });

        res.json({ success: true, data: labTests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get patient lab tests
router.get('/patient/:patientId', async (req, res) => {
    try {
        const labTests = await LabTest.find({ patientId: req.params.patientId })
            .populate('orderedBy', 'userName clinicName')
            .sort({ orderedAt: -1 });

        res.json({ success: true, data: labTests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark sample collected
router.put('/:id/collect', async (req, res) => {
    try {
        const labTest = await LabTest.findByIdAndUpdate(
            req.params.id,
            {
                status: 'sample-collected',
                sampleCollectedBy: req.user?.id,
                sampleCollectedAt: new Date()
            },
            { new: true }
        );

        if (!labTest) {
            return res.status(404).json({ success: false, message: 'Lab test not found' });
        }

        res.json({ success: true, message: 'Sample collected', data: labTest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add results
router.put('/:id/results', async (req, res) => {
    try {
        const { results, doctorComments } = req.body;

        const labTest = await LabTest.findByIdAndUpdate(
            req.params.id,
            {
                status: 'completed',
                results,
                doctorComments,
                completedAt: new Date()
            },
            { new: true }
        );

        if (!labTest) {
            return res.status(404).json({ success: false, message: 'Lab test not found' });
        }

        res.json({ success: true, message: 'Results added', data: labTest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
