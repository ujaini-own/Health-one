const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Admin = require('../models/Admin');

// Helper function to generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role: role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// ==================== PATIENT SIGNUP ====================
router.post('/signup/patient', async (req, res) => {
    try {
        const { name, email, password, phoneNumber, area } = req.body;

        // Validation
        if (!name || !email || !password || !phoneNumber || !area) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if patient already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: 'Patient with this email already exists'
            });
        }

        // Create new patient
        const patient = new Patient({
            name,
            email,
            password,
            phoneNumber,
            area
        });

        await patient.save();

        // Generate token
        const token = generateToken(patient._id, 'patient');

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            token,
            user: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                role: 'patient'
            }
        });
    } catch (error) {
        console.error('Patient signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering patient',
            error: error.message
        });
    }
});

// ==================== CLINIC SIGNUP ====================
router.post('/signup/clinic', async (req, res) => {
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

        // Basic validation
        if (!clinicName || !userName || !contactName || !email || !password ||
            !clinicRegistrationNumber || !userType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate userType-specific fields
        if (userType === 'doctor' && !nmrNumber) {
            return res.status(400).json({
                success: false,
                message: 'NMR Number is required for doctors'
            });
        }

        if (userType === 'nurse' && !nuid) {
            return res.status(400).json({
                success: false,
                message: 'NUID is required for nurses'
            });
        }

        if (userType === 'receptionist' && !employeeCode) {
            return res.status(400).json({
                success: false,
                message: 'Employee Code is required for receptionists'
            });
        }

        // Check if clinic user already exists (by email only)
        const existingClinic = await Clinic.findOne({ email });

        if (existingClinic) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new clinic
        const clinicData = {
            clinicName,
            userName,
            contactName,
            email,
            password,
            clinicRegistrationNumber,
            userType
        };

        // Add conditional fields
        if (userType === 'doctor') clinicData.nmrNumber = nmrNumber;
        if (userType === 'nurse') clinicData.nuid = nuid;
        if (userType === 'receptionist') clinicData.employeeCode = employeeCode;

        const clinic = new Clinic(clinicData);
        await clinic.save();

        // Generate token
        const token = generateToken(clinic._id, 'clinic');

        res.status(201).json({
            success: true,
            message: 'Clinic registered successfully',
            token,
            user: {
                id: clinic._id,
                clinicName: clinic.clinicName,
                email: clinic.email,
                userType: clinic.userType,
                role: 'clinic'
            }
        });
    } catch (error) {
        console.error('Clinic signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering clinic',
            error: error.message
        });
    }
});

// ==================== ADMIN SIGNUP ====================
router.post('/signup/admin', async (req, res) => {
    try {
        const { name, email, password, companyName, companyId } = req.body;

        // Validation
        if (!name || !email || !password || !companyName || !companyId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { companyId }]
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email or company ID already exists'
            });
        }

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password,
            companyName,
            companyId
        });

        await admin.save();

        // Generate token
        const token = generateToken(admin._id, 'admin');

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                companyName: admin.companyName,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering admin',
            error: error.message
        });
    }
});

// ==================== LOGIN (Universal for all user types) ====================
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, and role'
            });
        }

        let user;
        let Model;

        // Select the appropriate model based on role
        switch (role) {
            case 'patient':
                Model = Patient;
                break;
            case 'clinic':
                Model = Clinic;
                break;
            case 'admin':
                Model = Admin;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified'
                });
        }

        // Find user by email
        user = await Model.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id, role);

        // Prepare user data based on role
        let userData = {
            id: user._id,
            email: user.email,
            role: role
        };

        if (role === 'patient') {
            userData.name = user.name;
        } else if (role === 'clinic') {
            userData.clinicName = user.clinicName;
            userData.userType = user.userType;
        } else if (role === 'admin') {
            userData.name = user.name;
            userData.companyName = user.companyName;
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

module.exports = router;
