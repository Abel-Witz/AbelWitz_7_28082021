<template>
  <main class="bg-white py-4 mt-4">
    <div class="container px-4">
      <slot></slot>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Main',
}
</script>

<style lang="scss" scoped>
  main {
    min-height: 550px;
  }
</style>