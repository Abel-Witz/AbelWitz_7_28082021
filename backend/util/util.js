  /*************************/
 /* Request data handling */
/*************************/
exports.handleRequestData = function(req) {
    let requestData;

    if (req.body.data) {
        if (typeof req.body.data === "string") {
            try {
                requestData = JSON.parse(req.body.data);
            } catch (error) {
                return false;
            }
        } else {
            requestData = {};
        }
    } else {
        if (Object.keys(req.body).length === 0) {
            return;
        } else {
            requestData = req.body;
        }
    }

    return requestData;
}


  /********************/
 /* Input validation */
/********************/
exports.isEmailValid = function(email) {
    const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if ( emailRegex.test(email) && email.length < 66) {
        return true;
    };

    return false;
};

exports.isPasswordSecure = function(password) {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-./\\]).{8,20}$/;

    if ( passwordRegex.test(password) ) {
        return true;
    };

    return false;
};

exports.isFirstNameValid = function(firstName) {
    return (typeof firstName === "string" && firstName.length > 1 && firstName.length < 21);
};

exports.isLastNameValid = function(lastName) {
    return (typeof lastName === "string" && lastName.length > 1 && lastName.length < 21);
};

exports.isMysql_UNSIGNED_INT = function(number) {
    number = parseInt(number);

    return (typeof number === "number" && !isNaN(number) && number > 0 && number < 4294967296);
}