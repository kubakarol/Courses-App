import "bootstrap/dist/css/bootstrap.css";
import "primevue/resources/themes/lara-light-blue/theme.css";

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import PrimeVue from 'primevue/config';

const app = createApp(App);
app.use(VCalendar, {})
app.use(router);
app.use(PrimeVue);
app.mount("#app");
