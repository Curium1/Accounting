<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
      <h3 class="text-2xl font-bold text-center">Login to your account</h3>
      <form @submit.prevent="handleLogin">
        <div class="mt-4">
          <div>
            <label class="block" for="username">Username</label>
            <input
              type="text"
              placeholder="Username"
              id="username"
              v-model="username"
              class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>
          <div class="mt-4">
            <label class="block" for="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              id="password"
              v-model="password"
              class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>
          <div v-if="authStore.error" class="mt-2 text-sm text-red-600">
            {{ authStore.error }}
          </div>
          <div class="flex items-baseline justify-between">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:bg-gray-400"
            >
              <span v-if="authStore.loading">Loading...</span>
              <span v-else>Login</span>
            </button>
            <!-- Optional: Add a link to register page -->
            <!-- <router-link to="/register" class="text-sm text-blue-600 hover:underline">Register</router-link> -->
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  const success = await authStore.login({ username: username.value, password: password.value });
  if (success) {
    router.push('/'); // Or '/dashboard'
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
