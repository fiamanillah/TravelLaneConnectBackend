const mongoose = require('mongoose');

// MongoDB connection setup with retries
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        setTimeout(connectMongoDB, 5000); // Retry after 5 seconds if connection fails
    }
};

// Initial MongoDB connection attempt
connectMongoDB();

// Optionally, handle disconnection or reconnecting
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectMongoDB(); // Reconnect when the database connection is lost
});
