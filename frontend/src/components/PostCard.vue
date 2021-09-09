<template>
  <div class="d-flex" style="position: relative; left: -14px;">
    <!-- Post votes -->
    <Voting type="Post" :likes="postLikes" :dislikes="postDislikes" :youLiked="youLiked" :youDisliked="youDisliked" :postOrCommentId="parseInt($route.params.postId)"/>

    <!-- Post in itself -->
    <div class="card text-dark w-100">
      <div class="card-header">
        <span v-if="post.author_id && post.author_id != userId">Publié par <router-link :to="'/profil/'+post.author_id" class="profileLink">{{post.first_name + " " + post.last_name}}</router-link> {{fromPostCreation}}</span>
        <span v-if="!post.author_id">Publié par un utilisateur supprimé {{fromPostCreation}}</span>
        <span v-if="post.author_id && post.author_id == userId">Publié par vous {{fromPostCreation}}</span>
      </div>
      <div class="card-body">

        <!-- Post container -->
        <div id="postContainer">
          <h3 ref="postTitle" class="card-title fw-bold">{{post.title}}</h3>
          <div class="d-flex justify-content-center">
            <div v-if="post.image_url">
              <img ref="postImage" :src="post.image_url" class="mt-1 border" alt="" style="max-width: 100%;">
              <p v-if="wasModified" class="text-muted mt-1 mb-0" style="font-size: 10px;">(modifié)</p>
            </div>
          </div>
          <div ref="postText" v-if="post.text" class="card-text mt-1 mb-0">
            <!-- For each text line in this.postLines() create a new p element in order to display backlines -->
            <p v-for="line in postLines" :key="line.id" class="my-0">{{line.content}}</p>
            <p v-if="wasModified" class="text-muted mt-1 mb-0" style="font-size: 10px;">(modifié)</p>
          </div>

          <p v-if="!post.image_url && !post.text && wasModified" class="text-muted mt-1 mb-0" style="font-size: 10px;">(modifié)</p>
        </div>

        <!-- Edit post container -->
        <div id="postEditContainer" style="display: none;">
          <input id="titleInput" type="text" class="form-control form-control-lg fw-bold">
          <div class="valid-feedback"></div>
          <div class="invalid-feedback"></div>

          <div class="d-flex justify-content-center" v-if="post.image_url" style="position: relative;">
            <img id="imagePreview" src="" class="mt-1 border" alt="" style="max-width: 100%;">
            
            <input id="imageInput" type="file" class="form-control mb-3 w-100 h-100 opacity-0" accept=".png,.jpeg,.jpg" aria-label="Changer l'image" style="z-index: 2; position: absolute;">
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>

            <div class="rounded-circle align-items-center justify-content-center border" style="position: absolute; z-index: 1; width: 35px; height: 35px; background-image: url('/images/upload-image.svg'); background-repeat: no-repeat; background-size: 65% 65%; background-position: 37% 35%; background-color: white; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
          </div>
          <div v-if="post.text" class="card-text mt-1 mb-0">
            <AutoResizeTextArea ref="textInput" id="textInput" class="form-control mb-2" :minRows="10" :maxRows="20" :resizeOnFocusEvent="false" />
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>
          </div>
        </div>

        <!-- Update post / cancel buttons -->
        <div id="updateAndCancelButtons" style="display: none;">
          <button type="submit" class="btn btn-success mt-3 me-1" id="updatePostButton">Mettre à jour</button>
          <button type="button" class="btn btn-danger mt-3" id="cancelPostEditButton">Annuler</button>
        </div>

        <!-- Modify/delete post buttons -->
        <div class="d-flex">
          <button type="button" ref="modifyPostButton" class="btn btn-outline-secondary mt-3 me-1" style="display: none;">Modifier le post</button>
          <button type="button" ref="deletePostButton" class="btn btn-outline-danger mt-3" style="display: none;">Supprimer le post</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import util from "../util/util"
import moment from "../../node_modules/moment/dist/moment"
import Voting from './Voting.vue';
import AutoResizeTextArea from "../components/AutoResizeTextArea.vue"

