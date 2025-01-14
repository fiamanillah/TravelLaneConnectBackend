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

// Function to get a single application by ID
const getApplicationById = async (req, res) => {
    try {
        // Extract the ID from the request parameters
        const { id } = req.params;

        // Fetch the application from the database using the ID
        const application = await Application.findById(id);

        // Check if the application exists
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // Respond with the application data
        res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application:', error);

        // Handle invalid MongoDB ObjectId errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid application ID.' });
        }

        res.status(500).json({ error: 'An error occurred while fetching the application.' });
    }
};

// Function to get an application by passportNumber
const getApplicationByPassportNumber = async (req, res) => {
    try {
        // Extract the passportNumber from the request parameters
        const { passportNumber } = req.params;

        // Fetch the application from the database using the passportNumber
        const application = await Application.findOne({ passportNumber });

        // Check if the application exists
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // Respond with the application data
        res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application by passport number:', error);

        // Handle other types of errors
        res.status(500).json({ error: 'An error occurred while fetching the application.' });
    }
};

// Function to delete an application by ID
const deleteApplicationById = async (req, res) => {
    try {
        // Extract the ID from the request parameters
        const { id } = req.params;

        // Attempt to delete the application from the database
        const deletedApplication = await Application.findByIdAndDelete(id);

        // Check if the application was found and deleted
        if (!deletedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Application deleted successfully.' });
    } catch (error) {
        console.error('Error deleting application:', error);

        // Handle invalid MongoDB ObjectId errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid application ID.' });
        }

        // Handle other types of errors
        res.status(500).json({ error: 'An error occurred while deleting the application.' });
    }
};

// Function to update specific fields of an application by ID
const updateApplicationById = async (req, res) => {
    try {
        // Extract the ID from the request parameters
        const { id } = req.params;

        // Extract the specific fields to update from the request body
        const updateData = req.body;

        // Ensure updateData is not empty
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields provided to update.' });
        }

        // Attempt to find and update the application in the database
        // Use new: true to return the updated document
        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true, // Ensures that validation rules defined in the model are enforced
            }
        );

        // Check if the application was found and updated
        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // Respond with the updated application data
        res.status(200).json(updatedApplication);
    } catch (error) {

        // Handle invalid MongoDB ObjectId errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid application ID.' });
        }

        // Handle other types of errors
        res.status(500).json({ error: 'An error occurred while updating the application.' });
    }
};

const uploadSingleFileAndAppendUrl = async (req, res) => {
    const { applicationId } = req.params; // Extract applicationId from request parameters
    const fileData = req.files; // Extract files from the request

 

    // Check if FTP client is connected
    if (!ftpClient || !ftpClient.connected) {
        return res.status(500).json({ error: 'FTP client is not connected.' });
    }

    try {
        // Validate if applicationId exists
        if (!applicationId) {
            return res.status(400).json({ error: 'Application ID is required.' });
        }

        // Check if the file is present in the request
        const file = fileData?.applicationFormImage?.[0];
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Sanitize the filename to avoid issues on the server
        const sanitizedFileName = sanitizeFilename(file.originalname);
        const fileLink = `https://travellaneconnect.com/uploads/applicationFormImage_${applicationId}_${sanitizedFileName}`;

        // Upload the file to FTP
        await uploadFilesToFtp(file, 'applicationFormImage', applicationId);

        // Find the application in the database using the applicationId
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // Ensure the applicationFormImages array exists
        if (!Array.isArray(application.applicationFormImages)) {
            application.applicationFormImages = [];
        }

        // Append the new file URL to the application's applicationFormImages array
        application.applicationFormImages.push(fileLink);

        // Save the updated application document
        await application.save();

        return res.status(200).json({
            message: 'File uploaded and URL appended successfully!',
            fileUrl: fileLink,
        });
    } catch (error) {
        console.error('Error during file upload:', error);

        // Return a generic error response
        return res.status(500).json({
            error: 'An error occurred while uploading the file. Please try again later.',
            details: error.message || 'Unknown error',
        });
    }
};

const deleteFileFromApplication = async (req, res) => {
    const { applicationId, fileLink } = req.params; // Extract applicationId and fileLink from the request parameters

    try {
        // Validate if applicationId and fileLink exist
        if (!applicationId || !fileLink) {
            return res.status(400).json({ error: 'Application ID and file link are required.' });
        }

        // Find the application by ID
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        // Remove the file URL from the applicationFormImages array
        const index = application.applicationFormImages.indexOf(fileLink);
        if (index === -1) {
            return res.status(404).json({ error: 'File not found in the application.' });
        }

        // Remove the file from the array
        application.applicationFormImages.splice(index, 1);

        // Save the updated application document
        await application.save();

        // Respond with a success message
        return res.status(200).json({
            message: 'File URL removed successfully!',
            fileUrl: fileLink,
        });
    } catch (error) {
        console.error('Error during file deletion:', error);
        return res.status(500).json({
            error: 'An error occurred while deleting the file. Please try again later.',
            details: error.message || 'Unknown error',
        });
    }
};

module.exports = {
    submitForm,
    getApplications,
    getApplicationById,
    getApplicationByPassportNumber,
    deleteApplicationById,
    updateApplicationById,
    uploadSingleFileAndAppendUrl,
    deleteFileFromApplication,
};
