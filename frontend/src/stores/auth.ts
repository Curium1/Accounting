import { defineStore } from 'pinia'
import axios from 'axios'
import { computed, ref } from 'vue'
import type { Router } from 'vue-router' // For router injection if needed, or use globally

// Define a type for user data if you have a specific structure
// For now, using a generic object or null
type User = object | null;

export const useAuthStore = defineStore('auth', () => {
    // State
    const token = ref<string | null>(localStorage.getItem('authToken') || null);
    const user = ref<User>(null); // Or load from localStorage if you store user details
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Getters (Computed)
    const isAuthenticated = computed<boolean>(() => !!token.value);

    // Actions
    async function login(credentials: { username: string, password: string }): Promise<boolean> {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            params.append('username', credentials.username);
            params.append('password', credentials.password);

            const response = await axios.post<{ access_token: string, token_type: string }>(
                '/api/auth/token', // Assuming Vite proxy is set up
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            
            token.value = response.data.access_token;
            localStorage.setItem('authToken', token.value);
            
            // Optionally fetch user details here if your token endpoint doesn't return them
            // For example: await fetchUser();
            // For now, we'll just mark as logged in. User details can be fetched separately.
            user.value = { username: credentials.username }; // Placeholder user object

            loading.value = false;
            return true;
        } catch (err: any) {
            loading.value = false;
            if (axios.isAxiosError(err) && err.response) {
                error.value = err.response.data.detail || 'Login failed. Please check your credentials.';
            } else {
                error.value = 'An unexpected error occurred during login.';
            }
            localStorage.removeItem('authToken');
            token.value = null;
            user.value = null;
            return false;
        }
    }

    function logout(router?: Router) { // Optional router for redirect
        token.value = null;
        user.value = null;
        localStorage.removeItem('authToken');
        // If a router instance is provided, redirect to login
        if (router) {
            router.push('/login');
        }
    }

    function checkAuth() {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            token.value = storedToken;
            // Optionally, you might want to verify the token with the backend here
            // or fetch user details if they are not stored in localStorage.
            // For this example, we assume the token is valid if present.
            // You might want to store and retrieve a minimal user object from localStorage too.
            // For now, user state is not restored from localStorage beyond the token implying auth.
        } else {
            token.value = null;
        }
    }

    // Optional: action to fetch user details if not done at login
    // async function fetchUser() {
    //     if (token.value) {
    //         try {
    //             const response = await axios.get('/api/users/me', { // Example endpoint
    //                 headers: { Authorization: `Bearer ${token.value}` }
    //             });
    //             user.value = response.data;
    //         } catch (e) {
    //             console.error("Failed to fetch user", e);
    //             // Could trigger logout if token is invalid
    //             logout();
    //         }
    //     }
    // }

    return {
        token,
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        // fetchUser,
    };
});
