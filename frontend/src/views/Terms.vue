<template>
  <Header>
    <li class="nav-item">
      <router-link to="/connexion" class="nav-link">Se connecter</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/inscription" class="nav-link" href="#">S'inscrire</router-link>
    </li>
  </Header>

  <Main>
  </Main>

  <Footer />
</template>

<script>
import Header from "../components/Header.vue"
import Main from "../components/Main.vue"
import Footer from "../components/Footer.vue"

export default {
  created () {
    document.title = "Conditions d'utilisation - Groupomania";
  },
  components: {
    Header,
    Main,
    Footer
  }
}
</script>