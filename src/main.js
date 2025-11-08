import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import store from "./store";
import "./assets/global.css";

Vue.use(Vuex);
Vue.config.productionTip = false;
document.addEventListener("DOMContentLoaded", () => {
  new Vue({
    store,
    render: (h) => h(App),
  }).$mount("#app");
});
