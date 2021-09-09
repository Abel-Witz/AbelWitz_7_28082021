<template>
  <div class="d-flex" style="position: relative; left: -14px;">
    <!-- Comment votes -->
    <Voting type="Comment" :likes="commentLikes" :dislikes="commentDislikes" :youLiked="youLiked" :youDisliked="youDisliked" :postOrCommentId="parseInt(comment.id)"/>

    <!-- Comment in itself -->
    <div class="card text-dark w-100">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-3 col-sm-2 col-lg-1 px-1">
            <div class="d-inline-block rounded-circle border" ref="profilePicture" style="width: 100%; padding-top: 100%; background-image: url('/images/user.svg'); background-size: cover;"></div>
          </div>
          <div class="col-9 col-sm-10 col-lg-9 pb-1 pe-0">
            <span v-if="comment.author_id && comment.author_id != userId">
              <router-link :to="'/profil/'+comment.author_id" class="profileLink">{{comment.first_name + " " + comment.last_name}}</router-link> 
              <span class="text-muted"> &middot; <span class="d-inline-block">{{fromCommentCreation}}</span></span>
            </span>
            <span v-if="comment.author_id && comment.author_id == userId">
              <span>Vous</span>
              <span class="text-muted"> &middot; <span class="d-inline-block">{{fromCommentCreation}}</span></span>
            </span>
          </div>
        </div>

        <!-- Comment text container -->
        <div ref="commentTextContainer" class="row mt-1">
          <div v-if="comment.text" class="col-12">
            <!-- For each text line in this.commentLines() create a new p element in order to display backlines -->
            
            <p v-for="line in commentLines" :key="line.id" class="my-0">{{line.content}}</p>
            <p v-if="wasModified" class="text-muted mt-1 mb-0" style="font-size: 10px;">(modifié)</p>
          </div>
        </div>

        <!-- Comment text edit container -->
        <div ref="commentTextEditContainer" class="row mt-1" style="display: none;">
          <div class="col-12">
            <AutoResizeTextArea ref="commentInput" class="form-control mb-2" :minRows="5" :maxRows="10" :resizeOnFocusEvent="true" />
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>
          </div>
        </div>

        <!-- Update comment / cancel buttons -->
        <div ref="updateAndCancelButtons" style="display: none;">
          <button type="submit" ref="updateCommentButton" class="btn btn-sm btn-success mt-3 me-1">Mettre à jour</button>
          <button type="button" ref="cancelCommentEditButton" class="btn btn-sm btn-danger mt-3">Annuler</button>
        </div>

        <!-- Modify/delete comment buttons -->
        <div class="d-flex align-items-end flex-wrap">
          <button type="button" ref="modifyCommentButton" class="btn btn-sm btn-outline-secondary mt-3 me-1" style="display: none;">Modifier</button>
          <button type="button" ref="deleteCommentButton" class="btn btn-sm btn-outline-danger mt-2" style="display: none;">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import util from "../util/util"
import moment from "moment"
import Voting from "./Voting.vue"
import AutoResizeTextArea from "../components/AutoResizeTextArea.vue"

