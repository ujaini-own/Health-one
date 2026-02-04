const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const bcrypt = require('bcryptjs');

// Helper to validate email
const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
};

// @route   GET /api/clinics
// @desc    Get all clinic users (doctors, nurses, receptionists)
// @access  Public (should be protected in prod)
router.get('/', async (req, res) => {
    try {
        const staff = await Clinic.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (error) {
        console.error('Error fetching clinic staff:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   POST /api/clinics
// @desc    Create a new clinic user (Doctor, Nurse, Receptionist)
// @access  Public (should be protected in prod)
router.post('/', async (req, res) => {
    try {
        const {
            clinicName,
            userName,
            contactName,
            email,
            password,
            clinicRegistrationNumber,
            userType,
            nmrNumber,
            nuid,
            employeeCode
        } = req.body;

        // Validation
        if (!clinicName || !userName || !contactName || !email || !password || !clinicRegistrationNumber || !userType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check duplicates
        const existingUser = await Clinic.findOne({ $or: [{ email }, { clinicRegistrationNumber }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or registration number already exists'
            });
        }

        // Prepare data
        const userData = {
            clinicName,
            userName,
            contactName,
            email,
            password, // Will be hashed by pre-save hook
            clinicRegistrationNumber,
            userType,
            nmrNumber: userType === 'doctor' ? nmrNumber : undefined,
            nuid: userType === 'nurse' ? nuid : undefined,
            employeeCode: userType === 'receptionist' ? employeeCode : undefined
        };

        const newUser = new Clinic(userData);
        await newUser.save();

        res.status(201).json({
            success: true,
            message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} created successfully`,
            data: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                userType: newUser.userType
            }
        });

    } catch (error) {
        console.error('Error creating clinic staff:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   DELETE /api/clinics/:id
// @desc    Delete a clinic user
router.delete('/:id', async (req, res) => {
    try {
        const user = await Clinic.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// @route   PUT /api/clinics/:id
// @desc    Update clinic user details
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const user = await Clinic.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Apply updates
        Object.keys(updates).forEach((key) => {
            user[key] = updates[key];
        });

        await user.save();

        res.json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
