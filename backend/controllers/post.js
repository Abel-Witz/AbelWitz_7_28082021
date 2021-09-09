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


  /*********************************************/
 /* Post a new post (either text or an image) */
/*********************************************/
exports.post = (req, res) => {
    imageUpload.multerMiddleware(req, res, function (err) {
        // Handle multer errors
        if (err) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({message: `Unexpected file field: '${err.field}'`});
                return;
            } else if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            }
        }
        
        // Get request data no matter of where it is, in form data or body
        const requestData = util.handleRequestData(req);
        if (requestData === false) {
            res.status(400).json({message: "data format is incorrect, must be in stringified JSON !"});
            return;
        } else if (requestData === undefined) {
            res.status(400).json({message: "data is missing !"});
            return;
        }

        // Check for errors
        if (typeof requestData.title !== "string" || requestData.title.length < 1 || requestData.title.length > 300) {
            res.status(400).json({message: "title must be a string with a length between 1 and 300 characters"});
            return;
        };

        if (requestData.text && (typeof requestData.text !== "string" || requestData.text.length > 40000)) {
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
            `INSERT INTO Post VALUES(NULL, ?, ?, ?, ?, NOW(), 0, 0, FALSE);`, [requestData.title, text, fileUrl, req.verifiedUserId],
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

                // If the client provided an image we save it
                if (req.file) {
                    imageUpload.writeBufferIntoFile(req.file, fileName)
                        .catch((error) => {
                            console.error(err);
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
        `SELECT Post.id, Post.title, Post.text, Post.image_url, Post.author_id, Post.calculated_likes, Post.calculated_dislikes, Post.date, Post.was_modified,
        !ISNULL(Post_Like.post_id) as "you_liked", !ISNULL(Post_Dislike.post_id) as "you_disliked", User.first_name, User.last_name
        FROM Post
        LEFT OUTER JOIN User ON Post.author_id = User.id
        LEFT OUTER JOIN Post_Like ON Post.id = Post_Like.post_id AND Post_Like.author_id = ? 
        LEFT OUTER JOIN Post_Dislike ON Post.id = Post_Dislike.post_id AND Post_Dislike.author_id = ?
        ORDER BY Post.id DESC;`, [req.verifiedUserId, req.verifiedUserId],
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
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Select the post from db
    databaseConnection.query(
        `SELECT Post.title, Post.text, Post.image_url, Post.author_id, Post.calculated_likes, Post.calculated_dislikes, Post.date, Post.was_modified,
        !ISNULL(Post_Like.post_id) as "you_liked", !ISNULL(Post_Dislike.post_id) as "you_disliked", User.first_name, User.last_name
        FROM Post
        LEFT OUTER JOIN User ON Post.author_id = User.id 
        LEFT OUTER JOIN Post_Like ON Post.id = Post_Like.post_id AND Post_Like.author_id = ?
        LEFT OUTER JOIN Post_Dislike ON Post.id = Post_Dislike.post_id AND Post_Dislike.author_id = ?
        WHERE Post.id=?
        `, [req.verifiedUserId, req.verifiedUserId, req.params.id],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result[0]) {
                res.status(200).json(result[0]);
            } else {
                res.status(400).json({message: "The post don't exist"});
            };
        });
}


  /***********************/
 /* Modify a post by id */
/***********************/
exports.modifyPost = (req, res) => {
    imageUpload.multerMiddleware(req, res, function (err) {
        // Handle multer errors
        if (err) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({message: `Unexpected file field: '${err.field}'`});
                return;
            } else if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            }
        }
        
        // Get request data no matter of where it is, in form data or body
        let requestData = util.handleRequestData(req);
        if (requestData === false) {
            res.status(400).json({message: "data format is incorrect, must be in stringified JSON !"});
            return;
        }
        requestData = (requestData) ? requestData : {};

        // Check for errors
        if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
            res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
            return;
        };

        if ( requestData.title && (typeof requestData.title !== "string" || requestData.title.length < 1 || requestData.title.length > 300) ) {
            res.status(400).json({message: "title must be a string with a length between 1 and 300 characters"});
            return;
        };

        if ( requestData.text && (typeof requestData.text !== "string" || requestData.text.length > 40000) ) {
            res.status(400).json({message: "text must be a string with a length under 40000 characters"});
            return;
        }

        // Store the profile picture filename for later
        let fileName;

        if (req.file) {
            fileName = imageUpload.generateFilename(req.file);
        }

        // Generate the SET query containing all the modifications
        const modifications = {};
        if (req.file) {
            modifications.image_url = imageUpload.getUrlFromImageFilename(fileName);
        } else if (requestData.text) {
            modifications.text = requestData.text;
        }

        if (requestData.title) modifications.title = requestData.title;

        if (Object.entries(modifications).length === 0) {
            res.status(400).json({message: "You didn't provided any modifications to post"});
            return;
        }

        const values = [];
        let setString = "SET ";
        let iteratedOnce = false;

        for (const key in modifications) {
            if (iteratedOnce) {
                setString += ", ";
            } else {
                iteratedOnce = true;
            };

            setString += `${key}=?`;
            values.push(modifications[key]);
        };

        let query;

        // Generate the query depending on the post type (we can't upload a picture for a text post and vice versa)
        if (req.file) { 
            // If we modify a post image we gather the old image_url in order to remove the old image from disk
            query = `SELECT image_url FROM Post WHERE id=${req.params.id};
                    UPDATE Post ${setString}, was_modified=TRUE WHERE id=${req.params.id} AND author_id=${req.verifiedUserId} AND !ISNULL(image_url);`;
        } else if (requestData.text) {
            query = `UPDATE Post ${setString}, was_modified=TRUE WHERE id=${req.params.id} AND author_id=${req.verifiedUserId} AND !ISNULL(text);`;
        } else {
            query = `UPDATE Post ${setString}, was_modified=TRUE WHERE id=${req.params.id} AND author_id=${req.verifiedUserId};`;
        }

        // Query the modifications
        databaseConnection.query(
            query, values,
            function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: "Internal server error"});
                    return;
                };

                if (req.file) {
                    if (result[1].affectedRows !== 0) {
                        // If the client sent a picture we save it
                        imageUpload.writeBufferIntoFile(req.file, fileName)
                            .catch((error) => {
                                console.error(err);
                            });

                        // If the old post had a picture we delete it
                        if (result[0][0].image_url) {
                            imageUpload.removeImageFromFilename(result[0][0].image_url);
                        }

                        res.status(200).json({message: "Post updated successfully !"});
                    } else {
                        res.status(400).json({message: "The post don't exist or you aren't the author or the content sent don't match the post type"});
                    }
                } else {
                    if (result.affectedRows !== 0) {
                        res.status(200).json({message: "Post updated successfully !"});
                    } else {
                        res.status(400).json({message: "The post don't exist or you aren't the author or the content sent don't match the post type"});
                    }
                }
            });
    })
}


  /***********************/
 /* Delete a post by id */
