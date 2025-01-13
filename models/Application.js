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
        college: String,
        graduationYear: String,
        fieldOfStudy: String,
        referredBy: String,
        employmentExperience: String,
        lastWorkPlace: String,
        passportPhoto: String,
        nidScan: String,
        passportScan: String,
        signature: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Application', ApplicationSchema);
