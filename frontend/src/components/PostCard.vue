<template>
  <div class="d-flex" style="position: relative; left: -14px;">
    <!-- Post votes -->
    <Voting type="Post" :likes="postLikes" :dislikes="postDislikes" :youLiked="youLiked" :youDisliked="youDisliked" :postOrCommentId="parseInt($route.params.postId)"/>

    <!-- Post in itself -->
    <div class="card text-dark w-100">
      <div class="card-header">
        <span v-if="post.author_id && post.author_id != userId">Publié par <router-link :to="'/profil/'+post.author_id">{{post.first_name + " " + post.last_name}}</router-link> {{fromPostCreation}}</span>
        <span v-if="!post.author_id">Publié par un utilisateur supprimé {{fromPostCreation}}</span>
        <span v-if="post.author_id && post.author_id == userId">Publié par vous {{fromPostCreation}}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title fw-bold">{{post.title}}</h3>
        <div class="d-flex justify-content-center">
          <img :src="post.image_url" v-if="post.image_url" class="mt-1 border" alt="" style="max-width: 100%;">
        </div>
        <div v-if="post.text" class="card-text mt-1 mb-0">
          <!-- For each text line in this.postLines() create a new p element in order to display backlines -->
          <p v-for="line in postLines" :key="line" class="my-0">{{line}}</p>
        </div>
        <div class="d-flex align-items-end">
          <button type="button" ref="deletePostButton" class="btn btn-outline-danger mt-3" style="display: none;">Supprimer le post</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "../../node_modules/moment/dist/moment"
import Voting from './Voting.vue';

export default {
  name: 'PostCard',
  components: {
    Voting
  },
  data() {
    return {
      frenchMomentJSLocaleLoaded: false,
      postLikes: this.post.calculated_likes,
      postDislikes: this.post.calculated_dislikes,
      youLiked: this.post.you_liked === 1,
      youDisliked: this.post.you_disliked === 1
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
      if (this.post.text) {
        return this.post.text.split('\n')
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

    // If the local user is the author of the post or is an admin he can have access to the delete button
    if (this.post.author_id && this.post.author_id == localStorage.getItem('userId') || localStorage.getItem("isAdmin") === "true") {
      
      this.$refs.deletePostButton.style.display = "block"; // We disable the delete button until we get the server response to avoid network spam

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
  }
}
</script>

<style lang="scss" scoped>
  a {
    text-decoration: none;
  }

  p:empty::before {
    content:"";
    display:inline-block;
  }
</style>