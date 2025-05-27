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
      <div v-if="ledgerStore.loadingAccounts" class="text-center text-gray-500">Loading accounts...</div>
      <div v-if="ledgerStore.fetchErrorAccounts" class="text-red-500 bg-red-100 p-3 rounded-md">{{ ledgerStore.fetchErrorAccounts }}</div>
      <div v-if="!ledgerStore.loadingAccounts && ledgerStore.accounts.length === 0 && !ledgerStore.fetchErrorAccounts" class="text-gray-500">No accounts found.</div>
      <div v-if="ledgerStore.accounts.length > 0" class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th class="py-3 px-6 text-left">Number</th>
              <th class="py-3 px-6 text-left">Name</th>
              <th class="py-3 px-6 text-left">Type</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm font-light">
            <tr v-for="account in ledgerStore.accounts" :key="account.id" class="border-b border-gray-200 hover:bg-gray-100">
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
      <div v-if="ledgerStore.loadingEntries" class="text-center text-gray-500">Loading entries...</div>
      <div v-if="ledgerStore.fetchErrorEntries" class="text-red-500 bg-red-100 p-3 rounded-md">{{ ledgerStore.fetchErrorEntries }}</div>
      <div v-if="!ledgerStore.loadingEntries && ledgerStore.ledgerEntries.length === 0 && !ledgerStore.fetchErrorEntries" class="text-gray-500">No ledger entries found.</div>
      <div v-if="ledgerStore.ledgerEntries.length > 0" class="overflow-x-auto bg-white shadow-md rounded-lg">
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
            <tr v-for="entry in ledgerStore.ledgerEntries" :key="entry.id" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left">{{ entry.date }}</td>
              <td class="py-3 px-6 text-left">{{ entry.description }}</td>
              <td class="py-3 px-6 text-left">{{ ledgerStore.getAccountName(entry.account_id) }} ({{ ledgerStore.getAccountNumber(entry.account_id) }})</td>
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
      <form @submit.prevent="handleSubmitEntry" class="p-6 bg-white shadow-md rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="entryDate" class="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="entryDate" v-model="ledgerStore.newEntry.date" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="entryAccount" class="block text-sm font-medium text-gray-700">Account</label>
            <select id="entryAccount" v-model="ledgerStore.newEntry.account_id" required class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option disabled value="">Please select an account</option>
              <option v-for="account in ledgerStore.accounts" :key="account.id" :value="account.id">
                {{ account.name }} ({{ account.number }})
              </option>
            </select>
          </div>
        </div>
        <div class="mt-6">
          <label for="entryDescription" class="block text-sm font-medium text-gray-700">Description</label>
          <input type="text" id="entryDescription" v-model="ledgerStore.newEntry.description" required placeholder="Transaction details" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        <div class="mt-6">
          <label for="entryAmount" class="block text-sm font-medium text-gray-700">Amount</label>
          <input type="number" id="entryAmount" v-model.number="ledgerStore.newEntry.amount" required step="0.01" placeholder="0.00" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        
        <div v-if="ledgerStore.submitError" class="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">
          {{ ledgerStore.submitError }}
        </div>
        <div v-if="ledgerStore.submitSuccess" class="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">
          Ledger entry added successfully!
        </div>

        <div class="mt-6">
          <button type="submit" :disabled="ledgerStore.submitting" class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-gray-400">
            <span v-if="ledgerStore.submitting">Submitting...</span>
            <span v-else>Add Entry</span>
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth'; // Adjusted path
import { useLedgerStore } from '../store/ledgerStore'; // Import the new ledger store

const authStore = useAuthStore();
const ledgerStore = useLedgerStore();
const router = useRouter();

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login'); // Should be handled by router guard, but as a fallback
  } else {
    ledgerStore.fetchAccounts();
    ledgerStore.fetchLedgerEntries();
    // If user info is not in store but should be, fetch it
    // Example: if (!authStore.user?.username) authStore.fetchUser(); 
  }
});

const handleSubmitEntry = async () => {
  await ledgerStore.handleAddLedgerEntry();
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
