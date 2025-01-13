const ftp = require('ftp');

const ftpClient = new ftp();

ftpClient.on('ready', () => {
    console.log('FTP client connected');
});

ftpClient.connect({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
});

module.exports = ftpClient;
