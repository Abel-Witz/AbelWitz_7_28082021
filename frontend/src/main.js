import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Use Bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

// Use FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faArrowUp);
library.add(faArrowDown);

// Create app
createApp(App).use(store).use(router).component("font-awesome-icon", FontAwesomeIcon).mount('#app')