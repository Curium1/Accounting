<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">General Ledger</h1>

    <!-- Display User Info and Logout -->
    <div class="mb-6 p-4 bg-white shadow rounded-lg">
      <div v-if="authStore.isAuthenticated && authStore.user" class="flex justify-between items-center">
        <div>
          <p class="text-lg">Welcome, <span class="font-semibold">{{ authStore.user.username }}</span>!</p>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Accounts Section -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Chart of Accounts</h2>
      <div v-if="loadingAccounts" class="text-center text-gray-500">Loading accounts...</div>
      <div v-if="fetchErrorAccounts" class="text-red-500 bg-red-100 p-3 rounded-md">{{ fetchErrorAccounts }}</div>
      <div v-if="!loadingAccounts && accounts.length === 0 && !fetchErrorAccounts" class="text-gray-500">No accounts found.</div>
      <div v-if="accounts.length > 0" class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th class="py-3 px-6 text-left">Number</th>
              <th class="py-3 px-6 text-left">Name</th>
              <th class="py-3 px-6 text-left">Type</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr v-for="account in accounts" :key="account.id" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">{{ account.number }}</td>
              <td class="py-3 px-6 text-left">{{ account.name }}</td>
              <td class="py-3 px-6 text-left">{{ account.type }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Ledger Entries Section -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Ledger Entries</h2>
      <div v-if="loadingEntries" class="text-center text-gray-500">Loading entries...</div>
      <div v-if="fetchErrorEntries" class="text-red-500 bg-red-100 p-3 rounded-md">{{ fetchErrorEntries }}</div>
      <div v-if="!loadingEntries && ledgerEntries.length === 0 && !fetchErrorEntries" class="text-gray-500">No ledger entries found.</div>
      <div v-if="ledgerEntries.length > 0" class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th class="py-3 px-6 text-left">Date</th>
              <th class="py-3 px-6 text-left">Description</th>
              <th class="py-3 px-6 text-left">Account</th>
              <th class="py-3 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr v-for="entry in ledgerEntries" :key="entry.id" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left">{{ entry.date }}</td>
              <td class="py-3 px-6 text-left">{{ entry.description }}</td>
              <td class="py-3 px-6 text-left">{{ getAccountName(entry.account_id) }} ({{ getAccountNumber(entry.account_id) }})</td>
              <td class="py-3 px-6 text-right" :class="entry.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ entry.amount.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Form for New Ledger Entry Section -->
    <section>
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Add New Ledger Entry</h2>
      <form @submit.prevent="handleAddLedgerEntry" class="p-6 bg-white shadow-md rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="entryDate" class="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="entryDate" v-model="newEntry.date" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="entryAccount" class="block text-sm font-medium text-gray-700">Account</label>
            <select id="entryAccount" v-model="newEntry.account_id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option disabled value="">Please select an account</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }} ({{ account.number }})
              </option>
            </select>
          </div>
        </div>
        <div class="mt-6">
          <label for="entryDescription" class="block text-sm font-medium text-gray-700">Description</label>
          <input type="text" id="entryDescription" v-model="newEntry.description" required placeholder="Transaction details" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        <div class="mt-6">
          <label for="entryAmount" class="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" id="entryAmount" v-model.number="newEntry.amount" required step="0.01" placeholder="0.00" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        
        <div v-if="submitError" class="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">
          {{ submitError }}
        </div>
        <div v-if="submitSuccess" class="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">
          Ledger entry added successfully!
        </div>

        <div class="mt-6">
          <button type="submit" :disabled="submitting" class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-gray-400">
            <span v-if="submitting">Submitting...</span>
            <span v-else>Add Entry</span>
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api'; // Use the new apiClient
import { useAuthStore } from '../stores/auth';

// Define interfaces for our data structures matching backend schemas
interface Account {
  id: number;
  number: string;
  name: string;
  type: string;
}

interface LedgerEntry {
  id: number;
  date: string; // Assuming date comes as string from API, or use Date object
  description: string;
  account_id: number;
  amount: number;
}

interface NewLedgerEntry {
  date: string;
  description: string;
  account_id: number | null;
  amount: number | null;
}

const authStore = useAuthStore();
const router = useRouter();

const accounts = ref<Account[]>([]);
const ledgerEntries = ref<LedgerEntry[]>([]);

const loadingAccounts = ref(false);
const loadingEntries = ref(false);
const fetchErrorAccounts = ref<string | null>(null);
const fetchErrorEntries = ref<string | null>(null);

const newEntry = ref<NewLedgerEntry>({
  date: new Date().toISOString().split('T')[0], // Default to today
  description: '',
  account_id: null,
  amount: null,
});
const submitting = ref(false);
const submitError = ref<string | null>(null);
const submitSuccess = ref(false);

// Fetching data
const fetchAccounts = async () => {
  loadingAccounts.value = true;
  fetchErrorAccounts.value = null;
  try {
    const response = await apiClient.get<Account[]>('/ledger/accounts/');
    accounts.value = response.data;
  } catch (error: any) {
    console.error('Failed to fetch accounts:', error);
    fetchErrorAccounts.value = error.response?.data?.detail || error.message || 'Failed to load accounts.';
  } finally {
    loadingAccounts.value = false;
  }
};

const fetchLedgerEntries = async () => {
  loadingEntries.value = true;
  fetchErrorEntries.value = null;
  try {
    const response = await apiClient.get<LedgerEntry[]>('/ledger/ledger-entries/');
    ledgerEntries.value = response.data;
  } catch (error: any) {
    console.error('Failed to fetch ledger entries:', error);
    fetchErrorEntries.value = error.response?.data?.detail || error.message || 'Failed to load ledger entries.';
  } finally {
    loadingEntries.value = false;
  }
};

// Call onMounted
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login'); // Should be handled by router guard, but as a fallback
  } else {
    fetchAccounts();
    fetchLedgerEntries();
    // If user info is not in store but should be, fetch it
    // Example: if (!authStore.user?.username) authStore.fetchUser(); 
  }
});

