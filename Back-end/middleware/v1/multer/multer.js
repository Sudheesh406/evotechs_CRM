const multer = require("multer");
const path = require("path");

// Absolute folder path
const uploadPath = path.join(__dirname, "..", "..","..", "images");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = { upload };
