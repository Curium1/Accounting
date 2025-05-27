import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Login from '../views/Login.vue';
// GeneralLedger is now lazy-loaded
import BankIDSignup from '../views/BankIDSignup.vue'; // Import BankIDSignup component
import CompaniesView from '../views/CompaniesView.vue'; // Import CompaniesView component
import EnrollCompany from '../views/EnrollCompany.vue'; // Import EnrollCompany component
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup-bankid',
    name: 'BankIDSignup',
    component: BankIDSignup,
    meta: { requiresAuth: false }, // Signup is for unauthenticated users
  },
  {
    path: '/dashboard', // This path remains the main authenticated view
    name: 'GeneralLedger', // Changed name for clarity
    component: () => import('@/modules/ledger/views/GeneralLedgerView.vue'), // Lazy load from new path
    meta: { requiresAuth: true },
  },
  {
    path: '/companies',
    name: 'CompaniesView',
    component: CompaniesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/enroll-company/:orgNumber',
    name: 'EnrollCompany',
    component: EnrollCompany,
    props: true, // Pass route params as props
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/dashboard', // Redirect root to the main authenticated view
  },
  // Aktiehantering Module Routes
  {
    path: '/aktiehantering',
    name: 'AktiehanteringDashboard',
    component: () => import('@/modules/aktiehantering/views/AktiehanteringDashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/aktiehantering/shareholders',
    name: 'ShareholderList',
    component: () => import('@/modules/aktiehantering/views/ShareholderListView.vue'),
    meta: { requiresAuth: true }
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
