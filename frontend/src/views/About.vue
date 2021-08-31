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
    <div class="row">
      <div class="col-md-8 col-lg-6 mx-auto">
        <h1 class="h5 fw-bold text-decoration-underline text-center mt-3 mb-4">À propos de Groupomania</h1>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat pariatur quasi iure id consectetur nisi exercitationem, dolore voluptates dolores, nulla soluta veniam error suscipit doloribus. Tempora nulla vero reprehenderit nisi.
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquid impedit eum provident. Doloribus soluta perspiciatis earum eveniet nobis nisi quis, non quibusdam beatae optio sapiente dolore et? Sed, aliquam similique?
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque ut, ratione tempore quas soluta minus velit quia ex atque deserunt ipsa quaerat. Esse nulla laborum suscipit quia modi ipsa repudiandae.
        </p>
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
    document.title = "À propos - Groupomania";
  },
  components: {
    Header,
    Main,
    Footer
  }
}
</script>