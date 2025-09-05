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
  background-color: var(--bg-secondary) !important;
  border-top: 1px solid var(--border-primary) !important;
}

.navigation-menu .el-menu-item {
  color: var(--text-primary) !important;
  border-bottom: 2px solid transparent !important;
}

.navigation-menu .el-menu-item:hover {
  background-color: var(--bg-hover) !important;
  color: var(--border-focus) !important;
}

.navigation-menu .el-menu-item.is-active {
  background-color: var(--bg-hover) !important;
  color: var(--border-focus) !important;
  border-bottom-color: var(--border-focus) !important;
}
</style>
