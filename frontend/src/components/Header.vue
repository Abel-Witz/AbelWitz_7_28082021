<template>
  <div class="bg-light">
    <header class="container">
      <nav class="navbar navbar-expand-lg navbar-light py-3">
        <router-link class="navbar-brand" to="/">
          <img src="/images/icon-left-font-monochrome-black.svg" alt="" with="30" height="30">
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <slot></slot>
          </ul>
        </div>
      </nav>
    </header>
  </div>
</template>

<script>
export default {
  name: 'Header',
}
</script>