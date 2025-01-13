const sanitizeFilename = filename => filename.replace(/[^a-z0-9\.\_\-]/gi, '_');

module.exports = { sanitizeFilename };
