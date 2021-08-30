const fs = require('fs');
const path = require('path')
const multer = require("multer");
const uuid4 = require("uuid").v4;
const IMAGE_UPLOADS_PATH = "/image-uploads/";


  /***************************************************/
 /* Create image uploads folder if it doesn't exist */
/***************************************************/
if (!fs.existsSync(`.${IMAGE_UPLOADS_PATH}`)){
    fs.mkdirSync(`.${IMAGE_UPLOADS_PATH}`);
};


  /*****************/
 /* Util function */
/*****************/
exports.generateFilename = function (multerFile) {
    return `${uuid4()}.${exports.getMulterFileExtension(multerFile)}`;
}

exports.getUrlFromImageFilename = function(filename) {
    return "http://" + app.get("host") + ":" + app.get("port") + IMAGE_UPLOADS_PATH + filename;
};

exports.getImageFilenameFromUrl = function(url) {
    const splittedString = url.split('/');
    return splittedString[splittedString.length - 1];
}

exports.removeImageFromFilename = function(filename) {
    fs.unlink("." + IMAGE_UPLOADS_PATH + exports.getImageFilenameFromUrl(filename), (err => {
        if (err) {
            console.error(err);
        }
    }));
}


  /*********************/
 /* Multer middleware */
/*********************/
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {fileSize: 2000000},
    fileFilter: function(req, file, cb) {
        const fileTypes = /png|jpeg|jpg/;
        const isExtNameValid = fileTypes.test(path.extname(file.originalname.toLowerCase()));
        const isMimeTypeValid = fileTypes.test(file.mimetype);

        if (isExtNameValid && isMimeTypeValid) {
            cb(null, true);
        } else {
            const res = req.res;
            res.status(400).json({message: "Only png, jpeg and jpg images are allowed !"});
        };
    }
});

exports.multerMiddleware = upload.single("image");


  /*********************************/
 /* Write buffer into image files */
/*********************************/
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png"
};

exports.getMulterFileExtension = function(multerFile) {
    return MIME_TYPES[multerFile.mimetype];
};

exports.writeBufferIntoFile = function(file, fileName) {
    return new Promise((resolve, reject) => {
        const filePath = `.${IMAGE_UPLOADS_PATH}${fileName}`;

        fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
                reject(err);
            };

            resolve(filePath);
        });
    });
};