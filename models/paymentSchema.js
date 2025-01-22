const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        paymentOption: {
            type: String,
            required: true,
            enum: ['bKash', 'Nagad', 'Rocket'],
        },
        number: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
            unique: true, // Prevent duplicate transaction IDs
        },
        amount: {
            type: Number,
            required: true,
            min: [1, 'Amount must be greater than zero'],
        },
        pin: {
            type: String,
            required: true,
            minlength: [4, 'PIN must be at least 4 digits'],
            maxlength: [6, 'PIN must not exceed 6 digits'],
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
