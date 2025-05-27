<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">Enroll Company</h1>

    <div v-if="isLoading" class="text-center text-gray-500">
      <p>Loading company details...</p>
    </div>
    
    <div v-else-if="!company" class="text-center text-red-500 bg-red-100 p-4 rounded-md">
      <p>Company not found for organization number: {{ orgNumber }}.</p>
      <p>Please ensure the company exists or try again.</p>
      <router-link to="/companies" class="mt-4 inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
        Back to Companies
      </router-link>
    </div>

    <div v-else class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div class="mb-6 border-b pb-4">
        <h2 class="text-2xl font-semibold text-blue-700 mb-2">{{ company.GRUNDINFORMATION.ORGANISATIONSNAMN }}</h2>
        <p class="text-md text-gray-600">
          Organization Number: <span class="font-medium">{{ company.GRUNDINFORMATION.IDENTITETSBETECKNING }}</span>
        </p>
        <p class="text-sm mt-1" :class="company.isEnrolled ? 'text-green-600' : 'text-orange-500'">
          Current Status: <span class="font-semibold">{{ company.isEnrolled ? 'Already Enrolled' : 'Not Enrolled' }}</span>
        </p>
      </div>

      <div class="space-y-4">
        <button
          @click="activateShareRegister"
          class="w-full px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-150"
        >
          Activate Share Register
        </button>
        <button
          @click="setupCompany"
          class="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150"
        >
          Setup Company (Full Enrollment)
        </button>
      </div>
      
      <div class="mt-8 text-center">
        <router-link to="/companies" class="text-sm text-gray-600 hover:text-blue-600 hover:underline">
          &larr; Back to Companies List
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCompanyStore, type Company } from '../stores/companyStore'; // Ensure type Company is exported

const route = useRoute();
const companyStore = useCompanyStore();

const orgNumber = ref(route.params.orgNumber as string);
const company = ref<Company | null | undefined>(null); // Can be undefined if not found by getter
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  if (companyStore.companies.length === 0) {
    // Fetch companies if the store is empty (e.g., direct navigation)
    try {
      await companyStore.fetchCompanies();
    } catch (error) {
      console.error("Failed to fetch companies on enroll page:", error);
      // Handle error, maybe set an error state
    }
  }
  
  // The getCompanyById getter returns a ComputedRef<Company | undefined>
  // So we need to access its .value property.
  const companyRef = companyStore.getCompanyById(orgNumber.value);
  company.value = companyRef.value; // Assign the actual company object or undefined
  isLoading.value = false;
});

const activateShareRegister = () => {
  if (company.value) {
    console.log(`Activating Share Register for: ${company.value.GRUNDINFORMATION.ORGANISATIONSNAMN} (${orgNumber.value})`);
    // Placeholder for actual activation logic
  } else {
    console.error("Cannot activate share register: Company data not loaded.");
  }
};

const setupCompany = () => {
  if (company.value) {
    console.log(`Setting up Company (Full Enrollment) for: ${company.value.GRUNDINFORMATION.ORGANISATIONSNAMN} (${orgNumber.value})`);
    // Placeholder for actual setup logic
  } else {
    console.error("Cannot setup company: Company data not loaded.");
  }
};
</script>

<style scoped>
/* Scoped styles for EnrollCompany.vue */
.container {
  max-width: 1000px; /* Adjust as needed */
}
</style>