export default {
  name: 'Comment',
  components: {
    Voting,
    AutoResizeTextArea
  },
  data() {
    return {
      frenchMomentJSLocaleLoaded: false, // Variable that tells us if the french MomentJS locale has been loaded
      commentRawText: this.comment.text,
      commentLikes: this.comment.calculated_likes,
      commentDislikes: this.comment.calculated_dislikes,
      youLiked: this.comment.you_liked === 1,
      youDisliked: this.comment.you_disliked === 1,
      wasModified: this.comment.was_modified === 1
    }
  },
  computed: {
    // Get userId in localStorage
    userId() {
      return localStorage.getItem('userId');
    },
    // Get elapsed time since comment creation if the french momentjs locale has been loaded
    fromCommentCreation() {
      if (this.frenchMomentJSLocaleLoaded) {
        moment.locale('fr');

        return moment(this.comment.date).fromNow(true);
      }

      return "";
    },
    // Split the comment text in multiple lines according to the line breaks found: \n
    commentLines() {
      if (this.commentRawText) {
        const lineArray = this.commentRawText.split('\n');
        const lineObjectArray = [];

        for (let i = 0; i < lineArray.length; i++) {
          lineObjectArray[i] = {id: i, content: lineArray[i]};
        }

        return lineObjectArray;
      }

      return [];
    }
  },
  props: {
    // Comment props
    comment: Object,
    commentUpdateCallback: Function
  },
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
            s : "à l'instant",
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


    /* If the comment author has a profile picture we change the background-image property of the avatar
    or we set it to the default value: url('/images/user.svg') */
    if (this.comment.profile_picture_url) {
      this.$refs.profilePicture.style.backgroundImage = `url('${this.comment.profile_picture_url}')`
    } else {
      this.$refs.profilePicture.style.backgroundImage = "url('/images/user.svg')"
    }


    const isLocalUserAuthor = (this.comment.author_id && this.comment.author_id == localStorage.getItem('userId'))
    const isLocalUserAdmin = (localStorage.getItem("isAdmin") === "true")


    // If the local user is the author of the post or is an admin he can have access to the delete button
    if (isLocalUserAuthor || isLocalUserAdmin) {
      this.$refs.deleteCommentButton.style.display = "block";


      // Delete button click event
      this.$refs.deleteCommentButton.addEventListener("click", () => {
        this.$refs.deleteCommentButton.disabled = true; // We disable the delete button until we get the server response to avoid network spam

        // Send the DELETE request to the backend
        const options = {
          method: "DELETE",
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        }

        fetch(`http://localhost:3000/api/comment/${component.comment.id}`, options)
            .then(function(response) {
                if (response.ok) {
                  component.$emit('commentsUpdateEvent')
                }
            })
            .catch(function(error) {
                console.error(error);
                component.$refs.deleteCommentButton.disabled = false; // We re-enable the delete button if there is an error
            })
      })
    }


    // Comment edition
    const textInput = component.$refs.commentInput.$refs.textArea;
    const textInputComponent = component.$refs.commentInput;

    function startCommentEditing() {
      textInput.value = component.commentRawText;
      textInputComponent.fixHeight();

      component.$refs.commentTextContainer.style.display = "none";

      component.$refs.modifyCommentButton.style.display = "none";
      component.$refs.deleteCommentButton.style.display = "none";

      component.$refs.commentTextEditContainer.style.display = "block";
      component.$refs.updateAndCancelButtons.style.display = "block";
    }

    function closeCommentEditing() {
      component.$refs.commentTextContainer.style.display = "block";
      
      component.$refs.modifyCommentButton.style.display = "inline-block";
      component.$refs.deleteCommentButton.style.display = "inline-block";

      component.$refs.commentTextEditContainer.style.display = "none";
      component.$refs.updateAndCancelButtons.style.display = "none";

      util.setInputFeedback(textInput, "none");
    }

    function updateComment() {
      if (textInput.value.length === 0) {
        util.setInputFeedback(textInput, "invalid", "Saisissez du texte");
        return;
      } else if (textInput.value.length > 40000) {
        util.setInputFeedback(textInput, "invalid", "40000 caractères maximum");
        return;
      } else {
        util.setInputFeedback(textInput, "none");
      }

      // If we didn't changed the text we don't make the PUT request
      if (textInput.value === component.commentRawText) {
        closeCommentEditing();
        return;
      }

      // Send the PUT request to the backend
     component.$refs.updateCommentButton.disabled = true; // We disable the update button until we get the server response to avoid network spam

      const options = {
        method: "PUT",
        body: JSON.stringify({
          text: textInput.value
        }),
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      }

      fetch(`http://localhost:3000/api/comment/${component.comment.id}`, options)
        .then(async function(response) {
            if (response.ok) {
              component.commentRawText = textInput.value;
              component.wasModified = true;

              closeCommentEditing();
            }

            component.$refs.updateCommentButton.disabled = false; // We re-enable the update button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            component.$refs.updateCommentButton.disabled = false; // We re-enable the update button if there is an error
        })
    }

    // If the local user is the author of the post he can have access to the modify button
    if (isLocalUserAuthor) {
      component.$refs.modifyCommentButton.style.display = "block";

      // Modify button click event
      component.$refs.modifyCommentButton.addEventListener("click", startCommentEditing)

      // Cancel button click event
      component.$refs.cancelCommentEditButton.addEventListener("click", closeCommentEditing)

      // Update post click event
      component.$refs.updateCommentButton.addEventListener("click", updateComment)
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

  /* Give paragraphs a height even if they are empty (used for line breaks) */
  p:empty::before {
    content:"";
    display:inline-block;
  }
</style>