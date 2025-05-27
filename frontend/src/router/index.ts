import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '../views/Login.vue';
// Import GeneralLedger.vue instead of Dashboard.vue
import GeneralLedger from '../views/GeneralLedger.vue'; 
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard', // This path remains the main authenticated view
    name: 'GeneralLedger', // Changed name for clarity
    component: GeneralLedger, // Use GeneralLedger component
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/dashboard', // Redirect root to the main authenticated view
  },
  // Optional: Add a 404 route
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.token && localStorage.getItem('authToken')) {
      authStore.checkAuth(); 
  }

  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = authStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isAuthenticated) {
    // If authenticated, redirect from login to the main authenticated view
    next({ name: 'GeneralLedger' }); 
  } else {
    next();
  }
});

export default router;
