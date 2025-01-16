const ftp = require('ftp');

const ftpClient = new ftp();

// Function to reconnect with a delay after the connection is closed or error occurs
const reconnectFtp = () => {
    console.log('FTP connection closed or error occurred, reconnecting...');
    setTimeout(() => {
        ftpClient.connect({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
        });
    }, 5000); // Delay of 5 seconds before reconnecting
};

// Event: Ready
ftpClient.on('ready', () => {
    console.log('FTP client connected');
});

// Event: Close
ftpClient.on('close', reconnectFtp);

// Event: Error
ftpClient.on('error', err => {
    console.error('FTP client error:', err.message);
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        reconnectFtp(); // Attempt to reconnect on connection issues
    }
});

// Connect to FTP server
ftpClient.connect({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
});

// Export the client
module.exports = ftpClient;
