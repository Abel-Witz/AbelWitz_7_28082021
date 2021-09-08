<template>
  <div>
    <Header>
      <li class="nav-item">
        <router-link to="/connexion" class="nav-link active" aria-current="page">Se connecter</router-link>
      </li>
      <li class="nav-item">
        <router-link to="/inscription" class="nav-link">S'inscrire</router-link>
      </li>
    </Header>

    <Main>
      <div class="row">
        <div class="col-md-6 mx-auto text-center">
          <h1 class="h3 fw-bolder text-decoration-underline">Se connecter</h1>
        </div>
      </div>
      <div class="row mt-3 mb-3">
        <div class="col-md-6 mx-auto">
          <form name="loginForm">
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
            
            <div class="text-center">
              <button id="loginButton" type="submit" class="btn btn-primary mt-3">Connexion</button>
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
    document.title = "Connexion - Groupomania";
  },
  mounted() {
    const component = this;

    // If the local user is already logged-in we redirect him to the home
    if (localStorage.getItem('userId')) {
      component.$router.push("/");
    }

    // Login form submit event
    const loginForm = document.forms.loginForm;
    const loginButton = document.getElementById("loginButton")

    loginButton.addEventListener("click", (event) => {
      event.preventDefault();

      // Validate inputs and give feedback
      let formInvalid;

      if (loginForm.email.value.length === 0) {
        util.setInputFeedback(loginForm.email, "invalid", "Saisissez votre e-mail");
        formInvalid = true;
      } else if (loginForm.email.value.length > 65) {
        util.setInputFeedback(loginForm.email, "invalid", "65 caractères maximum");
        formInvalid = true;
      } else if (!util.isEmailValid(loginForm.email.value)) {
        util.setInputFeedback(loginForm.email, "invalid", "Adresse e-mail non valide");
        formInvalid = true;
      } else {
        util.setInputFeedback(loginForm.email, "none");
      }

      if (loginForm.password.value.length === 0) {
        util.setInputFeedback(loginForm.password, "invalid", "Saisissez votre mot de passe");
        formInvalid = true;
      } else if (loginForm.password.value.length > 20) {
        util.setInputFeedback(loginForm.password, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else if (!util.isPasswordSecure(loginForm.password.value)) {
        util.setInputFeedback(loginForm.password, "invalid", "8 caractères minimum avec des lettres majuscules et miniscules, des chiffres et des symboles");
        formInvalid = true;
      } else {
        util.setInputFeedback(loginForm.password, "valid", "Correct");
      }


      // If all the inputs are valid we clear the input feedback
      if (formInvalid) return;

      loginButton.disabled = true; // We disable the login button until we get the server response to avoid network spam

      util.setInputFeedback(loginForm.email, "none");
      util.setInputFeedback(loginForm.password, "none");


      // Send the POST request to the backend
      const options = {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.email.value,
          password: loginForm.password.value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
      }

      fetch("http://localhost:3000/api/user/login", options)
        .then(async function(response) {
          const json = await response.json();

          if (response.status === 200) {
            console.log(json.isAdmin === 1)

            // We store the userId, token and isAdmin values for later use
            localStorage.setItem('userId', json.userId);
            localStorage.setItem('isAdmin', (json.isAdmin === 1));
            localStorage.setItem('token', "Bearer " + json.token);
            component.$router.push("/");

          } else if (response.status === 401) {

            util.setInputFeedback(loginForm.password, "invalid", "Mauvais mot de passe ou email");

          }

          loginButton.disabled = false;  // We re-enable login button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            loginButton.disabled = false;  // We re-enable the login button if there is an error
        })
    })
  }
}
</script>