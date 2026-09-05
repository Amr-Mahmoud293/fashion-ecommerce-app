const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError.util");
const MB = 1024 * 1024;

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [".jpg", ".jpeg", ".png"];

    if (allowedExt.includes(ext)) {
        return cb(null, true);
    } else {
        return cb(new AppError("Only JPG, JPEG and PNG files are allowed", 400), false);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * MB } });

module.exports = { upload }
