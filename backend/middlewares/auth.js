const jwt = require("jsonwebtoken");

  /********************************************************************************/
 /* Attach a verified userId decoded from the JWT and oblige to be authenticated */
/********************************************************************************/
exports.force = (req, res, next) => {
    if (typeof req.headers.authorization !== "string") {
        res.status(401).json({message: "Request doesn't contain authorization header"});
        return;
    };

    jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
            res.status(401).json({message: "Incorrect authorization token"});
            return;
        }

        if (decoded.userId) {
            req.userIsAdmin = (decoded.isAdmin === 1);
            req.verifiedUserId = decoded.userId;
            next();
        } else {
            res.status(401).json({message: "Incorrect authorization token"});
        };
    })
};

  /**************************************************************************************/
 /* Attach a verified userId decoded from the JWT without obliging to be authenticated */
/**************************************************************************************/
exports.free = (req, res, next) => {
    if (typeof req.headers.authorization !== "string") {
        next();
        return;
    };

    jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
            next();
            return;
        }

        if (decoded.userId) {
            req.userIsAdmin = (decoded.isAdmin === 1);
            req.verifiedUserId = decoded.userId;
            next();
        }
    })
};