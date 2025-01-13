const express = require('express');
const multer = require('multer');
const { submitForm, getApplications } = require('../controllers/formController');


const upload = multer({ dest: './uploads/' });
const router = express.Router();

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

// Route to get all applications from the database
router.get('/applications', getApplications);

module.exports = router;
