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
    <ElMenuItem index="6" @click="logOut">Logout</ElMenuItem>
  </ElMenu>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance, ref, onMounted, onUnmounted } from 'vue'
import { Close, House, Box, List, User, DataAnalysis, SwitchButton } from '@element-plus/icons-vue'

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

<style scoped>
/* Desktop Navigation */
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

/* Mobile Navigation */
.mobile-nav {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1001;
}

/* Burger Button */
.burger-button {
  width: 50px;
  height: 50px;
  background: #ffffff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.burger-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
}

.burger-button span {
  width: 20px;
  height: 2px;
  background: #3b82f6;
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.burger-button.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-button.active span:nth-child(2) {
  opacity: 0;
}

.burger-button.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Mobile Menu */
.mobile-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: #ffffff;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.mobile-menu-overlay.active .mobile-menu {
  transform: translateX(0);
}

/* Mobile Menu Header */
.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.mobile-menu-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #e2e8f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #cbd5e1;
}

.close-btn .el-icon {
  color: #64748b;
  font-size: 16px;
}

/* Mobile Menu Items */
.mobile-menu-items {
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1e293b;
}

.menu-item:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.menu-item.active {
  background: #eff6ff;
  color: #3b82f6;
  border-right: 3px solid #3b82f6;
}

.menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu-item span {
  font-size: 16px;
  font-weight: 500;
}

.menu-item.logout {
  color: #dc2626;
}

.menu-item.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
}

/* Dark Mode Styles */
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

.dark .burger-button {
  background: #1e293b;
  border-color: #60a5fa;
}

.dark .burger-button span {
  background: #60a5fa;
}

.dark .mobile-menu {
  background: #1e293b;
}

.dark .mobile-menu-header {
  background: #0f172a;
  border-color: #334155;
}

.dark .mobile-menu-header h3 {
  color: #f8fafc;
}

.dark .close-btn {
  background: #334155;
}

.dark .close-btn:hover {
  background: #475569;
}

.dark .close-btn .el-icon {
  color: #cbd5e1;
}

.dark .menu-item {
  color: #f8fafc;
}

.dark .menu-item:hover {
  background: #334155;
  color: #60a5fa;
}

.dark .menu-item.active {
  background: #1e3a8a;
  color: #60a5fa;
  border-right-color: #60a5fa;
}

.dark .menu-item.logout {
  color: #f87171;
}

.dark .menu-item.logout:hover {
  background: #7f1d1d;
  color: #f87171;
}

.dark .menu-divider {
  background: #334155;
}
</style>
