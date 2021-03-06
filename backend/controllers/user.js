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
        res.status(400).json({message: "firstName must be a string with a length between 2 and 20 characters"});
        return;
    };

    if ( !util.isLastNameValid(req.body.lastName) ) {
        res.status(400).json({message: "lastName must be a string with a length between 2 and 20 characters"});
        return;
    };

    if ( !util.isEmailValid(req.body.email) ) {
        res.status(400).json({message: "email must be a string with the format example@mail.com and its length cannot exceed 65 characters"});
        return;
    };

    if ( !util.isPasswordSecure(req.body.password) ) {
        res.status(400).json({message: "password must be a string with a length between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
        return;
    };

    bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            databaseConnection.query(
            `INSERT INTO User VALUES(NULL, ?, ?, ?, ?, NULL, FALSE);`, [req.body.firstName, req.body.lastName, req.body.email, hash],
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

                // If the user creation succeed we send the client a JWT token containing his userId
                jwt.sign({userId: result.insertId}, process.env.JWT_SECRET, {expiresIn: "24h"}, function (err, encoded) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                        return;
                    }

                    res.status(200).json({userId: result.insertId, token: encoded});
                });
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
        res.status(400).json({message: "email must be a string with the format example@mail.com and its length cannot exceed 65 characters"});
        return;
    };

    if ( !util.isPasswordSecure(req.body.password) ) {
        res.status(400).json({message: "password must be a string with a length between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
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
                        jwt.sign({userId: result[0].id, isAdmin: result[0].is_admin}, process.env.JWT_SECRET, {expiresIn: "24h"}, function (err, encoded) {
                            if (err) {
                                console.error(err);
                                res.status(500).json({message: "Internal server error"});
                                return;
                            }

                            res.status(200).json({userId: result[0].id, isAdmin: result[0].is_admin, token: encoded});
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


  /**********************/
 /* Get a user profile */
/**********************/
exports.getUser = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4??294??967??295"});
        return;
    };

    // Get the user
    databaseConnection.query(
        `SELECT * FROM User WHERE id=?`, [req.params.id],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result[0]) {
                res.status(200).json(result[0]);
            } else {
                res.status(400).json({message: "The user don't exist"});
            };
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
    if (requestData.lastName) modifications.last_name = requestData.lastName;
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
            

            // If the client sent a profile picture we save it
            if (req.file) {
                imageUpload.writeBufferIntoFile(req.file, fileName)
                    .catch((error) => {
                        console.error(err);
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
        if ( !util.isMysql_UNSIGNED_INT(requestData.userId) ) {
            res.status(400).json({message: "userId must be a number between 1 and 4??294??967??295"});
            return;
        };

        if ( req.verifiedUserId !== requestData.userId ) {
            res.status(400).json({message: "The userId provided doesn't match with yours !"});
            return;
        }

        if ( !util.isPasswordSecure(requestData.currentPassword) ) {
            res.status(400).json({message: "currentPassword must be a string with a length between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
            return;
        }

        if ( requestData.firstName && !util.isFirstNameValid(requestData.firstName) ) {
            res.status(400).json({message: "firstName must be a string with a length between 2 and 20 characters"});
            return;
        };

        if ( requestData.lastName && !util.isLastNameValid(requestData.lastName) ) {
            res.status(400).json({message: "lastName must be a string with a length between 2 and 20 characters"});
            return;
        };

        if (requestData.email && !util.isEmailValid(requestData.email)) {
            res.status(400).json({message: "email must be a string with the format example@mail.com and its length cannot exceed 65 characters"});
            return;
        }

        // Select the user in db
        databaseConnection.query(
            `SELECT password_hash FROM User WHERE id = ?`, [requestData.userId],
            function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).json({message: "Internal server error"});
                    return;
                };

                // Check if the user exists
                if (!result[0] || !result[0].password_hash) {
                    res.status(404).json({message: "The userId isn't associated to any existing account"});
                    return;
                }

                // We compare the currentPassword sent by the client and the hash stored in the db
                bcrypt.compare(requestData.currentPassword, result[0].password_hash.toString())
                    .then((passwordMatch) => {
                        if (passwordMatch) {

                            // If the password match we update the account
                            if (requestData.password) {
                                if ( !util.isPasswordSecure(requestData.password) ) {
                                    res.status(400).json({message: "password must be a string with a length between 8 and 20 characters including 1 uppercase letter, 1 special character, alphanumeric characters"});
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
                        } else {
                            res.status(401).json({message: "The password is incorrect"});
                        }

                    })
                    .catch((error) => {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                    })
            });
    })
};


  /*********************/
 /* Delete an account */
/*********************/
exports.delete = (req, res) => {
    // Check for errors
    if ( !util.isMysql_UNSIGNED_INT(req.body.userId) ) {
        res.status(400).json({message: "userId must be a number between 1 and 4??294??967??295"});
        return;
    };

    if ( req.userIsAdmin !== true && req.verifiedUserId !== req.body.userId ) {
        res.status(400).json({message: "The userId provided doesn't match with yours !"});
        return;
    }

    // Select the user in db
    databaseConnection.query(
        `SELECT password_hash, profile_picture_url FROM User WHERE id = ?`, [req.body.userId],
        function (err, firstResult) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            // Check if the user exists
            if (!firstResult[0] || !firstResult[0].password_hash) {
                res.status(404).json({message: "The userId isn't associated to any existing account"});
                return;
            }

            if (req.userIsAdmin === true) {
                // Query the deletion
                databaseConnection.query(
                    `DELETE FROM User WHERE id = ?;`, [req.body.userId],
                    function (err, secondResult) {
                        if (err) {
                            console.error(err);
                            res.status(500).json({message: "Internal server error"});
                            return;
                        };

                        // If the old user had a profile picture we delete it
                        if (firstResult[0].profile_picture_url) {
                            imageUpload.removeImageFromFilename(firstResult[0].profile_picture_url);
                        };

                        if (secondResult.affectedRows !== 0) {
                            res.status(200).json({message: "User deleted successfully !"});
                        } else {
                            res.status(400).json({message: "The userId isn't associated to any existing account"});
                        }
                    });
                } else {
                    // We compare the currentPassword sent by the client and the hash stored in the db
                    bcrypt.compare(req.body.currentPassword, firstResult[0].password_hash.toString())
                    .then((passwordMatch) => {
                        if (passwordMatch) {
                            // Query the deletion
                            databaseConnection.query(
                                `DELETE FROM User WHERE id = ?;`, [req.body.userId],
                                function (err, secondResult) {
                                    if (err) {
                                        console.error(err);
                                        res.status(500).json({message: "Internal server error"});
                                        return;
                                    };

                                    // If the old user had a profile picture we delete it
                                    if (firstResult[0].profile_picture_url) {
                                        imageUpload.removeImageFromFilename(firstResult[0].profile_picture_url);
                                    };

                                    if (secondResult.affectedRows !== 0) {
                                        res.status(200).json({message: "User deleted successfully !"});
                                    } else {
                                        res.status(400).json({message: "The userId isn't associated to any existing account"});
                                    }
                                });
                        } else {
                            res.status(401).json({message: "The password is incorrect"});
                        }
                    })
                    .catch((error) => {
                        console.error(err);
                        res.status(500).json({message: "Internal server error"});
                    })
                }
        });
};