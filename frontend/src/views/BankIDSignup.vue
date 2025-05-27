<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
      <h3 class="text-2xl font-bold text-center">BankID Signup</h3>

      <div v-if="error" class="mt-4 p-2 text-sm text-red-700 bg-red-100 rounded-md">
        {{ error }}
      </div>

      <div v-if="!bankIdData" class="mt-6 text-center">
        <button
          @click="initiateBankId"
          :disabled="isLoading"
          class="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 disabled:opacity-50"
        >
          {{ isLoading ? 'Loading...' : 'Sign up with BankID' }}
        </button>
      </div>

      <div v-if="bankIdData" class="mt-6">
        <div class="p-4 mb-4 border border-gray-300 rounded-md bg-gray-50">
          <h4 class="text-lg font-semibold text-gray-700">BankID Information (Read-only)</h4>
          <p class="mt-2 text-gray-600"><strong>Name:</strong> {{ bankIdData.name }}</p>
          <p class="mt-1 text-gray-600"><strong>Social Security Number:</strong> {{ bankIdData.socialSecurityNumber }}</p>
        </div>

        <form @submit.prevent="completeSignup">
          <div class="mt-4">
            <div>
              <label class="block" for="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                v-model="email"
                required
                class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div class="mt-4">
              <label class="block" for="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                v-model="password"
                required
                minlength="6"
                class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div class="flex items-baseline justify-between mt-6">
              <button
                type="submit"
                :disabled="isLoading || !email || !password"
                class="w-full px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 disabled:opacity-50"
              >
                {{ isLoading ? 'Completing Signup...' : 'Complete Signup' }}
              </button>
            </div>
          </div>
        </form>
      </div>
       <div class="mt-6 text-sm text-gray-600 text-center">
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:underline">Login here</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import apiClient from '../services/api'; // Assuming apiClient is configured for base URL

const router = useRouter();
const authStore = useAuthStore();

const bankIdData = ref<{ name: string; socialSecurityNumber: string } | null>(null);
const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);

const initiateBankId = async () => {
  isLoading.value = true;
  error.value = null;
  bankIdData.value = null; 
  try {
    const response = await apiClient.post('/bankid/initiate-signup');
    // Ensure the response data matches the expected structure
    if (response.data && response.data.name && response.data.socialSecurityNumber) {
      bankIdData.value = response.data;
    } else {
      // Handle cases where the response might be successful (2xx) but not have the expected data
      console.error('Unexpected response structure from /bankid/initiate-signup:', response.data);
      error.value = 'Received unexpected data from BankID service. Please try again.';
    }
  } catch (err: any) {
    console.error('Error during BankID initiation:', err);
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Failed to initiate BankID signup. Please check your connection or try again later.';
    }
  } finally {
    isLoading.value = false;
  }
};

const completeSignup = async () => {
  if (!bankIdData.value) {
    error.value = 'BankID data is missing. Please initiate BankID signup first.';
    return;
  }
  if (!email.value || !password.value) {
    error.value = 'Email and password are required.';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await apiClient.post('/bankid/complete-signup', {
      name: bankIdData.value.name,
      socialSecurityNumber: bankIdData.value.socialSecurityNumber,
      email: email.value,
      password: password.value,
    });

    if (response.data && response.data.token && response.data.id) {
      // Assuming the response includes user details like id, name, email
      const userData = {
        id: response.data.id,
        name: response.data.name, // Ensure backend sends this
        email: response.data.email, // Ensure backend sends this
        // socialSecurityNumber: response.data.socialSecurityNumber // if backend sends it
      };
      
      authStore.token = response.data.token; // Directly set token
      authStore.user = userData; // Directly set user

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authUser', JSON.stringify(userData)); // Store user data
      }
      
      router.push('/'); // Navigate to home or dashboard
    } else {
      console.error('Unexpected response structure from /bankid/complete-signup:', response.data);
      error.value = 'Signup completed but received unexpected data from server.';
    }
  } catch (err: any) {
    console.error('Error during signup completion:', err);
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Failed to complete signup. Please try again later.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Scoped styles can be added here if needed, but Tailwind is preferred for general styling. */
</style>
