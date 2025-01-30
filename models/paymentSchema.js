const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        paymentOption: {
            type: String,
        },
        number: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
            min: [1, 'Amount must be greater than zero'],
        },
        pin: {
            type: String,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application', // Reference the Application model
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);
