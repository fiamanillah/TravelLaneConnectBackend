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

app.use(
    cors({
        origin: ['https://travellaneconnect.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Increase payload size limits to avoid 413 errors
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Increase URL-encoded data limit

// Routes
app.use('/api', formRoutes);

app.get('/', (req, res) => {
    res.send('Running');
});

// Start the server
const PORT = process.env.PORT || 3000; // Provide a default port if PORT is undefined
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the app as a handler
module.exports = app;
