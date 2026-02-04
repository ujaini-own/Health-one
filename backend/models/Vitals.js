const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    bloodPressure: {
        systolic: {
            type: Number,
            required: true
        },
        diastolic: {
            type: Number,
            required: true
        }
    },
    pulse: {
        type: Number,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    oxygenLevel: {
        type: Number,
        required: true
    },
    weight: {
        type: Number
    },
    height: {
        type: Number
    },
    bmi: {
        type: Number
    },
    notes: {
        type: String
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Auto-calculate BMI before saving
vitalsSchema.pre('save', function () {
    if (this.weight && this.height) {
        const heightInMeters = this.height / 100;
        this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
});

module.exports = mongoose.model('Vitals', vitalsSchema);
