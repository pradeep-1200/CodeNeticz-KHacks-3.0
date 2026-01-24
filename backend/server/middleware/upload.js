const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.memoryStorage();

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file'); // Field name 'file'

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp3|wav/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime - simplifying to allow all for now as mime types can be tricky with office docs
    // const mimetype = filetypes.test(file.mimetype);

    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: Files of this type are not allowed!');
    }
}

module.exports = upload;
