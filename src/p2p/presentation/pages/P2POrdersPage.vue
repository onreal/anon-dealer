<template>
  <div class="p2p-orders-page">
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>Loading P2P Orders...</p>
    </div>
    <P2POrders v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import P2POrders from '../components/P2POrders.vue';

const isLoading = ref(true);

onMounted(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading P2P Orders page:', error);
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/pages/p2p/_p2p-orders-page.scss';
</style>
