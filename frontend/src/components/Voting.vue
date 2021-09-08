<template>
    <div class="d-flex" style="flex-direction: column; margin-right: 6px">
        <div :class="getUpVoteClassList" @click="vote(1)">
            <font-awesome-icon class="upvoteIcon" icon="arrow-up" />
        </div>

        <div class="text-center">{{dataLikes - dataDislikes}}</div>

        <div :class="getDownVoteClassList" @click="vote(-1)">
            <font-awesome-icon class="downvoteIcon" icon="arrow-down" />
        </div>
    </div>
</template>

<script>

export default {
  name: 'Voting',
  data() {
    return {
      dataLikes: this.likes,
      dataDislikes: this.dislikes,
      dataYouLiked: this.youLiked,
      dataYouDisliked: this.youDisliked,
    }
  },
  computed: {
    // Make the upVote button look darker if the local user up-voted the post
    getUpVoteClassList() {
      if (!localStorage.getItem('userId')) {
        return "voteButton disabled"
      } else if (this.dataYouLiked) {
        return "voteButton chosen";
      }

      return "voteButton"
    },
    // Make the downVote button look darker if the local user down-voted the post
    getDownVoteClassList() {
      if (!localStorage.getItem('userId')) {
        return "voteButton disabled"
      } else if (this.dataYouDisliked) {
        return "voteButton chosen";
      }

      return "voteButton"
    }
  },
  props: {
      type: String,
      likes: Number,
      dislikes: Number,
      youLiked: Boolean,
      youDisliked: Boolean,
      postOrCommentId: Number
  },
  methods: {
    // Vote method for the buttons (1 as argument for the upVote button or -1 as argument for the downVote button)
    vote(rating) {
      const component = this;

      // Check that the user is logged-in
      if (!localStorage.getItem('userId')) return;

      // Remove the old rating
      if (rating === 1) {
        if (component.dataYouDisliked) {
          component.dataDislikes -= 1;
        } else if (component.dataYouLiked) {
          component.dataLikes -= 1;
          rating = 0;
        }
      } else if (rating === -1) {
        if (component.dataYouLiked) {
          component.dataLikes -= 1;
        } else if (component.dataYouDisliked) {
          component.dataDislikes -= 1;
          rating = 0;
        }
      }

      // Apply the new rating
      if (rating === 1) {
        component.dataYouLiked = true;
        component.dataYouDisliked = false;
        component.dataLikes += 1;
      } else if (rating === 0) {
        component.dataYouLiked = false;
        component.dataYouDisliked = false;
      } else if (rating === -1) {
        component.dataYouLiked = false;
        component.dataYouDisliked = true;
        component.dataDislikes += 1;
      }
      
      // Send the POST request to the backend
      const options = {
        method: "POST",
        body: JSON.stringify({
          rating
        }),
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      }

      let url;
      
      switch (this.type) {
        case "Post":
            url = `http://localhost:3000/api/post/${this.postOrCommentId}/rate`;
            break;
        case "Comment":
            url = `http://localhost:3000/api/comment/${this.postOrCommentId}/rate`;
            break;
        default:
            `http://localhost:3000/api/post/${this.postOrCommentId}/rate`
            break;
      }

      fetch(url, options)
        .catch(function(error) {
            console.error(error);
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  .voteButton {
    font-size: 22px;

    &.chosen:not(.disabled) {
      .upvoteIcon {
        color: green!important
      }
      
      .downvoteIcon {
        color: red!important
      }
    }

    &:hover:not(.disabled) {
      .upvoteIcon {
        color: transparentize(green, 0.7)
      }

      .downvoteIcon {
        color: transparentize(red, 0.7)
      }
    }
  }
</style>