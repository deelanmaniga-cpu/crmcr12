import { createApp, ref, provide } from 'vue'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)

// simple session flag
const isAdmin = ref(false)
app.provide('isAdmin', isAdmin)

app.use(router).mount('#app')
