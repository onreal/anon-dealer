<template>
  <div class="p2p-items-page">
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>Loading P2P Items...</p>
    </div>
    <P2PItems v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import P2PItems from '../components/P2PItems.vue';

const isLoading = ref(true);

onMounted(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading P2P Items page:', error);
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/pages/p2p/_p2p-items-page.scss';
</style>
