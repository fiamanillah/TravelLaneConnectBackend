const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

// Import routes
const formRoutes = require('./routes/formRoutes');

// MongoDB connection setup
require('./config/mongo');

// Express setup
const app = express();
app.use(express.json());
app.use(express.urlencoded());
// Use CORS once
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = ['https://travellaneconnect.com', 'http://localhost:5173'];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Routes
app.use('/api', formRoutes);

app.get('/', (req, res) => {
    res.send('Running');
});
// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the app as a handler
module.exports = app;
