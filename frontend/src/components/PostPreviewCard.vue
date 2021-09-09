<template>
  <div class="d-flex" style="position: relative; left: -14px;">
    <!-- Post votes -->
    <Voting type="Post" :likes="postLikes" :dislikes="postDislikes" :youLiked="youLiked" :youDisliked="youDisliked" :postOrCommentId="post.id"/>

    <!-- Post in itself -->
    <router-link :to="`/post/${post.id}`" class="link-dark w-100">
      <div class="card">
        <div class="card-header">
          <span v-if="post.author_id && post.author_id != userId">Publié par <router-link :to="'/profil/'+post.author_id" class="profileLink">{{post.first_name + " " + post.last_name}}</router-link> {{fromPostCreation}}</span>
          <span v-if="!post.author_id">Publié par un utilisateur supprimé {{fromPostCreation}}</span>
          <span v-if="post.author_id && post.author_id == userId">Publié par vous {{fromPostCreation}}</span>
        </div>
        <div class="card-body">
          <h5 class="card-title fw-bold">{{post.title}}</h5>
          <img :src="post.image_url" v-if="post.image_url" class="card-img-top mt-1 " alt="" style="object-fit: cover;">

          <div v-if="post.text" class="card-text mt-1">
            <!-- For each text line in this.postLines() create a new p element in order to display backlines -->
            <p v-for="line in postLines" :key="line.id" class="my-0">{{line.content}}</p>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import moment from "../../node_modules/moment/dist/moment"
import Voting from './Voting.vue';

export default {
  components: { Voting },
  name: 'PostPreviewCard',
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
        const lineArray = this.post.text.split('\n');
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
  },
}
</script>

<style lang="scss" scoped>
  a {
    text-decoration: none;
  }

  .card-text {
    max-height: 303px;
    overflow: hidden;
  }

  /* Give paragraphs a height even if they are empty (used for line breaks) */
  p:empty::before {
    content:"";
    display:inline-block;
  }
</style>

<style lang="scss" scoped>
  .profileLink {
    color: #0c2aff;

    &:hover {
      color: darken(#0c2aff, 20);
    }
  }
</style>