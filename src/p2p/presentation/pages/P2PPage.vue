<template>
  <div class="p2p-page">
    <P2PErrorBoundary>
      <div v-if="isLoading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>Loading P2P System...</p>
      </div>
      <P2PDashboard v-else />
    </P2PErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import P2PDashboard from '../components/P2PDashboard.vue';
import P2PErrorBoundary from '../components/P2PErrorBoundary.vue';

const isLoading = ref(true);

onMounted(async () => {
  try {
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading P2P page:', error);
    isLoading.value = false;
  }
});
</script>

<style scoped>
.p2p-page {
  background: var(--el-bg-color-page);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 20px;
}

.loading-container .el-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.loading-container p {
  color: var(--el-text-color-regular);
  font-size: 16px;
}
</style>
