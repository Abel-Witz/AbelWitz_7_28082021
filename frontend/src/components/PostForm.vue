<template>
  <div class="card">
    <div class="card-body">
      <!-- Title input -->
      <div class="input-group input-group mb-4">
        <span class="input-group-text" id="inputGroup-sizing-lg">Titre</span>
        <input type="text" class="form-control" id="titleInput" placeholder="Écrivez le titre ici" aria-describedby="inputGroup-sizing-lg">
        <div class="valid-feedback"></div>
        <div class="invalid-feedback"></div>
      </div>

      <!-- Content tabs -->
      <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="pills-text-tab" data-bs-toggle="pill" data-bs-target="#pills-text" type="button" role="tab" aria-controls="pills-text" aria-selected="true">Texte</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="pills-image-tab" data-bs-toggle="pill" data-bs-target="#pills-image" type="button" role="tab" aria-controls="pills-image" aria-selected="false">Image</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="pills-empty-tab" data-bs-toggle="pill" data-bs-target="#pills-empty" type="button" role="tab" aria-controls="pills-empty" aria-selected="false">Vide</button>
        </li>
      </ul>

      <!-- Content inputs -->
      <div class="tab-content mb-3" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-text" role="tabpanel" aria-labelledby="pills-text-tab">
          <AutoResizeTextArea id="textInput" class="form-control mb-2" placeholder="Écrivez-ici" :minRows="10" :maxRows="20" :resizeOnFocusEvent="false" />
          <div class="valid-feedback"></div>
          <div class="invalid-feedback"></div>
        </div>
        <div class="tab-pane fade" id="pills-image" role="tabpanel" aria-labelledby="pills-image-tab">
          <div class="input-group">
            <input type="file" class="form-control mb-3" id="imageInput" accept=".png,.jpeg,.jpg" aria-label="Upload">
            <div class="valid-feedback"></div>
            <div class="invalid-feedback"></div>
          </div>
          
          <div class="d-flex justify-content-center">
            <img class="border" id="imagePreview" src="" alt="" style="max-width: 100%;" />
          </div>
        </div>
        <div class="tab-pane fade" id="pills-empty" role="tabpanel" aria-labelledby="pills-empty-tab"></div>
      </div>

      <!-- Post button -->
      <div class="d-flex justify-content-center"><button type="button" class="btn btn-success" ref="postButton">Poster le post</button></div>
    </div>
  </div>
</template>

<script>
import util from "../util/util"
import AutoResizeTextArea from "../components/AutoResizeTextArea.vue"

export default {
  name: 'PostForm',
  components: {
    AutoResizeTextArea
  },
  mounted () {
    const component = this;
    const titleInput = document.getElementById("titleInput");
    const textArea = document.getElementById("textInput");
    

    // Image input preview
    const imageInput = document.getElementById("imageInput");
    imageInput.addEventListener("change", () => {
      util.readFileInputURL(imageInput)
        .then((url) => {
          const el = document.getElementById('imagePreview');
          el.src = url;
        })
        .catch((error) => {
          console.error(error);
        });
    })


    // Post button click event
    this.$refs.postButton.addEventListener("click", () => {

      // Generate the JSON that we will send to the backend
      let body;
      const data = { title: titleInput.value };
      const headers = {'Authorization': localStorage.getItem('token')}


      // Validate inputs and give feedback
      let formInvalid;

      if (titleInput.value.length === 0) {
        util.setInputFeedback(titleInput, "invalid", "Saisissez un titre");
        formInvalid = true;
      } else if (titleInput.value.length > 300) {
        util.setInputFeedback(titleInput, "invalid", "300 caractères maximum");
        formInvalid = true;
      } else {
        util.setInputFeedback(titleInput, "none");
      }

      if (document.getElementById("pills-text-tab").classList.contains("active")) {
        if (textArea.value.length === 0) {
          util.setInputFeedback(textArea, "invalid", "Saisissez du texte");
          formInvalid = true;
        } else if (textArea.value.length > 40000) {
          util.setInputFeedback(textArea, "invalid", "40000 caractères maximum");
          formInvalid = true;
        } else {
          util.setInputFeedback(textArea, "none");
        }

        // If the user selected text as post content type then we store the textArea.value in stringified JSON
        data['text'] = textArea.value
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';

      } else if (document.getElementById("pills-image-tab").classList.contains("active")) {
        if (!imageInput.files || !imageInput.files[0]) {
          util.setInputFeedback(imageInput, "invalid", "Choisissez une image");
          formInvalid = true;
        } else {
          util.setInputFeedback(imageInput, "none");

          // else if the user selected image as post content type then we store the imageInput.files[0] in a FormData
          body = new FormData();
          body.append('image', imageInput.files[0]);
          body.append('data', JSON.stringify(data));
        }
      } else {
        // else if the user selected empty as post content then we just store the title in stringified json
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }


      // Check that the form is valid
      if (formInvalid) return;

      component.$refs.postButton.disabled = true; // We disable the post button until we get the server response to avoid network spam

      // Send the POST request to the backend
      const options = {
        method: "POST",
        body,
        headers
      }

      fetch("http://localhost:3000/api/post", options)
        .then(async function(response) {
            const json = await response.json();

            // If the post creation succeed we are redirected to it
            if (json.postId) {
              component.$router.push("/post/" + json.postId);
            }

            component.$refs.postButton.disabled = false;  // We re-enable the post button if everything went ok
        })
        .catch(function(error) {
            console.error(error);

            component.$refs.postButton.disabled = false;  // We re-enable the post button if there is an error
        })
    })
  }
}
</script>