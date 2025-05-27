<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-indigo-600 text-white shadow-md">
      <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold hover:text-indigo-200">
          LedgerApp
        </router-link>

        <div>
          <template v-if="authStore.isAuthenticated">
            <span class="mr-4">Welcome, {{ authStore.user?.username || 'User' }}</span>
            <router-link 
              to="/dashboard" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              General Ledger
            </router-link>
            <button
              @click="handleLogout"
              class="ml-3 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <router-link 
              to="/login" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              Login
            </router-link>
            <!-- Optional: Add a register link if you have a registration page -->
            <!-- <router-link to="/register" class="ml-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Register</router-link> -->
          </template>
        </div>
      </nav>
    </header>

    <main>
      <router-view /> <!-- This is where the content of your views will be injected -->
    </main>

    <footer class="bg-gray-800 text-white text-center p-4 mt-auto">
      <p>&copy; {{ new Date().getFullYear() }} LedgerApp. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout(router); // Pass router to handle redirect in store's logout action
};
</script>

<style scoped>
/* Ensure main content area takes up available space if footer is to be at bottom */
/* This can also be achieved with flexbox on the root div if header/footer heights are known/fixed */
/* For simplicity, min-h-screen on root and mt-auto on footer helps for basic cases */
</style>
