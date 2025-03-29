import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import "./index.css";

const app = createApp(App);
app.component("v-select", vSelect); // Register globally
app.use(createPinia());
app.use(router);
app.mount("#app");
