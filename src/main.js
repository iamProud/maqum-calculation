import "bootstrap/dist/css/bootstrap.min.css";
import VueApexCharts from "vue3-apexcharts";

// Global Components
import Tile from "./components/tile.vue";

import { createApp } from "vue";
import App from "./App.vue";

import "/src/assets/style/main.css";

const app = createApp(App);

app.use(VueApexCharts);

app.component("Tile", Tile);

app.mount("#app");
