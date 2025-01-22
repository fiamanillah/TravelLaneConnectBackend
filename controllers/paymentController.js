const Payment = require('../models/paymentSchema');
const Application = require('../models/Application'); // Import the Application model

// Save Payment Information
const savePayment = async (req, res) => {
    try {
        const { paymentOption, number, transactionId, amount, pin, applicationId } = req.body;

        // Validate required fields
        if (!paymentOption || !number || !transactionId || !amount || !pin || !applicationId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate payment option
        const validPaymentOptions = ['bKash', 'Nagad', 'Rocket'];
        if (!validPaymentOptions.includes(paymentOption)) {
            return res.status(400).json({ error: 'Invalid payment option' });
        }

        // Validate amount
        if (amount <= 0 || isNaN(amount)) {
            return res.status(400).json({ error: 'Amount must be a valid number greater than 0' });
        }

        // Validate PIN
        if (pin.length !== 4 || isNaN(pin)) {
            return res.status(400).json({ error: 'PIN must be a 4-digit number' });
        }

        // Check if applicationId exists
        const applicationExists = await Application.findById(applicationId);
        if (!applicationExists) {
            return res.status(404).json({ error: 'Invalid application ID' });
        }

        // Check for duplicate transaction ID
        const transactionExists = await Payment.findOne({ transactionId });
        if (transactionExists) {
            return res.status(409).json({ error: 'Transaction ID already exists' });
        }

        // Create new payment document
        const payment = new Payment({
            paymentOption,
            number,
            transactionId,
            amount,
            pin,
            applicationId, // Associate the payment with an application
        });

        // Save to database
        await payment.save();

        return res.status(201).json({
            message: 'Payment information saved successfully',
            payment: {
                id: payment._id,
                paymentOption: payment.paymentOption,
                number: payment.number,
                transactionId: payment.transactionId,
                amount: payment.amount,
                applicationId: payment.applicationId,
                createdAt: payment.createdAt,
            },
        });
    } catch (error) {
        // Handle specific database errors
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Transaction ID already exists' });
        }
        // Generic error handling
        return res.status(500).json({
            error: 'An error occurred while saving payment information',
            details: error.message,
        });
    }
};

// Controller to get all payment details with pagination
const getPayments = async (req, res) => {
    try {
        // Extract pagination parameters from the query string (default to 1 for page and 10 for limit)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of payments
        const totalPayments = await Payment.countDocuments();

        // Get payment details with pagination, sorted by createdAt in descending order
        const payments = await Payment.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Sorting by createdAt (latest first)
            .populate('applicationId', 'fullname email phone status passportNumber'); // Populating application details (optional)

        // Response data
        const totalPages = Math.ceil(totalPayments / limit);

        res.status(200).json({
            totalPayments,
            totalPages,
            currentPage: page,
            payments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving payments' });
    }
};

module.exports = {
    savePayment,
    getPayments,
};