/***********************/
exports.deletePost = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Delete the post
    let query;
    let values;

    if (req.userIsAdmin === true) {
        query = `SELECT image_url FROM Post WHERE id=?;
        DELETE FROM Post WHERE id=?`;
        values = [req.params.id, req.params.id];
    } else {
        query = `SELECT image_url FROM Post WHERE id=?;
        DELETE FROM Post WHERE id=? AND author_id=?`;
        values = [req.params.id, req.params.id, req.verifiedUserId];
    }

    databaseConnection.query(
        query, values,
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
                res.status(400).json({message: "The post don't exist or you aren't the author"});
            }
        });
}



  /***************/
 /* Rate a post */
/***************/
exports.ratePost = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Determine the procedure to call (like, dislike or neutral)
    let query;
    switch (req.body.rating) {
        case 1:
            query = "CALL like_post(?, ?);"
            break;
        case 0:
            query = "CALL neutral_post(?, ?);"
            break;
        case -1:
            query = "CALL dislike_post(?, ?);"
            break;
        default:
            res.status(400).json({message: "rating must be a number equal to 1, 0 or -1 !"});
            return;
    };

    // Like the post
    databaseConnection.query(
        query, [req.params.id, req.verifiedUserId],
        function (err, result) {
            if (err) {
                if (err.errno === 1062) {
                    res.status(400).json({message: "You tried to like or dislike the same post two times"});
                    return;
                } else if (err.errno === 1452) {
                    res.status(400).json({message: "The post don't exist or your account was deleted"});
                    return;
                }

                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            res.status(200).json({message: "Updated rating successfully !"});
        });
}