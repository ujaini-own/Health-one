const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
        required: true
    },
    administeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    medicationName: {
        type: String,
        required: true
    },
    dosageGiven: {
        type: String,
        required: true
    },
    administeredAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    route: {
        type: String,
        enum: ['oral', 'injection', 'IV', 'topical', 'other'],
        default: 'oral'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
