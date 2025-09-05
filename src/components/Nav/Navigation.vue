<template>
  <ElMenu
      class="navigation-menu"
      mode="horizontal"
      style="position:fixed; left: 0; bottom: 0; width: 100%; z-index: 1000;"
      :ellipsis="false"
  >
    <ElMenuItem index="1" @click="navigateTo('/')">Dashboard</ElMenuItem>
    <ElMenuItem index="2" @click="navigateTo('/inventory')">Inventory</ElMenuItem>
    <ElMenuItem index="3" @click="navigateTo('/items')">Items</ElMenuItem>
    <ElMenuItem index="4" @click="navigateTo('/customers')">Customers</ElMenuItem>
    <ElMenuItem index="5" @click="navigateTo('/reports')">Reports</ElMenuItem>
    <ElMenuItem index="6" @click="logOut">Logout</ElMenuItem>
  </ElMenu>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance } from 'vue'

const router = useRouter();
const internalInstance = getCurrentInstance();

const navigateTo = (path) => {
  router.push(path);
};

const logOut = async () => {
  try {
    // Clear PIN from localStorage
    localStorage.removeItem('anon_pin');
    console.log('PIN removed from localStorage');
    
    // Clear PIN from database
    let configuration = await internalInstance?.appContext.config.globalProperties.$command.Configuration.getOne();
    if (configuration) {
      console.log('Clearing PIN from database');
      await internalInstance?.appContext.config.globalProperties.$command.Configuration
          .updatePin(configuration.ConfigurationId, '');
    }
    
    // Redirect to login page
    router.push('/login');
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect to login even if there's an error
    router.push('/login');
  }
}
</script>

<style scoped>
.navigation-menu {
  background-color: #f8fafc !important;
  border-top: 1px solid #e2e8f0 !important;
}

.navigation-menu .el-menu-item {
  color: #1e293b !important;
  border-bottom: 2px solid transparent !important;
}

.navigation-menu .el-menu-item:hover {
  background-color: #f1f5f9 !important;
  color: #3b82f6 !important;
}

.navigation-menu .el-menu-item.is-active {
  background-color: #f1f5f9 !important;
  color: #3b82f6 !important;
  border-bottom-color: #3b82f6 !important;
}

/* Dark mode styles */
.dark .navigation-menu {
  background-color: #1e293b !important;
  border-top-color: #334155 !important;
}

.dark .navigation-menu .el-menu-item {
  color: #f8fafc !important;
}

.dark .navigation-menu .el-menu-item:hover {
  background-color: #334155 !important;
  color: #60a5fa !important;
}

.dark .navigation-menu .el-menu-item.is-active {
  background-color: #334155 !important;
  color: #60a5fa !important;
  border-bottom-color: #60a5fa !important;
}
</style>
