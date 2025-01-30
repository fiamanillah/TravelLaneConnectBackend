const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('./config/mongo'); // Importing the MongoDB connection from mongo.js

// Import routes
const formRoutes = require('./routes/formRoutes');

// Express setup
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
app.use(
    cors({
        origin: ['https://travellaneconnect.com', 'http://localhost:5173'], // Allow specific origins
        credentials: true, // Allow cookies or credentials
    })
);

// Handle preflight requests for all routes
app.options('*', cors());

// Debugging middleware
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, URL: ${req.url}`);
    next();
});

// Routes
app.use('/api', formRoutes);

// Base route for health check
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Handle non-existent routes (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error Stack:', err.stack); // Log the full error stack for debugging
    const statusCode = err.statusCode || 500; // Default to 500 if no status code is provided
    const message = err.message || 'Internal Server Error'; // Default error message

    res.status(statusCode).json({
        error: {
            message: message,
            status: statusCode,
            timestamp: new Date().toISOString(),
        },
    });
});

// Start the server (if not using Vercel)
// const PORT = process.env.PORT || 5000; // Default port is 5000 if not specified
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
