import "bootstrap/dist/css/bootstrap.min.css";
import VueApexCharts from "vue3-apexcharts";

import { createApp } from "vue";
import App from "./App.vue";

import "/src/assets/style/main.css";

const app = createApp(App);

app.use(VueApexCharts);

app.mount("#app");

// import "bootstrap/dist/js/bootstrap.js"
