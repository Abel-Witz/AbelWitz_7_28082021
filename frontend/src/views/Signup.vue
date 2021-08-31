<template>
  <Header>
    <li class="nav-item">
      <router-link to="/connexion" class="nav-link">Se connecter</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/inscription" class="nav-link active" aria-current="page" href="#">S'inscrire</router-link>
    </li>
  </Header>

  <Main>
    <div class="row">
      <div class="col-md-6 mx-auto text-center">
        <h1 class="h3 fw-bolder text-decoration-underline">S'inscrire</h1>
      </div>
    </div>
    <div class="row mt-3 mb-3">
      <div class="col-md-6 mx-auto">
        <form name="signupForm">
          <div class="row mb-3">
              <div class="col">
                  <label for="firstNameInput" class="form-label">Prénom</label>
                  <input type="text" class="form-control" id="firstNameInput" name="firstName">
                  <div class="valid-feedback"></div>
                  <div class="invalid-feedback"></div>
              </div>
              <div class="col">
                  <label for="lastNameInput" class="form-label">Nom</label>
                  <input type="text" class="form-control" id="lastNameInput" name="lastName">
                  <div class="valid-feedback"></div>
                  <div class="invalid-feedback"></div>
              </div>
          </div>
          <div class="mb-3">
              <label for="emailInput" class="form-label">Adresse e-mail</label>
              <input type="email" class="form-control" id="emailInput" name="email">
              <div class="valid-feedback"></div>
              <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label for="passwordInput" class="form-label">Mot de passe</label>
            <input type="password" class="form-control" id="passwordInput" name="password">
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label for="passwordConfirmationInput" class="form-label">Confirmez le mot de passe</label>
            <input type="password" class="form-control" id="passwordConfirmationInput" name="passwordConfirmation">
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>
          </div>
          
          <div class="text-center">
            <button id="signupButton" type="submit" class="btn btn-primary mt-3">Confirmer l'inscription</button>
          </div>
        </form>
      </div>
    </div>
  </Main>

  <Footer />
</template>

<script>
import Header from "../components/Header.vue"
import Main from "../components/Main.vue"
import Footer from "../components/Footer.vue"

export default {
  created () {
    document.title = "Inscription - Groupomania";
  },
  components: {
    Header,
    Main,
    Footer
  },
  mounted() {
    function setInputFeedback(element, _type, text) {
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

    function isEmailValid(email) {
      const emailRegex = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if ( emailRegex.test(email) && email.length < 66) {
          return true;
      }

      return false;
    }

    function isPasswordSecure(password) {
      const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-./\\]).{8,20}$/;

      if ( passwordRegex.test(password) ) {
          return true;
      }

      return false;
    }

    const signupForm = document.forms.signupForm;

    document.getElementById("signupButton").addEventListener("click", (event) => {
      event.preventDefault();

      let formInvalid;

      if (signupForm.firstName.value.length === 0) {
        setInputFeedback(signupForm.firstName, "invalid", "Saisissez votre prénom");
        formInvalid = true;
      } else if (signupForm.firstName.value.length < 2) {
        setInputFeedback(signupForm.firstName, "invalid", "2 caractères minimum");
        formInvalid = true;
      } else if (signupForm.firstName.value.length > 20) {
        setInputFeedback(signupForm.firstName, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else {
        setInputFeedback(signupForm.firstName, "valid", "Correct");
      }

      if (signupForm.lastName.value.length === 0) {
        setInputFeedback(signupForm.lastName, "invalid", "Saisissez votre nom");
        formInvalid = true;
      } else if (signupForm.lastName.value.length < 2) {
        setInputFeedback(signupForm.lastName, "invalid", "2 caractères minimum");
        formInvalid = true;
      } else if (signupForm.lastName.value.length > 20) {
        setInputFeedback(signupForm.lastName, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else {
        setInputFeedback(signupForm.lastName, "valid", "Correct");
      }

      if (signupForm.email.value.length === 0) {
        setInputFeedback(signupForm.email, "invalid", "Saisissez votre e-mail");
        formInvalid = true;
      } else if (signupForm.email.value.length > 65) {
        setInputFeedback(signupForm.email, "invalid", "65 caractères maximum");
        formInvalid = true;
      } else if (!isEmailValid(signupForm.email.value)) {
        setInputFeedback(signupForm.email, "invalid", "Adresse e-mail non valide");
        formInvalid = true;
      } else {
        setInputFeedback(signupForm.email, "none");
      }

      if (signupForm.password.value.length === 0) {
        setInputFeedback(signupForm.password, "invalid", "Saisissez votre mot de passe");
        formInvalid = true;
      } else if (signupForm.password.value.length > 20) {
        setInputFeedback(signupForm.password, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else if (!isPasswordSecure(signupForm.password.value)) {
        setInputFeedback(signupForm.password, "invalid", "8 caractères minimum avec des lettres majuscules et miniscules, des chiffres et des symboles");
        formInvalid = true;
      } else {
        setInputFeedback(signupForm.password, "valid", "Correct");
      }

      if (signupForm.password.value.length === 0) {
        setInputFeedback(signupForm.password, "invalid", "Saisissez votre mot de passe");
        setInputFeedback(signupForm.passwordConfirmation, "none");
        formInvalid = true;
      } else if (signupForm.password.value.length > 20) {
        setInputFeedback(signupForm.password, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else if (!isPasswordSecure(signupForm.password.value)) {
        setInputFeedback(signupForm.password, "invalid", "8 caractères minimum avec des lettres majuscules et miniscules, des chiffres et des symboles");
        formInvalid = true;
      } else {
        setInputFeedback(signupForm.password, "valid", "Correct");
      }

      if (signupForm.password.value.length !== 0) {
        if (signupForm.passwordConfirmation.value.length === 0) {
          setInputFeedback(signupForm.passwordConfirmation, "invalid", "Saisissez à nouveau votre mot de passe");
          formInvalid = true;
        } else if (signupForm.passwordConfirmation.value === signupForm.password.value) {
          setInputFeedback(signupForm.passwordConfirmation, "valid", "Correct");
        } else {
          setInputFeedback(signupForm.passwordConfirmation, "invalid", "Les mots de passe ne correspondent pas");
          formInvalid = true;
        }
      }

      if (formInvalid) {
        return;
      } else {
        setInputFeedback(signupForm.firstName, "none");
        setInputFeedback(signupForm.lastName, "none");
        setInputFeedback(signupForm.email, "none");
        setInputFeedback(signupForm.password, "none");
        setInputFeedback(signupForm.passwordConfirmation, "none");
      }

      const data = {
        firstName: signupForm.firstName.value,
        lastName: signupForm.lastName.value,
        email: signupForm.email.value,
        password: signupForm.password.value
      };

      const options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
      }

      fetch("http://localhost:3000/api/user/signup", options)
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            if (json.message === "Email is already used !") {
              setInputFeedback(signupForm.email, "invalid", "L'adresse e-mail est déjà utilisée");
            } else if (json.userId && json.token) {
              console.log(json);
            }
        })
        .catch(function(error) {
            console.error(error);
        })
    })
  }
}
</script>