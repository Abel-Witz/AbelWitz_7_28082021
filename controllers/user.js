const util = require("../util/util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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


  /**********/
 /* Signup */
/**********/
exports.signup = (req, res) => {
    // Check for errors
    if ( !util.isFirstNameValid(req.body.firstName) ) {
        res.status(400).json({message: "firstName length must be between 2 and 20 characters"});
        return;
    };

    if ( !util.isLastNameValid(req.body.lastName) ) {
        res.status(400).json({message: "lastName length must be between 2 and 20 characters"});
        return;
    };

    if ( !util.isEmailValid(req.body.email) ) {
        res.status(400).json({message: "Email must be of the format example@mail.com and its length cannot exceed 65 characters"});
        return;
    };

    if ( !util.isPasswordSecure(req.body.password) ) {
        res.status(400).json({message: "Password must be between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
        return;
    };

    bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            databaseConnection.query(
            `INSERT INTO User VALUES(NULL, ?, ?, ?, ?, NULL);`, [req.body.firstName, req.body.lastName, req.body.email, hash],
            function (err, result) {
                if (err) {
                    if (err.errno === 1062) { // Duplicate entry for email
                        res.status(400).json({message: "Email is already used !"});
                        return;
                    }

                    console.error(err);
                    res.status(500).json({message: "Internal server error"});
                    return;
                };


                res.status(200).json({message: "User created successfully !"});
            });
        })
        .catch((error) => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
};


  /*****************************/
 /* Login to an existing user */
/*****************************/
exports.login = (req, res) => {
    // Check for errors
    if ( !util.isEmailValid(req.body.email) ) {
        res.status(400).json({message: "Email must be of the format example@mail.com and its length cannot exceed 65 characters"});
        return;
    };

    if ( !util.isPasswordSecure(req.body.password) ) {
        res.status(400).json({message: "Password must be between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
        return;
    };

    // Select the user in db
    databaseConnection.query(
        `SELECT * FROM User WHERE email = ?`, [req.body.email],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            // Check if the user exists
            if (!result[0] || !result[0].password_hash) {
                res.status(401).json({message: "The email isn't associated to any existing account or the password is incorrect"});
                return;
            }

            // We compare the password sent by the client and the hash stored in the db
            bcrypt.compare(req.body.password, result[0].password_hash.toString())
                .then((passwordMatch) => {
                    if (passwordMatch) {
                        // If the password match we send the client a JWT token containing his userId
                        jwt.sign({userId: result[0].id}, process.env.JWT_SECRET, {expiresIn: "24h"}, function (err, encoded) {
                            if (err) {
                                console.error(err);
                                res.status(500).json({message: "Internal server error"});
                                return;
                            }

                            res.status(200).json({userId: result[0].id, token: encoded});
                        });
                    } else {
                        res.status(401).json({message: "The email isn't associated to any existing account or the password is incorrect"});
                    }
                })
                .catch((error) => {
                    console.error(err);
                    res.status(500).json({message: "Internal server error"});
                })
        });
};


  /*****************/
 /* Update profile*/
/*****************/
function updateUser(req, res, requestData) {
    // Store the profile picture filename for later
    let fileName;

    if (req.file) {
        fileName = imageUpload.generateFilename(req.file);
    }

    // Generate the SET query containing all the modifications
    const modifications = {};
    if (requestData.firstName) modifications.first_name = requestData.firstName;
    if (requestData.lastName) modifications.last_name = requestData.firstName;
    if (requestData.email) modifications.email = requestData.email;
    if (requestData.password) modifications.password_hash = requestData.password;
    if (req.file) modifications.profile_picture_url = imageUpload.getUrlFromImageFilename(fileName);

    if (Object.entries(modifications).length === 0) {
        res.status(400).json({message: "You didn't provided any modifications to user"});
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

    // Query the modifications
    databaseConnection.query(
        `SELECT profile_picture_url FROM User WHERE id=${req.verifiedUserId};
        UPDATE User ${setString} WHERE id=${req.verifiedUserId};`, values,
        function (err, result) {
            if (err) {
                if (err.errno === 1062) { // Duplicate entry for email
                    res.status(400).json({message: "Email is already used !"});
                    return;
                }

                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };
            

            // If the user client sent a profile picture we save it
            if (req.file) {
                imageUpload.writeBufferIntoFile(req.file, fileName)
                    .catch((error) => {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                    });

                // If the old user had a profile picture we delete it
                if (result[0][0].profile_picture_url) {
                    imageUpload.removeImageFromFilename(result[0][0].profile_picture_url);
                }
            }

            res.status(200).json({message: "User updated successfully !"});
        });
};

exports.update = (req, res) => {
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
        if ( !util.isMysql_UNSIGNED_INT(requestData.userId) ) {
            res.status(400).json({message: "userId must be a number between 1 and 4 294 967 295"});
            return;
        };
    
        if ( req.verifiedUserId !== requestData.userId ) {
            res.status(400).json({message: "The userId provided doesn't match with yours !"});
            return;
        }

        if ( requestData.firstName && !util.isFirstNameValid(requestData.firstName) ) {
            res.status(400).json({message: "firstName length must be between 2 and 20 characters"});
            return;
        };

        if ( requestData.lastName && !util.isLastNameValid(requestData.lastName) ) {
            res.status(400).json({message: "lastName length must be between 2 and 20 characters"});
            return;
        };

        if (requestData.email && !util.isEmailValid(requestData.email)) {
            res.status(400).json({message: "Email must be of the format example@mail.com and its length cannot exceed 65 characters"});
            return;
        }

        if (requestData.password) {
            if ( !util.isPasswordSecure(requestData.password) ) {
                res.status(400).json({message: "Password must be between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
                return;
            };

            // If the client provided a new password we store the new password hash in db
            bcrypt.hash(requestData.password, 10)
                .then((hash) => {
                    requestData.password = hash;
                    updateUser(req, res, requestData);
                })
                .catch((error) => {
                    console.error(err);
                    res.status(500).json({message: "Internal server error"});
                });
        } else {
            updateUser(req, res, requestData);
        }
    })
};


  /*********************/
 /* Delete an account */
/*********************/
exports.delete = (req, res) => {
    // Check for errors
    if ( !util.isMysql_UNSIGNED_INT(req.body.userId) ) {
        res.status(400).json({message: "userId must be a number between 1 and 4 294 967 295"});
        return;
    };

    if ( req.verifiedUserId !== req.body.userId ) {
        res.status(400).json({message: "The userId provided doesn't match with yours !"});
        return;
    }

    // Query the deletion
    databaseConnection.query(
        `SELECT profile_picture_url FROM User WHERE id = ?;
        DELETE FROM User WHERE id = ?;`, [req.body.userId, req.body.userId],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            // Check if the user exists
            if (result[0].length === 0) {
                res.status(401).json({message: "The userId isn't associated to any existing account"});
                return;
            }

            // If the old user had a profile picture we delete it
            if (result[0][0].profile_picture_url) {
                imageUpload.removeImageFromFilename(result[0][0].profile_picture_url);
            };

            res.status(200).json({message: "User deleted successfully !"});
        });
};