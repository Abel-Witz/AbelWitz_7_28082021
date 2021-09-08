<template>
    <textarea ref="textarea" :placeholder="placeholder" rows="1" style="resize: none;"></textarea>
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
  mounted () {
    const component = this;

    const textArea = this.$refs.textarea;
    const lineHeight = parseInt(getComputedStyle(textArea).lineHeight);
    const margin = textArea.scrollHeight - lineHeight;
    const minTextAreaHeight = lineHeight * component.minRows + margin;
    const maxTextAreaHeight = lineHeight * component.maxRows + margin;

    textArea.oninput = function() {
      // We reset the textArea height in order to have textArea.scrollHeight reflect the minimum size needed for the textArea to contain the text fully
      textArea.style.height = "";
      /* We set the height to textArea.scrollHeight that equals the minimum size needed for the textArea to contain the text fully or at least to minTextAreaHeight 
      and we cap it to maxTextAreaHeight */
      textArea.style.height = Math.min(Math.max(textArea.scrollHeight, minTextAreaHeight), maxTextAreaHeight) + "px";
    };

    if (!component.resizeOnFocusEvent) {
      textArea.style.height = Math.max(textArea.scrollHeight, minTextAreaHeight) + "px";
    }

    let hasFocus = false;

    textArea.addEventListener("focusin", () => {

      // We set the minimum height of the textArea to minTextAreaHeight
      if (component.resizeOnFocusEvent) {
        textArea.style.height = Math.max(textArea.scrollHeight, minTextAreaHeight) + "px";
      }

      hasFocus = true;
    })

    textArea.addEventListener("focusout", () => {
      // If we leave the textarea without any text in it we reset the height to equal one row
      // We use a timeout to prevent a little visual bug that makes the height flashing when onfocusin is called just after onfocusout
      if (component.resizeOnFocusEvent) {
        setTimeout(() => {
            if (!hasFocus && textArea.value.length === 0) {
            textArea.style.height = lineHeight + "px";
            }
        }, 0)
      }

      hasFocus = false;
    })
  }
}
</script>