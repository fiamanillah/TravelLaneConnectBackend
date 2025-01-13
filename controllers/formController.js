const ftpClient = require('../config/ftpClient');
const fs = require('fs');
const { sanitizeFilename } = require('../utils/sanitizeFilename');
const Application = require('../models/Application');

const uploadFilesToFtp = async (file, fieldName, applicationId) => {
    return new Promise((resolve, reject) => {
        const localPath = file.path;
        const sanitizedRemoteName = sanitizeFilename(file.originalname);
        const newFileName = `${fieldName}_${applicationId}_${sanitizedRemoteName}`;
        const remotePath = `/domains/travellaneconnect.com/public_html/uploads/${newFileName}`;

        if (!fs.existsSync(localPath)) {
            console.error('File not found locally:', localPath);
            return reject(new Error('File not found locally.'));
        }

        ftpClient.put(localPath, remotePath, err => {
            if (err) return reject(err);

            fs.unlink(localPath, unlinkErr => {
                if (unlinkErr) console.error(`Failed to delete file: ${localPath}`);
            });

            resolve(remotePath);
        });
    });
};

const submitForm = async (req, res) => {
    const formData = req.body;
    const fileData = req.files;

    if (!ftpClient.connected) {
        return res.status(500).json({ error: 'FTP client is not connected.' });
    }

    try {
        const applicationId = Date.now();

        const fileLinks = {};
        const files = ['passportPhoto', 'nidScan', 'passportScan', 'signature'];

        for (const fieldName of files) {
            if (fileData[fieldName]) {
                const fileLink = await uploadFilesToFtp(
                    fileData[fieldName][0],
                    fieldName,
                    applicationId
                );
                fileLinks[
                    fieldName
                ] = `https://travellaneconnect.com/uploads/${fieldName}_${applicationId}_${sanitizeFilename(
                    fileData[fieldName][0].originalname
                )}`;
            }
        }

        const application = new Application({
            ...formData,
            ...fileLinks,
        });

        await application.save();
        res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Error during form submission:', error);
        res.status(500).json({ error: 'An error occurred while processing the form.' });
    }
};

// Function to get all applications
const getApplications = async (req, res) => {
    try {
        // Fetch data from the 'applications' collection in the 'test' database
        // Sort by 'createdAt' in descending order (-1)
        const applications = await Application.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'An error occurred while fetching applications.' });
    }
};

module.exports = { submitForm, getApplications };
