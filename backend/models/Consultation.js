const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
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
    // SOAP Format
    subjective: {
        type: String,
        default: ''
    },
    objective: {
        type: String,
        default: ''
    },
    assessment: {
        type: String,
        default: ''
    },
    plan: {
        type: String,
        default: ''
    },
    diagnosis: [{
        type: String,
        trim: true
    }],
    uploadedReports: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
