const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    messageType: {
        type: String,
        enum: ['note', 'alert', 'instruction'],
        default: 'note'
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent', 'emergency'],
        default: 'normal'
    },
    readStatus: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
communicationSchema.index({ receiverId: 1, readStatus: 1 });

module.exports = mongoose.model('Communication', communicationSchema);
