import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Dialog, Notify, type QuasarLanguage } from 'quasar';
import quasarLangRu from 'quasar/lang/ru';

import App from './App.vue';
import router from './router';
import { useTelegramSessionStore } from 'src/stores/telegram-session';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './styles/app.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Quasar, {
  config: {
    dark: false,
  },
  plugins: {
    Dialog,
    Notify,
  },
  lang: quasarLangRu as QuasarLanguage,
});

const telegramSessionStore = useTelegramSessionStore(pinia);
void telegramSessionStore.initialize();

app.mount('#app');
