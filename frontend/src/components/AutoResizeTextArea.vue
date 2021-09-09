<template>
    <textarea ref="textArea" @input="inputChanged" @focusin="onFocusIn" @focusout="onFocusOut" :placeholder="placeholder" rows="1" style="resize: none;"></textarea>
</template>

<script>
export default {
  name: 'AutoResizeTextArea',
  props: {
    placeholder: String,
    minRows: Number,
    maxRows: Number,
    resizeOnFocusEvent: Boolean
  },
  data() {
    return {
      lineHeight: undefined,
      margin: undefined,
      hasFocus: false
    }
  },
  computed: {
    minTextAreaHeight() {
      return this.lineHeight * this.minRows + this.margin;
    },
    maxTextAreaHeight() {
      return this.lineHeight * this.maxRows + this.margin;
    }
  },
  methods: {
    /* This function fix a bug that make textArea.scrollHeight value invalid when it is in a parent with display: none
       by placing the textArea directly in document.body and once the height calculations are done we put the textArea
       back in its original parent  */
    safeFunction(functionPayload) {
      // Put the textArea in document.body
      const textArea = this.$refs.textArea
      const textAreaParentElement = textArea.parentElement
      const nextElementSibling = textArea.nextElementSibling

      if (textAreaParentElement !== document.body) {
        document.body.appendChild(textArea);
      }
      //textArea.style.visibility = "hidden";
      textArea.style.position = "absolute";

      // Call the function that makes calculations with scrollHeight
      functionPayload();

      // Put back the textArea in its original parent
      if (nextElementSibling) {
        nextElementSibling.insertAdjacentElement("beforebegin", textArea)
      } else if (textAreaParentElement !== document.body) {
        textAreaParentElement.appendChild(textArea);
      }
      //textArea.style.visibility = "visible";
      textArea.style.position = "static";
    },
    inputChanged() {
      // We reset the textArea height in order to have textArea.scrollHeight reflect the minimum size needed for the textArea to contain the text fully
      this.$refs.textArea.style.height = "auto";

      /* We set the height to textArea.scrollHeight that equals the minimum size needed for the textArea to contain the text fully or at least to minTextAreaHeight 
      and we cap it to maxTextAreaHeight */
      this.$refs.textArea.style.height = Math.min(Math.max(this.$refs.textArea.scrollHeight, this.minTextAreaHeight), this.maxTextAreaHeight) + "px";
    },
    onFocusIn() {
      // We set the minimum height of the textArea to minTextAreaHeight
      if (this.resizeOnFocusEvent) {
        this.$refs.textArea.style.height = Math.min(Math.max(this.$refs.textArea.scrollHeight, this.minTextAreaHeight), this.maxTextAreaHeight) + "px";
      }

      this.hasFocus = true;
    },
    onFocusOut() {
      // If we leave the textarea without any text in it we reset the height to equal one row
      // We use a timeout to prevent a little visual bug that makes the height flashing when onfocusin is called just after onfocusout
      if (this.resizeOnFocusEvent) {
        setTimeout(() => {
            if (!this.hasFocus && this.$refs.textArea.value.length === 0) {
            this.$refs.textArea.style.height = this.lineHeight + "px";
            }
        }, 0)
      }

      this.hasFocus = false;
    },
    fixHeight() {
      this.safeFunction(() => {
        this.inputChanged();
        this.onFocusOut();
      })
    },
  },
  mounted () {
    this.safeFunction(() => {
      this.lineHeight = parseInt(getComputedStyle(this.$refs.textArea).lineHeight);
      this.margin = this.$refs.textArea.scrollHeight - this.lineHeight;

      if (!this.resizeOnFocusEvent) {
        this.$refs.textArea.style.height = Math.max(this.$refs.textArea.scrollHeight, this.minTextAreaHeight) + "px";
      }
    })
  }
}
</script>