const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['walk-in', 'scheduled', 'emergency', 'teleconsultation'],
        default: 'scheduled'
    },
    chiefComplaint: {
        type: String,
        trim: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    queueNumber: {
        type: Number
    }
}, {
    timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
