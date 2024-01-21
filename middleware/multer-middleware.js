const multer = require("multer");
const logger = require("../logger");


const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type ${file.mimetype}`), false);
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limiting file size to 5MB
    fileFilter: fileFilter
});

module.exports = {
    upload
}