const express = require('express');
const multer = require('multer');
const {
    submitForm,
    getApplications,
    getApplicationById,
    getApplicationByPassportNumber,
    deleteApplicationById,
    updateApplicationById,
    uploadSingleFileAndAppendUrl,
    deleteFileFromApplication,
} = require('../controllers/formController');

const { savePayment, getPayments } = require('../controllers/paymentController');

// Multer configuration for in-memory uploads with size limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 5MB file size limit
});

const router = express.Router();

// Routes for application management
router.post(
    '/submit-form',
    upload.fields([
        { name: 'passportPhoto', maxCount: 1 },
        { name: 'nidScan', maxCount: 1 },
        { name: 'passportScan', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
    ]),
    submitForm
);

router.get('/applications', getApplications); // Get all applications

router.get('/applications/:id', getApplicationById); // Get application by ID

router.get('/application/:passportNumber', getApplicationByPassportNumber); // Get application by passport number

router.delete('/applications/:id', deleteApplicationById); // Delete application by ID

router.put('/applications/:id', updateApplicationById); // Update application by ID

// Routes for file uploads
router.post(
    '/upload-form-file/:applicationId',
    upload.fields([{ name: 'applicationFormImage', maxCount: 1 }]), // Ensure field name matches the form
    uploadSingleFileAndAppendUrl
);

router.delete('/upload-form-file/:applicationId/delete-file/:fileLink', deleteFileFromApplication); // Delete file by application ID and file link

// Routes for payment handling
router.post('/payments', savePayment); // Save payment details

router.get('/payments', getPayments); // Get all payments

module.exports = router;
