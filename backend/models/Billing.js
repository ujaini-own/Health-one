const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    consultationFee: {
        type: Number,
        default: 0
    },
    labCharges: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'insurance', ''],
        default: ''
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    insuranceClaim: {
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', ''],
            default: ''
        },
        amount: Number,
        claimId: String
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate invoice number before saving
billingSchema.pre('save', async function () {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Billing').countDocuments();
        this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
    }
});

module.exports = mongoose.model('Billing', billingSchema);
