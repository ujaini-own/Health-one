const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Clinic Schema Definition
const clinicSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: [true, 'Clinic name is required'],
        trim: true
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    clinicRegistrationNumber: {
        type: String,
        required: [true, 'Clinic registration number is required'],
        trim: true
    },
    userType: {
        type: String,
        required: [true, 'User type is required'],
        enum: ['doctor', 'nurse', 'receptionist'],
        lowercase: true
    },
    // Conditional fields based on userType
    nmrNumber: {
        type: String,
        trim: true,
        // Required only if userType is 'doctor'
        required: function () {
            return this.userType === 'doctor';
        }
    },
    nuid: {
        type: String,
        trim: true,
        // Required only if userType is 'nurse'
        required: function () {
            return this.userType === 'nurse';
        }
    },
    employeeCode: {
        type: String,
        trim: true,
        // Required only if userType is 'receptionist'
        required: function () {
            return this.userType === 'receptionist';
        }
    },
    role: {
        type: String,
        default: 'clinic'
    }
}, {
    timestamps: true
});

// Hash password before saving
clinicSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
clinicSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Clinic', clinicSchema);
