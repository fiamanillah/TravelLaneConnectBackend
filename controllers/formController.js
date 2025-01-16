const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { sanitizeFilename } = require('../utils/sanitizeFilename');
const Application = require('../models/Application');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload files to Cloudinary
const uploadFilesToCloudinary = async (file, fieldName, applicationId) => {
    return new Promise((resolve, reject) => {
        const sanitizedRemoteName = sanitizeFilename(file.originalname);
        const newFileName = `${fieldName}_${applicationId}_${sanitizedRemoteName}`;

        // Upload file to Cloudinary
        cloudinary.uploader.upload(file.path, { public_id: newFileName }, (err, result) => {
            if (err) return reject(err);

            // Remove the local file after uploading to Cloudinary
            fs.unlink(file.path, unlinkErr => {
                if (unlinkErr) console.error(`Failed to delete file: ${file.path}`);
            });

            resolve(result.secure_url); // Return the file URL from Cloudinary
        });
    });
};

// Submit form and upload files
const submitForm = async (req, res) => {
    const formData = req.body;
    const fileData = req.files;

    try {
        const applicationId = Date.now();
        const fileLinks = {};
        const files = ['passportPhoto', 'nidScan', 'passportScan', 'signature'];

        for (const fieldName of files) {
            if (fileData[fieldName]) {
                const fileLink = await uploadFilesToCloudinary(
                    fileData[fieldName][0],
                    fieldName,
                    applicationId
                );
                fileLinks[fieldName] = fileLink;
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

// Get all applications
const getApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'An error occurred while fetching applications.' });
    }
};

// Get application by ID
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid application ID.' });
        }
        res.status(500).json({ error: 'An error occurred while fetching the application.' });
    }
};

// Get application by passportNumber
const getApplicationByPassportNumber = async (req, res) => {
    try {
        const { passportNumber } = req.params;
        const application = await Application.findOne({ passportNumber });

        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application by passport number:', error);
        res.status(500).json({ error: 'An error occurred while fetching the application.' });
    }
};

// Delete application by ID
const deleteApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedApplication = await Application.findByIdAndDelete(id);

        if (!deletedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json({ message: 'Application deleted successfully.' });
    } catch (error) {
        console.error('Error deleting application:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid application ID.' });
        }
        res.status(500).json({ error: 'An error occurred while deleting the application.' });
    }
};

// Update application by ID
const updateApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields provided to update.' });
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json(updatedApplication);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid application ID.' });
        }
        res.status(500).json({ error: 'An error occurred while updating the application.' });
    }
};

// Upload single file and append URL
const uploadSingleFileAndAppendUrl = async (req, res) => {
    const { applicationId } = req.params;
    const fileData = req.files;

    try {
        if (!applicationId) {
            return res.status(400).json({ error: 'Application ID is required.' });
        }

        const file = fileData?.applicationFormImage?.[0];
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const sanitizedFileName = sanitizeFilename(file.originalname);
        const newFileName = `applicationFormImage_${applicationId}_${sanitizedFileName}`;

        // Upload file to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
            public_id: newFileName,
        });

        // Remove the local file after uploading
        fs.unlink(file.path, unlinkErr => {
            if (unlinkErr) console.error(`Failed to delete file: ${file.path}`);
        });

        // Get the URL of the uploaded file from Cloudinary
        const fileLink = cloudinaryResult.secure_url;

        // Find the application and update with the new file URL
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        if (!Array.isArray(application.applicationFormImages)) {
            application.applicationFormImages = [];
        }

        // Append the file link to the application
        application.applicationFormImages.push(fileLink);
        await application.save();

        return res.status(200).json({
            message: 'File uploaded and URL appended successfully!',
            fileUrl: fileLink,
        });
    } catch (error) {
        console.error('Error during file upload:', error);
        return res.status(500).json({
            error: 'An error occurred while uploading the file. Please try again later.',
            details: error.message || 'Unknown error',
        });
    }
};

// Delete file from application
const deleteFileFromApplication = async (req, res) => {
    const { applicationId, fileLink } = req.params;

    try {
        if (!applicationId || !fileLink) {
            return res.status(400).json({ error: 'Application ID and file link are required.' });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        const index = application.applicationFormImages.indexOf(fileLink);
        if (index === -1) {
            return res.status(404).json({ error: 'File not found in the application.' });
        }

        application.applicationFormImages.splice(index, 1);
        await application.save();

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
