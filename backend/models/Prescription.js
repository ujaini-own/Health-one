const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation'
    },
    medications: [{
        drugName: {
            type: String,
            required: true,
            trim: true
        },
        dosage: {
            type: String,
            required: true
        },
        frequency: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        instructions: {
            type: String,
            default: ''
        }
    }],
    digitalSignature: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'refill-requested'],
        default: 'active'
    },
    validUntil: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
