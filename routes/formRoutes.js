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

// Multer configuration
const upload = multer({ dest: './uploads/' });

const router = express.Router();

// Route to submit a form with multiple files
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

// Route to get all applications
router.get('/applications', getApplications);

// Route to get a single application by ID
router.get('/applications/:id', getApplicationById);

// Route to get an application by passport number
router.get('/application/:passportNumber', getApplicationByPassportNumber);

// Route to delete an application by ID
router.delete('/applications/:id', deleteApplicationById);

// Route to update an application by ID
router.put('/applications/:id', updateApplicationById);

// Route to upload a single file and append its URL
router.post(
    '/upload-form-file/:applicationId',
    upload.fields([{ name: 'applicationFormImage', maxCount: 1 }]), // Make sure this matches the field name in the form
    uploadSingleFileAndAppendUrl
);

router.delete('/upload-form-file/:applicationId/delete-file/:fileLink', deleteFileFromApplication);

router.post('/payments', savePayment);

router.get('/payments', getPayments);

module.exports = router;
