import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import Pinia

import App from './App.vue'
import router from './router' // Import router
import { useAuthStore } from './stores/auth' // Import auth store
import './style.css' // Keep global styles

const app = createApp(App)

// Install Pinia first
app.use(createPinia())

// Initialize the auth store AFTER Pinia is installed
// This allows the store to be available for components and router guards
const authStore = useAuthStore()

// Attempt to restore authentication state from localStorage
// This should be done before router navigates, especially before the first navigation attempt
// that might depend on authentication state (e.g. in router.beforeEach)
// Note: checkAuth() in the store is synchronous for localStorage check.
// If it were async (e.g. verifying token with backend), more complex handling might be needed.
authStore.checkAuth()

// Install Vue Router
app.use(router)

app.mount('#app')
