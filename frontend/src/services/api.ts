import axios from 'axios';
import { useAuthStore } from '../stores/auth'; // Adjusted path if necessary

const apiClient = axios.create({
  baseURL: '/api', // This will be handled by the Vite proxy
});

apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore(); // Get store instance inside interceptor
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // Handle request errors here
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for global error handling
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Example: Redirect to login or refresh token
//       const authStore = useAuthStore();
//       authStore.logout(); // Or trigger a token refresh mechanism
//       // Potentially redirect to login page using router instance if available
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