// Helper to get account name/number for display
const getAccountName = (accountId: number): string => {
  const account = accounts.value.find(acc => acc.id === accountId);
  return account ? account.name : 'Unknown Account';
};
const getAccountNumber = (accountId: number): string => {
  const account = accounts.value.find(acc => acc.id === accountId);
  return account ? account.number : 'N/A';
};

// Form handling
const handleAddLedgerEntry = async () => {
  if (newEntry.value.account_id === null || newEntry.value.amount === null || !newEntry.value.date || !newEntry.value.description) {
    submitError.value = 'Please fill in all fields.';
    return;
  }
  submitting.value = true;
  submitError.value = null;
  submitSuccess.value = false;
  try {
    const payload = {
      date: newEntry.value.date,
      description: newEntry.value.description,
      account_id: newEntry.value.account_id,
      amount: newEntry.value.amount,
    };
    const response = await apiClient.post<LedgerEntry>('/ledger/ledger-entries/', payload);
    // Optimistically add or re-fetch
    ledgerEntries.value.push(response.data); // Simple optimistic add
    // Or: await fetchLedgerEntries(); // Re-fetch all

    // Reset form
    newEntry.value = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      account_id: null,
      amount: null,
    };
    submitSuccess.value = true;
    setTimeout(() => submitSuccess.value = false, 3000); // Hide success message after 3s

  } catch (error: any) {
    console.error('Failed to add ledger entry:', error);
    submitError.value = error.response?.data?.detail || error.message || 'Failed to add entry.';
  } finally {
    submitting.value = false;
  }
};

const handleLogout = () => {
  authStore.logout(router);
};

</script>

<style scoped>
/* Basic styling for tables and forms if needed, Tailwind should cover most */
/* For example, to ensure select dropdown has a decent width if Tailwind defaults are too narrow */
select {
  min-width: 150px; 
}
</style>
