<template>
  <div>
    <Header>
      <li class="nav-item">
        <router-link to="/connexion" class="nav-link">Se connecter</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/inscription" class="nav-link active" aria-current="page">S'inscrire</router-link>
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
  </div>
</template>

<script>
import util from "../util/util"
import Header from "../components/Header.vue"
import Main from "../components/Main.vue"
import Footer from "../components/Footer.vue"

export default {
  components: {
    Header,
    Main,
    Footer
  },
  created () {
    document.title = "Inscription - Groupomania";
  },
  mounted() {
    const component = this;

    // If the local user is already logged-in we redirect him to the home
    if (localStorage.getItem('userId')) {
      component.$router.push("/");
    }

    // Signup form submit event
    const signupForm = document.forms.signupForm;
    const signupButton = document.getElementById("signupButton");

    signupButton.addEventListener("click", (event) => {
      event.preventDefault();

      // Validate inputs and give feedback
      let formInvalid;

      if (signupForm.firstName.value.length === 0) {
        util.setInputFeedback(signupForm.firstName, "invalid", "Saisissez votre prénom");
        formInvalid = true;
      } else if (signupForm.firstName.value.length < 2) {
        util.setInputFeedback(signupForm.firstName, "invalid", "2 caractères minimum");
        formInvalid = true;
      } else if (signupForm.firstName.value.length > 20) {
        util.setInputFeedback(signupForm.firstName, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else {
        util.setInputFeedback(signupForm.firstName, "valid", "Correct");
      }

      if (signupForm.lastName.value.length === 0) {
        util.setInputFeedback(signupForm.lastName, "invalid", "Saisissez votre nom");
        formInvalid = true;
      } else if (signupForm.lastName.value.length < 2) {
        util.setInputFeedback(signupForm.lastName, "invalid", "2 caractères minimum");
        formInvalid = true;
      } else if (signupForm.lastName.value.length > 20) {
        util.setInputFeedback(signupForm.lastName, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else {
        util.setInputFeedback(signupForm.lastName, "valid", "Correct");
      }

      if (signupForm.email.value.length === 0) {
        util.setInputFeedback(signupForm.email, "invalid", "Saisissez votre e-mail");
        formInvalid = true;
      } else if (signupForm.email.value.length > 65) {
        util.setInputFeedback(signupForm.email, "invalid", "65 caractères maximum");
        formInvalid = true;
      } else if (!util.isEmailValid(signupForm.email.value)) {
        util.setInputFeedback(signupForm.email, "invalid", "Adresse e-mail non valide");
        formInvalid = true;
      } else {
        util.setInputFeedback(signupForm.email, "none");
      }

      if (signupForm.password.value.length === 0) {
        util.setInputFeedback(signupForm.password, "invalid", "Saisissez votre mot de passe");
        formInvalid = true;
      } else if (signupForm.password.value.length > 20) {
        util.setInputFeedback(signupForm.password, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else if (!util.isPasswordSecure(signupForm.password.value)) {
        util.setInputFeedback(signupForm.password, "invalid", "8 caractères minimum avec des lettres majuscules et miniscules, des chiffres et des symboles");
        formInvalid = true;
      } else {
        util.setInputFeedback(signupForm.password, "valid", "Correct");
      }

      if (signupForm.password.value.length !== 0) {
        if (signupForm.passwordConfirmation.value.length === 0) {
          util.setInputFeedback(signupForm.passwordConfirmation, "invalid", "Saisissez à nouveau votre mot de passe");
          formInvalid = true;
        } else if (signupForm.passwordConfirmation.value === signupForm.password.value) {
          util.setInputFeedback(signupForm.passwordConfirmation, "valid", "Correct");
        } else {
          util.setInputFeedback(signupForm.passwordConfirmation, "invalid", "Les mots de passe ne correspondent pas");
          formInvalid = true;
        }
      }


      // If all the inputs are valid we clear the input feedback
      if (formInvalid) return;

      signupButton.disabled = true; // We disable the signup button until we get the server response to avoid network spam
  
      util.setInputFeedback(signupForm.firstName, "none");
      util.setInputFeedback(signupForm.lastName, "none");
      util.setInputFeedback(signupForm.email, "none");
      util.setInputFeedback(signupForm.password, "none");
      util.setInputFeedback(signupForm.passwordConfirmation, "none");


      // Send the POST request to the backend
      const options = {
        method: "POST",
        body: JSON.stringify({
          firstName: signupForm.firstName.value,
          lastName: signupForm.lastName.value,
          email: signupForm.email.value,
          password: signupForm.password.value
        }),
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

              // If the email is already taken we display it in the input feedback
              util.setInputFeedback(signupForm.email, "invalid", "L'adresse e-mail est déjà utilisée");

            } else if (json.userId && json.token) {

              // We store the userId and JWT token in localStorage for later use
              localStorage.setItem('userId', json.userId);
              localStorage.setItem('token', "Bearer " + json.token);
              component.$router.push("/");

            }

            signupButton.disabled = false;  // We re-enable signup button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            signupButton.disabled = false;  // We re-enable signup button if there is an error
        })
    })
  }
}
</script>