<template>
  <!-- Bootstrap modal -->
  <div>
    <div class="modal" id="profileModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sécurité</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form name="modalForm">
            <div class="modal-body">
              <label for="recipient-name" class="col-form-label">Veuillez entrer votre mot de passe actuel:</label>
              <input type="password" class="form-control" id="recipient-name" name="password">
              <div class="valid-feedback"></div>
              <div class="invalid-feedback"></div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-success" id="modalConfirmButton">Confirmer</button>
              <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Fermer</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <Header>
      <li class="nav-item">
        <router-link to="/nouveau-post" class="nav-link">Nouveau post</router-link>
      </li>
      <li class="nav-item" id="profileNavItem">
        <router-link :to="'/profil/'+userId" class="nav-link" id="profileRouterLink">Mon profil</router-link>
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
      <div class="row mb-3">
        <div class="col-md-6 mx-auto" id="profileContainer" style="display: none;">
          <form name="profileForm">

            <!-- Profile picture -->
            <div class="col-4 col-sm-3 col-md-4 col-lg-3 mx-auto" id="profilePictureCol" style="position: relative; display: none;">
              <!-- Profile picture input -->
              <input disabled ref="imageInput" type="file" class="form-control mb-3 w-100 h-100 opacity-0" name="profilePictureInput" accept=".png,.jpeg,.jpg" aria-label="Upload" style="z-index: 2; position: absolute;">
              
              <!-- Profile picture display -->
              <div class="d-inline-block rounded-circle border" id="profilePicture" style="width: 100%; padding-top: 100%; background-size: cover;"></div>
              
              <!-- Profile picture upload icon -->
              <div class="rounded-circle align-items-center justify-content-center border" id="uploadImageIcon" style="display: none; position: absolute; z-index: 1; width: 35px; height: 35px; background-image: url('/images/upload-image.svg'); background-repeat: no-repeat; background-size: 65% 65%; background-position: 37% 35%; background-color: white; right: 0; top: 0;"></div>
            </div>

            <!-- Profile inputs -->
            <div class="mb-3" id="firstNameInputCol">
                <label for="firstNameInput" class="form-label">Prénom</label>
                <input disabled type="text" class="form-control" id="firstNameInput" name="firstName">
                <div class="valid-feedback"></div>
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3" id="lastNameInputCol">
                <label for="lastNameInput" class="form-label">Nom</label>
                <input disabled type="text" class="form-control" id="lastNameInput" name="lastName">
                <div class="valid-feedback"></div>
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3" id="passwordInputCol" style="display: none;">
                <label for="passwordInput" class="form-label">Nouveau mot de passe</label>
                <input disabled type="password" class="form-control" id="passwordInput" name="password">
                <div class="valid-feedback"></div>
                <div class="invalid-feedback"></div>
            </div>
            <div class="mb-3" id="passwordConfirmationInputCol" style="display: none;">
              <label for="passwordConfirmationInput" class="form-label">Confirmez le mot de passe</label>
              <input disabled type="password" class="form-control" id="passwordConfirmationInput" name="passwordConfirmation">
              <div class="valid-feedback"></div>
              <div class="invalid-feedback"></div>
            </div>
            <div class="mb-4" id="emailInputCol">
                <label for="emailInput" class="form-label">Adresse e-mail</label>
                <input disabled type="email" class="form-control" id="emailInput" name="email">
                <div class="valid-feedback"></div>
                <div class="invalid-feedback"></div>
            </div>

            <!-- Update profile / cancel buttons -->
            <div id="updateAndCancelButtons" style="display: none; justify-content: center">
              <button type="submit" class="btn btn-success me-1" id="updateProfileButton">Mettre à jour</button>
              <button type="button" class="btn btn-danger" id="cancelProfileEditButton">Annuler</button>
            </div>
          </form>

          <!-- Profile options buttons (modify profile, modify password, delete account) -->
          <div id="modifyAndDeleteButtons" class="text-center" style="display: none;" v-show="isMyProfile">
            <button type="button" class="btn btn-outline-secondary mb-1" id="modifyProfileButton">Modifier mon profil</button><br>
            <button type="button" class="btn btn-outline-secondary mb-1" id="modifyPasswordButton">Modifier mon mot de passe</button><br>
            <button type="button" class="btn btn-outline-danger" id="deleteAccountButton">Supprimer mon compte</button>
          </div>

          <!-- Ban account button (only visible for admins) -->
          <div id="banButtonContainer" class="text-center" style="display: none;" v-show="!isMyProfile && isAdmin">
            <button type="button" class="btn btn-outline-danger" id="banAccountButton">Bannir le compte</button>
          </div>
        </div>
      </div>
    </Main>

    <Footer />
  </div>
