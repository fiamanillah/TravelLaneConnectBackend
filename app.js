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
app.use(cors());

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
