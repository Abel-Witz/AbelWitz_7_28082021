const util = require("../util/util");


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


  /******************/
 /* Post a comment */
/******************/
exports.postComment = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.body.postId)) {
        res.status(400).json({message: "postId must be a number between 1 and 4 294 967 295"});
        return;
    };

    if (typeof req.body.text !== "string" || req.body.text.length < 1 || req.body.text.length > 10000) {
        res.status(400).json({message: "text must be a string with a length between 1 and 10000 characters"});
        return;
    };

    // Post the comment
    databaseConnection.query(
        "INSERT INTO Comment VALUES(NULL, ?, ?, ?, NOW(), 0, 0, FALSE);", [req.body.text, req.body.postId, req.verifiedUserId],
        function (err, result) {
            if (err) {
                if (err.errno === 1452) {
                    res.status(400).json({message: "The post don't exist or your account was deleted"});
                    return;
                }

                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            res.status(200).json({commentId: result.insertId});
        });
}


  /*********************/
 /* Get post comments */
/*********************/
exports.getPostComments = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.query.postId)) {
        res.status(400).json({message: "?postId must be a number between 1 and 4 294 967 295"});
        return;
    }

    // Get the post comments
    databaseConnection.query(
        `SELECT Comment.id, Comment.text, Comment.author_id, Comment.calculated_likes, Comment.calculated_dislikes, Comment.date, Comment.was_modified,
        !ISNULL(Comment_Like.comment_id) as "you_liked", !ISNULL(Comment_Dislike.comment_id) as "you_disliked", User.first_name, User.last_name, User.profile_picture_url
        FROM Comment
        INNER JOIN User ON Comment.author_id = User.id
        LEFT OUTER JOIN Comment_Like ON Comment.id = Comment_Like.comment_id AND Comment_Like.author_id = ?
        LEFT OUTER JOIN Comment_Dislike ON Comment.id = Comment_Dislike.comment_id AND Comment_Dislike.author_id = ?
        WHERE post_id=? ORDER BY Comment.id ASC;`, [req.verifiedUserId, req.verifiedUserId, req.query.postId],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            res.status(200).json(result);
        });
}


  /***********************/
 /* Get a comment by id */
/***********************/
exports.getCommentById = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Get the post comment
    databaseConnection.query(
        `SELECT Comment.text, Comment.author_id, Comment.calculated_likes, Comment.calculated_dislikes, Comment.date, Comment.was_modified,
        !ISNULL(Comment_Like.comment_id) as "you_liked", !ISNULL(Comment_Dislike.comment_id) as "you_disliked", User.first_name, User.last_name, User.profile_picture_url 
        FROM Comment
        INNER JOIN User ON Comment.author_id = User.id
        LEFT OUTER JOIN Comment_Like ON Comment.id = Comment_Like.comment_id AND Comment_Like.author_id = ?
        LEFT OUTER JOIN Comment_Dislike ON Comment.id = Comment_Dislike.comment_id AND Comment_Dislike.author_id = ?
        WHERE Comment.id=?`, [req.verifiedUserId, req.verifiedUserId, req.params.id],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result[0]) {
                res.status(200).json(result[0]);
            } else {
                res.status(400).json({message: "The comment don't exist"});
            };
        });
}


  /********************/
 /* Modify a comment */
/********************/
exports.modifyComment = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    if (typeof req.body.text !== "string" || req.body.text.length < 1 || req.body.text.length > 10000) {
        res.status(400).json({message: "text must be a string with a length between 1 and 10000 characters"});
        return;
    };

    // Modify the comment
    databaseConnection.query(
        "UPDATE Comment SET text=?, was_modified=TRUE WHERE id=? AND author_id=?;", [req.body.text, req.params.id, req.verifiedUserId],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result.affectedRows !== 0) {
                res.status(200).json({message: "Comment updated successfully !"});
            } else {
                res.status(400).json({message: "The comment don't exist or you aren't its author"});
            }
        });
}


  /********************/
 /* Delete a comment */
/********************/
exports.deleteComment = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Delete the comment
    let query;
    let values;

    if (req.userIsAdmin === true) {
        query = "DELETE FROM Comment WHERE id=?";
        values = [req.params.id];
    } else {
        query = "DELETE FROM Comment WHERE id=? AND author_id=?";
        values = [req.params.id, req.verifiedUserId];
    }

    databaseConnection.query(
        query, values,
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            if (result.affectedRows !== 0) {
                res.status(200).json({message: "Post deleted successfully !"});
            } else {
                res.status(400).json({message: "The comment don't exist or you aren't the author"});
            }
        });
}



  /******************/
 /* Rate a comment */
/******************/
exports.rateComment = (req, res) => {
    // Check for errors
    if (!util.isMysql_UNSIGNED_INT(req.params.id)) {
        res.status(400).json({message: ":id must be a number between 1 and 4 294 967 295"});
        return;
    };

    // Determine the procedure to call (like, dislike or neutral)
    let query;
    switch (req.body.rating) {
        case 1:
            query = "CALL like_comment(?, ?);"
            break;
        case 0:
            query = "CALL neutral_comment(?, ?);"
            break;
        case -1:
            query = "CALL dislike_comment(?, ?);"
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
                    res.status(400).json({message: "You tried to like or dislike the same comment two times"});
                    return;
                } else if (err.errno === 1452) {
                    res.status(400).json({message: "The comment don't exist or your account was deleted"});
                    return;
                }

                console.error(err);
                res.status(500).json({message: "Internal server error"});
                return;
            };

            res.status(200).json({message: "Updated rating successfully !"});
        });
}