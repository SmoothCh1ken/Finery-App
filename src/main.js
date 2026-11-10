import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Inyección de Vue Router
app.use(router)

// Montaje de la aplicación en la etiqueta #app de index.html
app.mount('#app')