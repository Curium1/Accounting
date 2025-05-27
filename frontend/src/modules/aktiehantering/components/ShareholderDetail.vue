<template>
  <div>
    <h3 class="font-semibold">{{ shareholder.name }}</h3>
    <p>Shares: {{ shareholder.numberOfShares }} (Type: {{ shareholder.shareType }})</p>
  </div>
</template>

<script setup lang="ts">
import type { Shareholder } from '../store/aktiehanteringStore';

defineProps<{
  shareholder: Shareholder;
}>();
</script>
