const ftp = require('ftp');

const ftpClient = new ftp();

// Function to reconnect with a delay after the connection is closed
const reconnectFtp = () => {
    console.log('FTP connection closed, reconnecting...');
    setTimeout(() => {
        ftpClient.connect({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
        });
    }, 5000); // Delay of 5 seconds before reconnecting
};

ftpClient.on('ready', () => {
    console.log('FTP client connected');
});

ftpClient.connect({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    keepalive: 600000, // Keeps the connection alive by sending a NOOP command every 10 minutes
});

ftpClient.on('close', reconnectFtp);

module.exports = ftpClient;
