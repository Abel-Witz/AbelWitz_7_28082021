<template>
  <div class="card text-dark">
    <div class="card-body">
        <h4 class="card-title mb-3">Commenter</h4>
        <div class="row mt-2">
          <div class="col-12">
            <AutoResizeTextArea ref="textInput" class="form-control mb-2" placeholder="Qu'en pensez-vous ?" :minRows="5" :maxRows="10" :resizeOnFocusEvent="true"/>
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>

            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-sm btn-success" id="postCommentButton">Envoyer</button>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import util from "../util/util"
import AutoResizeTextArea from "../components/AutoResizeTextArea.vue"

export default {
  name: 'CommentForm',
  components: {
    AutoResizeTextArea
  },
  props: {
    'postId': Number
  },
  mounted () {
    const component = this;
    const textInput = this.$refs.textInput.$refs.textArea;
    const textInputComponent = this.$refs.textInput;
    const postCommentButton = document.getElementById("postCommentButton");


    // Post comment button click event
    postCommentButton.addEventListener("click", () => {
      // Validate inputs and give feedback
      let formInvalid;

      if (textInput.value.length === 0) {
        util.setInputFeedback(textInput, "invalid", "Saisissez du texte");
        formInvalid = true;
      } else if (textInput.value.length > 10000) {
        util.setInputFeedback(textInput, "invalid", "10000 caractères maximum");
        formInvalid = true;
      } else {
        util.setInputFeedback(textInput, "none");
      }

      // If all the inputs are valid we can do the request
      if (formInvalid) return;

      // We disable the post button until we get the server response to avoid network spam
      postCommentButton.disabled = true;

      // Send the POST request to the backend
      const options = {
        method: "POST",
        body: JSON.stringify({
          postId: component.postId,
          text: textInput.value}),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
          }
      }

      fetch("http://localhost:3000/api/comment", options)
        .then(async function(response) {
            if (response.ok) {
              component.$emit('commentsUpdateEvent')

              // Reset textInput
              textInput.value = "";
              textInputComponent.fixHeight();
            }

            postCommentButton.disabled = false; // We re-enable the post button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            postCommentButton.disabled = false; // We re-enable the post button if there is an error
        })
    })
  }
}
</script>