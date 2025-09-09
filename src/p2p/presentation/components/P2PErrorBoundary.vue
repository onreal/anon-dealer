<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <el-icon class="error-icon"><Warning /></el-icon>
      <h3>P2P System Error</h3>
      <p>Something went wrong with the P2P system. Please try refreshing the page.</p>
      <el-button type="primary" @click="retry">Retry</el-button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { Warning } from '@element-plus/icons-vue';

const hasError = ref(false);

onErrorCaptured((error, instance, info) => {
  console.error('P2P Error Boundary caught error:', error, info);
  hasError.value = true;
  return false; // Prevent error from propagating
});

const retry = () => {
  hasError.value = false;
  // Force component re-render
  window.location.reload();
};
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  color: var(--el-color-danger);
  margin-bottom: 20px;
}

.error-content h3 {
  margin: 0 0 15px 0;
  color: var(--el-text-color-primary);
}

.error-content p {
  margin: 0 0 20px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}
</style>
