const jwt = require("jsonwebtoken");

  /*************************************************/
 /* Attach a verified userId decoded from the JWT */
/*************************************************/
module.exports = (req, res, next) => {
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
            req.verifiedUserId = decoded.userId;
            next();
        } else {
            res.status(401).json({message: "Incorrect authorization token"});
        };
    })
};