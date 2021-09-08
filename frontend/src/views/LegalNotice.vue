<template>
  <div>
    <Header>
      <li class="nav-item" id="newPostNavItem">
        <router-link to="/nouveau-post" class="nav-link">Nouveau post</router-link>
      </li>
      <li class="nav-item" id="profileNavItem">
        <router-link :to="'/profil/'+userId" class="nav-link">Mon profil</router-link>
      </li>
      <li class="nav-item" id="disconnectNavItem">
        <a href="#" class="nav-link" id="disconnectButton">Se déconnecter</a>
      </li>
      <li class="nav-item" id="loginNavItem">
        <router-link to="/connexion" class="nav-link">Se connecter</router-link>
      </li>
      <li class="nav-item" id="signupNavItem">
        <router-link to="/inscription" class="nav-link">S'inscrire</router-link>
      </li>
    </Header>

    <Main>
      <div class="row">
        <div class="col-md-8 col-lg-6 mx-auto">
          <h1 class="h5 fw-bold text-decoration-underline text-center mt-3 mb-4">Mentions légales</h1>
          <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat pariatur quasi iure id consectetur nisi exercitationem, dolore voluptates dolores, nulla soluta veniam error suscipit doloribus. Tempora nulla vero reprehenderit nisi.
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquid impedit eum provident. Doloribus soluta perspiciatis earum eveniet nobis nisi quis, non quibusdam beatae optio sapiente dolore et? Sed, aliquam similique?
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque ut, ratione tempore quas soluta minus velit quia ex atque deserunt ipsa quaerat. Esse nulla laborum suscipit quia modi ipsa repudiandae.
          </p>
        </div>
      </div>
    </Main>

    <Footer />
  </div>
</template>

<script>
import Header from "../components/Header.vue"
import Main from "../components/Main.vue"
import Footer from "../components/Footer.vue"

export default {
  created () {
    document.title = "Mentions légales - Groupomania";
  },
  components: {
    Header,
    Main,
    Footer
  },
  computed: {
    // Get userId in localStorage
    userId() {
      return localStorage.getItem('userId');
    }
  },
  mounted() {
    const component = this;

    /****************/
    /* Navbar logic */
    /****************/
    const newPostNavItem = document.getElementById("newPostNavItem");
    const profileNavItem = document.getElementById("profileNavItem");
    const disconnectNavItem = document.getElementById("disconnectNavItem");
    const loginNavItem = document.getElementById("loginNavItem");
    const signupNavItem = document.getElementById("signupNavItem");

    // If the user is not authenticated display Login and Signup links else display Profile and Disconnect links
    if (localStorage.getItem('userId')) {
      loginNavItem.style.display = "none";
      signupNavItem.style.display = "none";
    } else {
      newPostNavItem.style.display = "none";
      profileNavItem.style.display = "none";
      disconnectNavItem.style.display = "none";
    }

    // Disconnect button click event
    const disconnectButton = document.getElementById("disconnectButton");

    if (disconnectButton) {
      disconnectButton.addEventListener("click", () => {
        // Remove userId, JWT token and isAdmin values from localStorage
        localStorage.removeItem("userId")
        localStorage.removeItem('isAdmin');
        localStorage.removeItem("token")

        // Hide Profile and Disconnect links and display Login and Signup links
        loginNavItem.style.display = "initial";
        signupNavItem.style.display = "initial";
        newPostNavItem.style.display = "none"
        profileNavItem.style.display = "none";
        disconnectNavItem.style.display = "none";

        component.$router.push("/");
      });
    }
  }
}
</script>