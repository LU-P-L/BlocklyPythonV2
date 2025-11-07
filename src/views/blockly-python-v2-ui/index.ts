import './blockly-python-lib/assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './index.vue'

const app = createApp(App)

app.use(createPinia())
// app.use(router)

app.mount('#app')