export default {
  name: 'PostCard',
  components: {
    Voting,
    AutoResizeTextArea
  },
  data() {
    return {
      frenchMomentJSLocaleLoaded: false,
      postRawText: this.post.text,
      postLikes: this.post.calculated_likes,
      postDislikes: this.post.calculated_dislikes,
      youLiked: this.post.you_liked === 1,
      youDisliked: this.post.you_disliked === 1,
      wasModified: this.post.was_modified === 1
    }
  },
  computed: {
    // Get userId in localStorage
    userId() {
      return localStorage.getItem('userId');
    },
    // Get elapsed time since post creation if the french momentjs locale has been loaded
    fromPostCreation() {
      if (this.frenchMomentJSLocaleLoaded) {
        moment.locale('fr');

        return moment(this.post.date).fromNow();
      }

      return "";
    },
    // Split the post text in multiple lines according to the line breaks found: \n
    postLines() {
      if (this.postRawText) {
        const lineArray = this.postRawText.split('\n');
        const lineObjectArray = [];

        for (let i = 0; i < lineArray.length; i++) {
          lineObjectArray[i] = {id: i, content: lineArray[i]};
        }

        return lineObjectArray;
      }

      return [];
    }
  },
  props: ['post'],
  mounted() {
    const component = this;

    // Load french momentjs locale to display in french elapsed time since comment creation
    moment.locale('fr', {
      months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
      monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
      monthsParseExact : true,
      weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
      weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
      weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
      weekdaysParseExact : true,
      longDateFormat : {
          LT : 'HH:mm',
          LTS : 'HH:mm:ss',
          L : 'DD/MM/YYYY',
          LL : 'D MMMM YYYY',
          LLL : 'D MMMM YYYY HH:mm',
          LLLL : 'dddd D MMMM YYYY HH:mm'
      },
      calendar : {
          sameDay : '[Aujourd’hui à] LT',
          nextDay : '[Demain à] LT',
          nextWeek : 'dddd [à] LT',
          lastDay : '[Hier à] LT',
          lastWeek : 'dddd [dernier à] LT',
          sameElse : 'L'
      },
      relativeTime : {
          future : 'dans %s',
          past : 'il y a %s',
          s : 'quelques secondes',
          m : 'une minute',
          mm : '%d minutes',
          h : 'une heure',
          hh : '%d heures',
          d : 'un jour',
          dd : '%d jours',
          M : 'un mois',
          MM : '%d mois',
          y : 'un an',
          yy : '%d ans'
      },
      dayOfMonthOrdinalParse : /\d{1,2}(er|e)/,
      ordinal : function (number) {
          return number + (number === 1 ? 'er' : 'e');
      },
      meridiemParse : /PD|MD/,
      isPM : function (input) {
          return input.charAt(0) === 'M';
      },
      // In case the meridiem units are not separated around 12, then implement
      // this function (look at locale/id.js for an example).
      // meridiemHour : function (hour, meridiem) {
      //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
      // },
      meridiem : function (hours) {
          return hours < 12 ? 'PD' : 'MD';
      },
      week : {
          dow : 1, // Monday is the first day of the week.
          doy : 4  // Used to determine first week of the year.
      }
   });

   this.frenchMomentJSLocaleLoaded = true;


    const isLocalUserAuthor = (this.post.author_id && this.post.author_id == localStorage.getItem('userId'))
    const isLocalUserAdmin = (localStorage.getItem("isAdmin") === "true")


    // If the local user is the author of the post or is an admin he can have access to the delete button
    if (isLocalUserAuthor || isLocalUserAdmin) {
      this.$refs.deletePostButton.style.display = "block";
      
      // Delete button click event
      this.$refs.deletePostButton.addEventListener("click", () => {
        this.$refs.deletePostButton.disabled = true; // We disable the delete button until we get the server response to avoid network spam

        const options = {
          method: "DELETE",
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }

        // Send the DELETE request to the backend
        fetch(`http://localhost:3000/api/post/${component.$route.params.postId}`, options)
            .then(function(response) {
                if (response.ok) {
                  component.$router.push("/");
                  component.$refs.deletePostButton.disabled = false;  // We re-enable the delete button if everything went ok
                }
            })
            .catch(function(error) {
                console.error(error);
                component.$refs.deletePostButton.disabled = false; // We re-enable the delete button if there is an error
            })
      })
    }


    // Post edition
    const titleInput = document.getElementById("titleInput");
    const textInput = document.getElementById("textInput");
    const textInputComponent = component.$refs.textInput;
    const imagePreview = document.getElementById("imagePreview");
    const imageInput = document.getElementById("imageInput");

    if (imageInput) {
        imageInput.addEventListener("change", () => {
          util.readFileInputURL(imageInput)
            .then((url) => {
              imagePreview.src = url;
            })
            .catch((error) => {
              console.error(error);
            });
        })
      }

    function startPostEditing() {
      titleInput.value = component.$refs.postTitle.innerText;

      if (imagePreview) {
        imagePreview.src = component.$refs.postImage.src;
      } else if (textInput) {
        textInput.value = component.postRawText;
        textInputComponent.fixHeight();
      }

      document.getElementById("postContainer").style.display = "none";
      component.$refs.modifyPostButton.style.display = "none";
      component.$refs.deletePostButton.style.display = "none";

      document.getElementById("postEditContainer").style.display = "block";
      document.getElementById("updateAndCancelButtons").style.display = "block";
    }

    function closePostEditing() {
      document.getElementById("postContainer").style.display = "block";
      component.$refs.modifyPostButton.style.display = "inline-block";
      component.$refs.deletePostButton.style.display = "inline-block";

      document.getElementById("postEditContainer").style.display = "none";
      document.getElementById("updateAndCancelButtons").style.display = "none";
    }

    function updatePost() {
      let body;
      let data = {};
      let headers = {
        'Authorization': localStorage.getItem('token')
      };
      let formInvalid;
      let postChanged;

      if (titleInput.value.length === 0) {
        util.setInputFeedback(titleInput, "invalid", "Saisissez un titre");
        formInvalid = true;
      } else if (titleInput.value.length > 300) {
        util.setInputFeedback(titleInput, "invalid", "300 caractères maximum");
        formInvalid = true;
      } else {
        util.setInputFeedback(titleInput, "none");
      }

      if (titleInput.value !== component.$refs.postTitle.innerText) {
        data.title = titleInput.value;
        postChanged = true;
      }

      if (component.post.image_url) {

          if (imagePreview.src !== component.$refs.postImage.src) {
            body = new FormData();
            body.append('image', imageInput.files[0]);

            if (data.title) {
              body.append('data', JSON.stringify(data));
            }

            postChanged = true;
          }

      } else if (textInput) {

        if (textInput.value.length === 0) {
          util.setInputFeedback(textInput, "invalid", "Saisissez du texte");
          formInvalid = true;
        } else if (textInput.value.length > 40000) {
          util.setInputFeedback(textInput, "invalid", "40000 caractères maximum");
          formInvalid = true;
        } else {
          util.setInputFeedback(textInput, "none");
        }

        if (textInput.value !== component.postRawText) {
          data.text = textInput.value;
          postChanged = true;
        }
      }

      // If all the inputs are valid we can do the request
      if (formInvalid) return;

      if (!postChanged) {
        closePostEditing();
        return;
      }

      if (!body) {
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }

      // Send the POST request to the backend
      document.getElementById("updatePostButton").disabled = true; // We disable the update button until we get the server response to avoid network spam

      const options = {
        method: "PATCH",
        body,
        headers
      }

      fetch(`http://localhost:3000/api/post/${component.$route.params.postId}`, options)
        .then(async function(response) {
            if (response.ok) {
              component.$refs.postTitle.innerText = titleInput.value;

              if (textInput && textInput.value) {
                component.postRawText = textInput.value;
              }

              if (imagePreview && imagePreview.src) {
                component.$refs.postImage.src = imagePreview.src;
              }

              component.wasModified = true;
              closePostEditing();
            }

            document.getElementById("updatePostButton").disabled = false; // We re-enable the update button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            document.getElementById("updatePostButton").disabled = false; // We re-enable the update button if there is an error
        })
    }

    // If the local user is the author of the post he can have access to the modify button
    if (isLocalUserAuthor) {
      component.$refs.modifyPostButton.style.display = "block";

      // Modify button click event
      component.$refs.modifyPostButton.addEventListener("click", startPostEditing)

      // Cancel button click event
      document.getElementById("cancelPostEditButton").addEventListener("click", closePostEditing)

      // Update post click event
      document.getElementById("updatePostButton").addEventListener("click", updatePost)
    }
  }
}
</script>

<style lang="scss" scoped>
  a {
    text-decoration: none;
  }

  .profileLink {
    color: #0c2aff;

    &:hover {
      color: darken(#0c2aff, 20);
    }
  }

  p:empty::before {
    content:"";
    display:inline-block;
  }
</style>