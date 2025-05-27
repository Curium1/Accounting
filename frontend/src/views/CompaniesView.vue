<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">My Companies</h1>
    
    <div v-if="companyStore.companies.length === 0 && !isLoading" class="text-center text-gray-500">
      <p>No companies found. Try fetching them or check the store.</p>
    </div>

    <div v-else-if="isLoading" class="text-center text-gray-500">
      <p>Loading companies...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="company in companyStore.sortedCompanies"
        :key="company.GRUNDINFORMATION.IDENTITETSBETECKNING"
        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
      >
        <h3 class="text-xl font-semibold text-blue-700 mb-2">{{ company.GRUNDINFORMATION.ORGANISATIONSNAMN }}</h3>
        <p class="text-sm text-gray-600 mb-1">
          Org.nr: <span class="font-medium">{{ company.GRUNDINFORMATION.IDENTITETSBETECKNING }}</span>
        </p>
        <p class="text-sm mb-3" :class="company.isEnrolled ? 'text-green-600' : 'text-red-600'">
          Status: 
          <span class="font-semibold">{{ company.isEnrolled ? 'Enrolled' : 'Not Enrolled' }}</span>
        </p>
        
        <div v-if="company.ENSKILDA_INFORMATIONSMÄNGDER?.HEMVISTKOMMUN" class="text-xs text-gray-500 mb-1">
          Location: {{ company.ENSKILDA_INFORMATIONSMÄNGDER.HEMVISTKOMMUN }}
        </div>
        <div v-if="company.GRUNDINFORMATION.ORGANISATIONSFORM?.text" class="text-xs text-gray-500 mb-3">
          Type: {{ company.GRUNDINFORMATION.ORGANISATIONSFORM.text }}
        </div>

        <button
          v-if="!company.isEnrolled"
          @click="goToEnroll(company.GRUNDINFORMATION.IDENTITETSBETECKNING)"
          class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150"
        >
          Enroll Company
        </button>
        <button
          v-else
          @click="viewCompanyDetails(company.GRUNDINFORMATION.IDENTITETSBETECKNING)"
          class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-150"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCompanyStore } from '../stores/companyStore';
import { useRouter } from 'vue-router';

const companyStore = useCompanyStore();
const router = useRouter();
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  try {
    // Check if companies are already loaded to avoid redundant fetches if not desired
    // For this task, always fetching to ensure data consistency as per requirements
    await companyStore.fetchCompanies(); 
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    // Optionally, set an error state here to display in the template
  } finally {
    isLoading.value = false;
  }
});

const goToEnroll = (orgNumber: string) => {
  router.push({ name: 'EnrollCompany', params: { orgNumber } });
};

const viewCompanyDetails = (orgNumber: string) => {
  console.log('Navigate to view details for:', orgNumber);
  // Example navigation: router.push({ name: 'CompanyDetails', params: { orgNumber } });
};
</script>

<style scoped>
/* Additional component-specific styles can be added here if Tailwind isn't sufficient */
.container {
  max-width: 1200px; /* Example of a custom style */
}
</style>
