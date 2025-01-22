const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
    {
        fullname: String,
        fatherName: String,
        motherName: String,
        sex: String,
        age: Number,
        dob: Date,
        nationality: String,
        passportNumber: String,
        maritalStatus: String,
        residentAddress: String,
        district: String,
        email: String,
        phone: String,
        college: {
            type: String,
            default: 'Not Specified',
        },
        graduationYear: {
            type: String,
            default: 'Not Specified',
        },
        fieldOfStudy: {
            type: String,
            default: 'Not Specified',
        },
        referredBy: {
            type: String,
            default: 'Not Specified',
        },
        employmentExperience: {
            type: String,
            default: 'Not Specified',
        },
        lastWorkPlace: {
            type: String,
            default: 'Not Specified',
        },
        passportPhoto: String,
        nidScan: String,
        passportScan: String,
        signature: String,
        applicationFormImages: [String],
        status: {
            type: String,
            default: 'Pending',
        },
        bodyDetails: {
            type: String,
            default: '..',
        },
        footerDetails: {
            type: String,
            default: '..',
        },
        payBtnText: {
            type: String,
            default: 'Pay Now',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);
