const mongoose = require('mongoose');

const patientRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    medicalHistory: {
        type: String,
        default: ''
    },
    allergies: [{
        type: String,
        trim: true
    }],
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    insurance: {
        provider: String,
        policyNumber: String,
        validUntil: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
