<template>
  <!-- Mobile Burger Menu -->
  <div class="mobile-nav" v-if="isMobile">
    <!-- Burger Button -->
    <div class="burger-button" @click="toggleMenu" :class="{ active: isMenuOpen }">
      <span></span>
      <span></span>
      <span></span>
    </div>
    
    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" :class="{ active: isMenuOpen }" @click="closeMenu">
      <div class="mobile-menu" @click.stop>
        <div class="mobile-menu-header">
          <h3>Menu</h3>
          <button class="close-btn" @click="closeMenu">
            <ElIcon><Close /></ElIcon>
          </button>
        </div>
        
        <div class="mobile-menu-items">
          <div class="menu-item" @click="navigateTo('/')" :class="{ active: isActive('/') }">
            <ElIcon><House /></ElIcon>
            <span>Dashboard</span>
          </div>
          <div class="menu-item" @click="navigateTo('/inventory')" :class="{ active: isActive('/inventory') }">
            <ElIcon><Box /></ElIcon>
            <span>Inventory</span>
          </div>
          <div class="menu-item" @click="navigateTo('/items')" :class="{ active: isActive('/items') }">
            <ElIcon><List /></ElIcon>
            <span>Items</span>
          </div>
          <div class="menu-item" @click="navigateTo('/customers')" :class="{ active: isActive('/customers') }">
            <ElIcon><User /></ElIcon>
            <span>Customers</span>
          </div>
          <div class="menu-item" @click="navigateTo('/reports')" :class="{ active: isActive('/reports') }">
            <ElIcon><DataAnalysis /></ElIcon>
            <span>Reports</span>
          </div>
          
          <div class="menu-divider"></div>
          
          <div class="menu-item" @click="navigateTo('/p2p')" :class="{ active: isActive('/p2p') }">
            <ElIcon><Connection /></ElIcon>
            <span>P2P Network</span>
          </div>
          <div class="menu-item" @click="navigateTo('/p2p/items')" :class="{ active: isActive('/p2p/items') }">
            <ElIcon><Share /></ElIcon>
            <span>P2P Items</span>
          </div>
          <div class="menu-item" @click="navigateTo('/p2p/orders')" :class="{ active: isActive('/p2p/orders') }">
            <ElIcon><List /></ElIcon>
            <span>P2P Orders</span>
          </div>
          
          <div class="menu-divider"></div>
          
          <div class="menu-item logout" @click="logOut">
            <ElIcon><SwitchButton /></ElIcon>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Desktop Navigation -->
           <ElMenu
             v-else
             class="navigation-menu"
             mode="horizontal"
             style="position:relative; width: 100%; z-index: 1000;"
             :ellipsis="false"
         >
    <ElMenuItem index="1" @click="navigateTo('/')">Dashboard</ElMenuItem>
    <ElMenuItem index="2" @click="navigateTo('/inventory')">Inventory</ElMenuItem>
    <ElMenuItem index="3" @click="navigateTo('/items')">Items</ElMenuItem>
    <ElMenuItem index="4" @click="navigateTo('/customers')">Customers</ElMenuItem>
    <ElMenuItem index="5" @click="navigateTo('/reports')">Reports</ElMenuItem>
    <ElMenuItem index="6" @click="navigateTo('/p2p')">P2P Network</ElMenuItem>
    <ElMenuItem index="7" @click="navigateTo('/p2p/items')">P2P Items</ElMenuItem>
    <ElMenuItem index="8" @click="navigateTo('/p2p/orders')">P2P Orders</ElMenuItem>
    <ElMenuItem index="9" @click="logOut">Logout</ElMenuItem>
  </ElMenu>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance, ref, onMounted, onUnmounted } from 'vue'
import { Close, House, Box, List, User, DataAnalysis, SwitchButton, Connection, Share } from '@element-plus/icons-vue'

const router = useRouter();
const route = useRoute();
const internalInstance = getCurrentInstance();

// Mobile detection and menu state
const isMobile = ref(false);
const isMenuOpen = ref(false);

// Check if current route is active
const isActive = (path) => {
  return route.path === path;
};

// Toggle mobile menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Close mobile menu
const closeMenu = () => {
  isMenuOpen.value = false;
};

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Navigation function
const navigateTo = (path) => {
  router.push(path);
  closeMenu(); // Close mobile menu after navigation
};

// Logout function
const logOut = async () => {
  try {
    // Clear PIN from localStorage
    localStorage.removeItem('anon_pin');
    
    // Clear PIN from database
    let configuration = await internalInstance?.appContext.config.globalProperties.$command.Configuration.getOne();
    if (configuration) {
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
};

// Lifecycle hooks
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/components/nav/_navigation.scss';
</style>
