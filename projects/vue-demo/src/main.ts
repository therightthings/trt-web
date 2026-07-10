import './styles.scss';

import { createApp } from 'vue';

import App from './app/App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#root');
