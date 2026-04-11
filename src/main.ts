import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dialog, Notify, type QuasarLanguage } from 'quasar';
import quasarLangRu from 'quasar/lang/ru';

import App from './App.vue';
import router from './router';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './styles/app.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: {
    Dialog,
    Notify,
  },
  lang: quasarLangRu as QuasarLanguage,
});

app.mount('#app');
