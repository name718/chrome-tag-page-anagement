import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Options from './components/Options.vue'
import './style.css'

const app = createApp(Options)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
