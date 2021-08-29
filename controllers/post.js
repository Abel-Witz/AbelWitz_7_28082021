const util = require("../util/util");
const imageUpload = require("../util/image-upload");


  /***************************/
 /* Get database connection */
/***************************/
let databaseConnection;
require("../util/database-connection")()
    .then((connection) => {
        databaseConnection = connection;
    })
    .catch((error) => {
        console.error(error);
    });


  /*******************/
 /* Post a new post */
/*******************/
exports.post = (req, res) => {
    imageUpload.multerMiddleware(req, res, function (err) {
        // Handle multer errors
        if (err) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({message: `Unexpected file field: '${err.field}'`});
            } else if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            }
        }
        
        // Get request data no matter of where it is, in form data or body
        const requestData = util.handleRequestData(req, res);

        // Check for errors
        if (typeof requestData.title !== "string" || requestData.title.length < 1 || requestData.title.length > 300) {
            res.status(400).json({message: "title length must be between 1 and 300 characters"});
            return;
        };

        if (typeof requestData.text === "string" && requestData.text.length > 40000) {
            res.status(400).json({message: "text must be a string with a length under 40000 characters"});
            return;
        }

        // Store the filename and url of the image that will be posted or store the text if its not empty
        let text;
        let fileName;
        let fileUrl;

        if (req.file) {
            fileName = imageUpload.generateFilename(req.file);
            fileUrl = imageUpload.getUrlFromImageFilename(fileName);
        } else if (requestData.text && requestData.text.length > 0) {
            text = requestData.text;
        }

        // Insert the post in the DB
        databaseConnection.query(
            `INSERT INTO Posts VALUES(NULL, ?, ?, ?, ?);`, [requestData.title, text, fileUrl, req.verifiedUserId],
            function (err, result) {
                if (err) {
                    if (err.errno === 1452) { // Foreign key constraint fail: The account associated to the JWT userId was deleted before uploading the post
                        res.status(400).json({message: "Your account was deleted"});
                        return;
                    }

                    console.error(err);
                    res.status(500).json({message: "Internal server error"});
                    return;
                };

                // If the user client provided an image we save it
                if (req.file) {
                    imageUpload.writeBufferIntoFile(req.file, fileName)
                        .catch((error) => {
                            console.error(err);
                            res.status(500).json({message: "Internal server error"});
                        });
                };

                res.status(200).json({postId: result.insertId});
            });
    })
}


  /*********************/
 /* Get all the posts */
/*********************/
exports.getPosts = (req, res) => {
    databaseConnection.query(
        `SELECT * FROM Posts`,
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            res.status(200).json(result);
        });
}


  /****************************/
 /* Get a certain post by id */
/****************************/
exports.getPostById = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: "id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Select the post from db
    databaseConnection.query(
        `SELECT * FROM Posts WHERE id=?`, [req.params.id],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result[0]) {
                res.status(200).json(result[0]);
            } else {
                res.status(401).json({message: "The post don't exist"});
            };
        });
}


  /***********************/
 /* Delete a post by id */
/***********************/
exports.deletePost = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: "id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Delete the post
    databaseConnection.query(
        `SELECT image_url FROM Posts WHERE id=?;
        DELETE FROM Posts WHERE id=? AND authorId=?`, [req.params.id, req.params.id, req.verifiedUserId],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result[0][0] && result[0][0].image_url) {
                imageUpload.removeImageFromFilename(result[0][0].image_url);
            }

            if (result[1].affectedRows !== 0) {
                res.status(200).json({message: "Post deleted successfully !"});
            } else {
                res.status(401).json({message: "The post don't exist or you aren't the author"});
            }
        });
}