</template>

<script>
import util from "../util/util"
import bootstrap from "bootstrap/dist/js/bootstrap.js"

import Header from "../components/Header.vue"
import Main from "../components/Main.vue"
import Footer from "../components/Footer.vue"

export default {
  components: {
    Header,
    Main,
    Footer
  },
  computed: {
    // Get userId in localStorage
    userId() {
      return localStorage.getItem('userId');
    },
    // Get JWT token in localStorage
    token() {
      return localStorage.getItem('token');
    },
    // Return whether it is the current user profile or not
    isMyProfile() {
      return (localStorage.getItem('userId') === this.$route.params.userId);
    },
    // Return whether current user is an admin or not
    isAdmin() {
      return (localStorage.getItem('isAdmin') === "true");
    }
  },
  mounted() {
    const component = this;

    document.title = "Profil";

    // Bootstrap modal
    const myModal = new bootstrap.Modal(document.getElementById('profileModal'), {});

    // Forms
    const modalForm = document.forms.modalForm;
    const profileForm = document.forms.profileForm;

    // Profile picture
    const profilePicture = document.getElementById("profilePicture");
    const profilePictureCol = document.getElementById("profilePictureCol");
    const profilePictureInput = profileForm.profilePictureInput;
    const uploadImageIcon = document.getElementById("uploadImageIcon");
    
    profilePictureInput.addEventListener("change", () => {
      util.readFileInputURL(profilePictureInput)
        .then((url) => {
          profilePicture.style.backgroundImage = `url('${url}')`;
          profilePictureChanged = true;
        })
        .catch((error) => {
          console.error(error);
        });
    })

    // Profile form elements
    const firstNameInputCol = document.getElementById("firstNameInputCol");
    const lastNameInputCol = document.getElementById("lastNameInputCol");
    const emailInputCol = document.getElementById("emailInputCol");
    const passwordInputCol = document.getElementById("passwordInputCol");
    const passwordConfirmationInputCol = document.getElementById("passwordConfirmationInputCol");

    // Buttons
    const modifyAndDeleteButtons = document.getElementById("modifyAndDeleteButtons");
    const updateAndCancelButtons = document.getElementById("updateAndCancelButtons");


    // Get the profile data from backend
    fetch(`http://localhost:3000/api/user/${component.$route.params.userId}`)
      .then(async function(response) {
        const json = await response.json();

        if (response.ok) {
          document.title = "Profil - " + json.first_name + " " + json.last_name;
          profileForm.firstName.value = json.first_name;
          profileForm.lastName.value = json.last_name;
          profileForm.email.value = json.email;

          profilePicture.style.backgroundImage = `url('${json.profile_picture_url || "/images/user.svg"}')`;
          profilePictureCol.style.display = "block"

          // Show the profile once everything is loaded
          document.getElementById("profileContainer").style.display = "block";

        } else if (json.message === "The user don't exist") {
          component.$router.push("/");
        }

      })
      .catch(function(error) {
        console.error(error);
      })


    // Modify profile
    let currentEditPlace;
    let currentProfilePicture;
    let profilePictureChanged;

    let currentFirstName;
    let currentLastName;
    let currentEmail;

    function openProfileEditing() {
      currentEditPlace = "profile"

      // Profile picture
      profilePictureChanged = false;
      currentProfilePicture = profilePicture.style.backgroundImage;
      uploadImageIcon.style.display = "flex";

      // Form elements
      currentFirstName = profileForm.firstName.value;
      currentLastName = profileForm.lastName.value;
      currentEmail = profileForm.email.value;
      profileForm.profilePictureInput.disabled = false;
      profileForm.firstName.disabled = false;
      profileForm.lastName.disabled = false;
      profileForm.email.disabled = false;

      // Buttons
      modifyAndDeleteButtons.style.display = "none";
      updateAndCancelButtons.style.display = "flex";
    }

    function closeProfileEditing() {
      // Profile picture
      profileForm.profilePictureInput.disabled = true;
      profilePicture.style.backgroundImage = currentProfilePicture;
      uploadImageIcon.style.display = "none";

      // Form elements
      profileForm.firstName.value = currentFirstName;
      profileForm.lastName.value = currentLastName;
      profileForm.email.value = currentEmail;
      profileForm.firstName.disabled = true;
      profileForm.lastName.disabled = true;
      profileForm.email.disabled = true;
      util.setInputFeedback(profileForm.firstName, "none");
      util.setInputFeedback(profileForm.lastName, "none");
      util.setInputFeedback(profileForm.email, "none");
      
      // Buttons
      modifyAndDeleteButtons.style.display = "block";
      updateAndCancelButtons.style.display = "none";
    }

    function openPasswordEditing() {
      currentEditPlace = "password"

      // Form elements
      firstNameInputCol.style.display = "none";
      lastNameInputCol.style.display = "none";
      emailInputCol.style.display = "none";
      profileForm.password.disabled = false;
      profileForm.passwordConfirmation.disabled = false;
      profileForm.password.value = "";
      profileForm.passwordConfirmation.value = "";
      passwordInputCol.style.display = "block";
      passwordConfirmationInputCol.style.display = "block";
      util.setInputFeedback(profileForm.password, "none");
      util.setInputFeedback(profileForm.passwordConfirmation, "none");
      
      // Buttons
      modifyAndDeleteButtons.style.display = "none";
      updateAndCancelButtons.style.display = "flex";
    }

    function closePasswordEditing() {
      // Form elements
      firstNameInputCol.style.display = "block";
      lastNameInputCol.style.display = "block";
      emailInputCol.style.display = "block";
      passwordInputCol.style.display = "none";
      passwordConfirmationInputCol.style.display = "none";
      profileForm.password.disabled = true;
      profileForm.passwordConfirmation.disabled = true;

      // Buttons
      modifyAndDeleteButtons.style.display = "block";
      updateAndCancelButtons.style.display = "none";
    }

    function openDeleteAccountModal() {
      currentEditPlace = "delete";

      // Open confirmation modal
      modalForm.password.value = "";
      util.setInputFeedback(modalForm.password, "none")
      myModal.show();
    }

    // Profile options buttons (modify profile, modify password, delete profile)
    document.getElementById("modifyProfileButton").addEventListener("click", openProfileEditing);
    document.getElementById("modifyPasswordButton").addEventListener("click", openPasswordEditing);
    document.getElementById("deleteAccountButton").addEventListener("click", openDeleteAccountModal);


    // Update profile / cancel buttons
    document.getElementById("updateProfileButton").addEventListener("click", (event) => {
      event.preventDefault();

      if (currentEditPlace === "password") {
        // Validate inputs and give feedback
        let formInvalid;

        if (profileForm.password.value.length === 0) {
          util.setInputFeedback(profileForm.password, "invalid", "Saisissez le nouveau mot de passe");
          formInvalid = true;
        } else if (profileForm.password.value.length > 20) {
          util.setInputFeedback(profileForm.password, "invalid", "20 caractères maximum");
          formInvalid = true;
        } else if (!util.isPasswordSecure(profileForm.password.value)) {
          util.setInputFeedback(profileForm.password, "invalid", "8 caractères minimum avec des lettres majuscules et miniscules, des chiffres et des symboles");
          formInvalid = true;
        } else {
          util.setInputFeedback(profileForm.password, "valid", "Correct");
        }

        if (profileForm.password.value.length !== 0) {
          if (profileForm.passwordConfirmation.value.length === 0) {
            util.setInputFeedback(profileForm.passwordConfirmation, "invalid", "Saisissez à nouveau le mot de passe");
            formInvalid = true;
          } else if (profileForm.passwordConfirmation.value === profileForm.password.value) {
            util.setInputFeedback(profileForm.passwordConfirmation, "valid", "Correct");
          } else {
            util.setInputFeedback(profileForm.passwordConfirmation, "invalid", "Les mots de passe ne correspondent pas");
            formInvalid = true;
          }
        }

        // If all the inputs are valid we clear the input feedback
        if (formInvalid) {
          return;
        } else {
          util.setInputFeedback(profileForm.password, "none");
          util.setInputFeedback(profileForm.passwordConfirmation, "none");
        }
   
        // Open confirmation modal
        modalForm.password.value = "";
        util.setInputFeedback(modalForm.password, "none")
        myModal.show();

      } else if (currentEditPlace === "profile") {

        // Validate inputs and give feedback
        let formInvalid;

        if (profileForm.firstName.value.length === 0) {
          util.setInputFeedback(profileForm.firstName, "invalid", "Saisissez votre prénom");
          formInvalid = true;
        } else if (profileForm.firstName.value.length < 2) {
          util.setInputFeedback(profileForm.firstName, "invalid", "2 caractères minimum");
          formInvalid = true;
        } else if (profileForm.firstName.value.length > 20) {
          util.setInputFeedback(profileForm.firstName, "invalid", "20 caractères maximum");
          formInvalid = true;
        } else {
          util.setInputFeedback(profileForm.firstName, "valid", "Correct");
        }

        if (profileForm.lastName.value.length === 0) {
          util.setInputFeedback(profileForm.lastName, "invalid", "Saisissez votre nom");
          formInvalid = true;
        } else if (profileForm.lastName.value.length < 2) {
          util.setInputFeedback(profileForm.lastName, "invalid", "2 caractères minimum");
          formInvalid = true;
        } else if (profileForm.lastName.value.length > 20) {
          util.setInputFeedback(profileForm.lastName, "invalid", "20 caractères maximum");
          formInvalid = true;
        } else {
          util.setInputFeedback(profileForm.lastName, "valid", "Correct");
        }

        if (profileForm.email.value.length === 0) {
          util.setInputFeedback(profileForm.email, "invalid", "Saisissez votre e-mail");
          formInvalid = true;
        } else if (profileForm.email.value.length > 65) {
          util.setInputFeedback(profileForm.email, "invalid", "65 caractères maximum");
          formInvalid = true;
        } else if (!util.isEmailValid(profileForm.email.value)) {
          util.setInputFeedback(profileForm.email, "invalid", "Adresse e-mail non valide");
          formInvalid = true;
        } else {
          util.setInputFeedback(profileForm.email, "none");
        }

        // If all the inputs are valid we clear the input feedback
        if (formInvalid) {
          return;
        } else {
          util.setInputFeedback(profileForm.firstName, "none");
          util.setInputFeedback(profileForm.lastName, "none");
          util.setInputFeedback(profileForm.email, "none");
        }

        // Open confirmation modal
        modalForm.password.value = "";
        util.setInputFeedback(modalForm.password, "none")
        myModal.show();
      }
    });

    document.getElementById("cancelProfileEditButton").addEventListener("click", () => {
      if (currentEditPlace === "profile") {
        closeProfileEditing();
      } else if (currentEditPlace === "password") {
        closePasswordEditing();
      }
    });


    // Confirm profile update / deletion
    document.getElementById("modalConfirmButton").addEventListener("click", (event) => {
      event.preventDefault();

      let formInvalid;
      
      if (modalForm.password.value.length === 0) {
        util.setInputFeedback(modalForm.password, "invalid", "Saisissez votre mot de passe");
        formInvalid = true;
      } else if (modalForm.password.value.length > 20) {
        util.setInputFeedback(modalForm.password, "invalid", "20 caractères maximum");
        formInvalid = true;
      } else if (!util.isPasswordSecure(modalForm.password.value)) {
        util.setInputFeedback(modalForm.password, "invalid", "8 caractères minimum avec des lettres majuscules et miniscules, des chiffres et des symboles");
        formInvalid = true;
      } else {
        util.setInputFeedback(modalForm.password, "none");
      }

      // Check that all inputs are valid
      if (formInvalid) return;

      if (currentEditPlace === "password") { // Update password
        document.getElementById("modalConfirmButton").disabled = true; // We disable the confirm button until we get the server response to avoid network spam

        const data = {
          userId: parseInt(component.$route.params.userId),
          currentPassword: modalForm.password.value,
          password: profileForm.password.value
        };

        // Send the POST request to the backend
        const options = {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
              'Authorization': localStorage.getItem('token'),
              'Content-Type': 'application/json'
          }
        }

        fetch("http://localhost:3000/api/user/update", options)
          .then(function(response) {
              if (response.ok) {
                myModal.hide();
                closePasswordEditing();
              } else if (response.status === 401) {
                util.setInputFeedback(modalForm.password, "invalid", "Mauvais mot de passe");
              }

              document.getElementById("modalConfirmButton").disabled = false; // We re-enable the confirm button if everything went ok
          })
          .catch(function(error) {
              console.error(error);

              document.getElementById("modalConfirmButton").disabled = false; // We re-enable the confirm button if there is an error
          })

      } else if (currentEditPlace === "profile") { // Update profile

        document.getElementById("modalConfirmButton").disabled = true; // We disable the confirm button until we get the server response to avoid network spam

        // Generate the JSON that we will send to the backend
        const stringifiedJsonData = JSON.stringify({
          userId: parseInt(component.$route.params.userId),
          currentPassword: modalForm.password.value,
          firstName: profileForm.firstName.value,
          lastName: profileForm.lastName.value,
          email: profileForm.email.value
        });

        // Generate the body depending on the data to send
        let body;
        const headers = {'Authorization': localStorage.getItem('token')}

        if (profilePictureChanged) {
          body = new FormData();
          body.append('image', profilePictureInput.files[0]);
          body.append('data', stringifiedJsonData);
        } else {
          body = stringifiedJsonData;
          headers['Content-Type'] = 'application/json';
        }

        // Send the POST request to the backend
        const options = {
          method: "POST",
          body,
          headers
        }

        fetch("http://localhost:3000/api/user/update", options)
          .then(async function(response) {
              if (response.ok) {
                currentFirstName = profileForm.firstName.value;
                currentLastName = profileForm.lastName.value;
                currentEmail = profileForm.email.value;
                currentProfilePicture = profilePicture.style.backgroundImage;

                myModal.hide();
                closeProfileEditing();

              } else if (response.status === 401) {
                util.setInputFeedback(modalForm.password, "invalid", "Mauvais mot de passe");
              } else {
                const json = await response.json();

                // If the email is already taken we display it in the input feedback
                if (json.message === "Email is already used !") {
                  myModal.hide();
                  util.setInputFeedback(profileForm.email, "invalid", "L'adresse e-mail est déjà utilisée");
                }
              }

              document.getElementById("modalConfirmButton").disabled = false; // We re-enable the confirm button if everything went ok
          })
          .catch(function(error) {
              console.error(error);

              document.getElementById("modalConfirmButton").disabled = false; // We re-enable the confirm button if there is an error
          })

      } else if (currentEditPlace === "delete") { // Delete account

        document.getElementById("modalConfirmButton").disabled = true; // We disable the confirm button until we get the server response to avoid network spam

        const data = {
          userId: parseInt(component.$route.params.userId),
          currentPassword: modalForm.password.value
        };

        // Send the POST request to the backend
        const options = {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
              'Authorization': localStorage.getItem('token'),
              'Content-Type': 'application/json'
          }
        }

        fetch("http://localhost:3000/api/user/delete", options)
          .then(function(response) {
              if (response.ok) {
                localStorage.removeItem("userId")
                localStorage.removeItem('isAdmin');
                localStorage.removeItem("token")

                myModal.hide();
                component.$router.push("/");

              } else if (response.status === 401) {
                util.setInputFeedback(modalForm.password, "invalid", "Mauvais mot de passe");
              }

              document.getElementById("modalConfirmButton").disabled = false; // We re-enable the confirm button if everything went ok
          })
          .catch(function(error) {
              console.error(error);

              document.getElementById("modalConfirmButton").disabled = false; // We re-enable the confirm button if there is an error
          })
      }
    });
  

    // Ban account button (for admins only)
    document.getElementById("banAccountButton").addEventListener("click", () => {
      document.getElementById("banAccountButton").disabled = true; // We disable the ban button until we get the server response to avoid network spam

      // Send the POST request to the backend
      const data = {
        userId: parseInt(component.$route.params.userId)
      };

      const options = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
      }

      fetch("http://localhost:3000/api/user/delete", options)
        .then(function(response) {
            if (response.ok) {
              component.$router.push("/");
            }

            document.getElementById("banAccountButton").disabled = false; // We re-enable the ban button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            document.getElementById("banAccountButton").disabled = false; // We re-enable the ban button if there is an error
        })
    })


    // Session logic
    const profileNavItem = document.getElementById("profileNavItem");
    const disconnectNavItem = document.getElementById("disconnectNavItem");
    const loginNavItem = document.getElementById("loginNavItem");
    const signupNavItem = document.getElementById("signupNavItem");

    if (localStorage.getItem('userId')) {
      loginNavItem.style.display = "none";
      signupNavItem.style.display = "none";

      if (localStorage.getItem('userId') === component.$route.params.userId) {
        document.getElementById("profileRouterLink").classList.add("active");
        document.getElementById("profileRouterLink").ariaCurrent = "page";
        modifyAndDeleteButtons.style.display = "block";
      }
    } else {
      profileNavItem.style.display = "none";
      disconnectNavItem.style.display = "none";
    }

    const disconnectButton = document.getElementById("disconnectButton");

    if (disconnectButton) {
      disconnectButton.addEventListener("click", () => {
        localStorage.removeItem("userId")
        localStorage.removeItem('isAdmin');
        localStorage.removeItem("token")

        loginNavItem.style.display = "initial";
        signupNavItem.style.display = "initial";
        profileNavItem.style.display = "none";
        disconnectNavItem.style.display = "none";
      });
    }
  }
}
</script>