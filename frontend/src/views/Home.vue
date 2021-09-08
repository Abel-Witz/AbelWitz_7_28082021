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

    <Main :key="componentKey">
      <div v-for="post in posts" :key="post.id" class="row mb-4">
        <div class="col-md-8 col-lg-6 mx-auto">
          <PostPreviewCard :post="post"/>
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
import PostPreviewCard from "../components/PostPreviewCard.vue"

export default {
  name: 'Home',
  components: {
    Header,
    Main,
    Footer,
    PostPreviewCard
  },
  data() {
    return {
      posts: {},
      componentKey: 0
    }
  },
  computed: {
    // Get userId in localStorage
    userId() {
      return localStorage.getItem('userId');
    },
    // Get JWT token in localStorage
    token() {
      return localStorage.getItem('token');
    }
  },
  created () {
    document.title = "Groupomania"
  },
  mounted() {
    const component = this;


    // Get posts from backend
    const options = {
      method: "GET",
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }

    fetch('http://localhost:3000/api/post', options)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        component.posts = json;
      });


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

        // Re-render the home page
        component.componentKey += 1;
      });
    }
  }
}
</script>