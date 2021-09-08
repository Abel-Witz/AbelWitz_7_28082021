exports.setInputFeedback = function(element, _type, text) {
    const validFeedbackDiv = element.parentNode.querySelector(".valid-feedback");
    const invalidFeedbackDiv = element.parentNode.querySelector(".invalid-feedback");

    if (_type === "invalid") {

        if (invalidFeedbackDiv) {
        invalidFeedbackDiv.innerText = text;
        }

        element.classList.add("is-invalid");
        element.classList.remove("is-valid");

    } else if (_type === "valid") {

        if (validFeedbackDiv) {
        validFeedbackDiv.innerText = text;
        }

        element.classList.add("is-valid");
        element.classList.remove("is-invalid");

    } else if (_type === "none") {

        element.classList.remove("is-valid");
        element.classList.remove("is-invalid");

    }
}

exports.isEmailValid = function(email) {
    const emailRegex = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if ( emailRegex.test(email) && email.length < 66) {
        return true;
    }

    return false;
}

exports.isPasswordSecure = function(password) {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-./\\]).{8,}$/;

    if ( passwordRegex.test(password) ) {
        return true;
    }

    return false;
}

exports.readFileInputURL = function(input) {
    return new Promise((resolve) => {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result);
              
            };
            reader.readAsDataURL(input.files[0]);
        }
    });
}