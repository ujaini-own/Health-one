const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    orderedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    testName: {
        type: String,
        required: true,
        trim: true
    },
    testType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ordered', 'sample-collected', 'in-lab', 'completed'],
        default: 'ordered'
    },
    sampleCollectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    results: {
        type: String,
        default: ''
    },
    resultFile: {
        type: String
    },
    doctorComments: {
        type: String,
        default: ''
    },
    orderedAt: {
        type: Date,
        default: Date.now
    },
    sampleCollectedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema);
