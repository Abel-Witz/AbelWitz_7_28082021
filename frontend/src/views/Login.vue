<template>
  <Header>
    <li class="nav-item">
      <router-link to="/connexion" class="nav-link active" aria-current="page">Se connecter</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/inscription" class="nav-link" href="#">S'inscrire</router-link>
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
        <form name="signupForm">
          <div class="mb-3">
              <label for="emailInput" class="form-label">Adresse e-mail</label>
              <input type="email" class="form-control" id="emailInput" name="email" required>
          </div>
            <div class="mb-3">
                <label for="firstNameInput" class="form-label">Mot de passe</label>
                <input type="text" class="form-control" id="firstNameInput" name="firstName" required>
            </div>
          
          <div class="text-center">
            <button id="signupButton" type="submit" class="btn btn-primary mt-3">Connexion</button>
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
    document.title = "Connexion - Groupomania";
  },
  components: {
    Header,
    Main,
    Footer
  }
}
</script>