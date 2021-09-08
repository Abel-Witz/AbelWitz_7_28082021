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
      <div class="row mb-4">
        <div class="col-md-10 mx-auto">
          <PostCard :post="post" v-if="post && comments" class="mb-4"/>
        </div>
        <div v-if="userId && post && comments" class="col-10 col-md-9 mx-auto p-0">
          <CommentForm class="mb-3" :postId="parseInt($route.params.postId)" @commentsUpdateEvent="refreshComments"/>
        </div>
        <div v-if="post && comments && comments.length !== 0" class="col-10 col-md-9 mx-auto border rounded-3">
          <h5 class="mt-3 mb-3 ms-1">Commentaires</h5>
          <div v-for="comment in comments" :key="comment.id" class="px-2 px-md-4 mb-4">
            <Comment :comment="comment" @commentsUpdateEvent="refreshComments"/>
          </div>
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
import PostCard from "../components/PostCard.vue"
import CommentForm from "../components/CommentForm.vue"
import Comment from "../components/Comment.vue"

export default {
  components: {
    Header,
    Main,
    Footer,
    PostCard,
    CommentForm,
    Comment
  },
  data() {
    return {
      post: undefined,
      comments: undefined
    }
  },
  computed: {
    // Get userId in localStorage
    userId() {
      return localStorage.getItem('userId');
    }
  },
  methods: {
    // Refresh comments after posting one or deleting one
    refreshComments() {
      const component = this;

      const options = {
        method: "GET",
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      }

      fetch(`http://localhost:3000/api/comment?postId=${component.$route.params.postId}`, options)
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          component.comments = json;
        });
    }
  },
  created () {
    document.title = "Groupomania";
  },
  mounted() {
    const component = this;

    // Load post data in this.post
    const options = {
      method: "GET",
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }

    fetch(`http://localhost:3000/api/post/${component.$route.params.postId}`, options)
      .then(async function(response) {
        const json = await response.json();

        if (response.ok) {
          component.post = json;
          document.title = json.title + " - Groupomania";
        } else if (json.message === "The post don't exist") {
          component.$router.push("/");
        }

      })
      .catch(function(error) {
        console.error(error);
      })

    // Load post comments
    component.refreshComments();


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