<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Shareholders</h1>
    <div v-if="store.isLoading">Loading shareholders...</div>
    <div v-if="store.error" class="text-red-500">{{ store.error }}</div>
    <div v-if="!store.isLoading && !store.error">
      <ul>
        <li v-for="shareholder in store.shareholders" :key="shareholder.id" class="mb-2 p-2 border rounded">
          <ShareholderDetail :shareholder="shareholder" />
        </li>
      </ul>
      <p class="mt-4">Total Shares: {{ store.totalShares }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAktiehanteringStore } from '../store/aktiehanteringStore';
import ShareholderDetail from '../components/ShareholderDetail.vue';

const store = useAktiehanteringStore();

onMounted(() => {
  if (store.shareholders.length === 0) { // Fetch only if not already populated
    store.fetchShareholders();
  }
});
</script>
