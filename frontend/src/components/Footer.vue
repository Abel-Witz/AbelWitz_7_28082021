<template>
  <div class="bg-light">
    <footer class="container">
      <div class="row">
        <div class="col">
          <ul class="list-inline p-4 m-0 text-center">
              <li class="list-inline-item list-styled">
                  <router-link to="/a-propos" class="text-decoration-none gray-link">À propos</router-link>
              </li>
              <li class="list-inline-item">&middot;</li>
              <li class="list-inline-item">
                  <router-link to="/vie-privee" class="text-decoration-none gray-link">Vie privée</router-link>
              </li>
              <li class="list-inline-item">&middot;</li>
              <li class="list-inline-item">
                  <router-link to="/conditions-utilisation" class="text-decoration-none gray-link">Conditions d'utilisation</router-link>
              </li>
              <li class="list-inline-item">&middot;</li>
              <li class="list-inline-item">
                  <router-link to="/mentions-legales" class="text-decoration-none gray-link">Mentions légales</router-link>
              </li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style lang="scss" scoped>
  .gray-link {
    color: rgba(0,0,0,.55)
  }
</style>