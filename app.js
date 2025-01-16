const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('./config/mongo'); // Importing the MongoDB connection from mongo.js

// Import routes
const formRoutes = require('./routes/formRoutes');

// Express setup
const app = express();

// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = ['https://travellaneconnect.com', 'http://localhost:5173'];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS policy does not allow access from origin ${origin}`));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
    })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debugging middleware
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, URL: ${req.url}`);
    next();
});

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
