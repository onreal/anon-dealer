<template>
  <ElContainer>
    <ElHeader>
          <img
              src="/logo.svg"
              alt="Anon Dealer Logo"
              width="200"
              height="60"
              class="logo"
          >
    </ElHeader>
    <ElMain>
      <router-view />
    </ElMain>
    <ElFooter>
      <Navigation/>
    </ElFooter>

    <!-- Dark Mode Toggle -->
    <DarkModeToggle />
  </ElContainer>
</template>


<script setup lang="ts">
import { onMounted } from 'vue';
import Navigation from "./components/Nav/Navigation.vue";
import DarkModeToggle from "./components/DarkModeToggle.vue";
import { useDarkMode } from "./composables/DarkMode";

// Initialize dark mode
const { initializeDarkMode } = useDarkMode();
initializeDarkMode();
</script>

<style>
.el-container {
  background-color: #ffffff;
  color: #1e293b;
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.el-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.el-main {
  background-color: #ffffff;
  padding: 20px;
  transition: background-color 0.3s ease;
}

.el-footer {
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 10px 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.logo {
  /* No filter needed - logo is designed to work in light mode */
  transition: filter 0.3s ease;
}

/* Dark mode styles */
.dark .el-container {
  background-color: #0f172a;
  color: #f8fafc;
}

.dark .el-header {
  background-color: #1e293b;
  border-bottom-color: #334155;
}

.dark .el-main {
  background-color: #0f172a;
}

.dark .el-footer {
  background-color: #1e293b;
  border-top-color: #334155;
  color: #cbd5e1;
}

.dark .logo {
  /* Invert colors for dark mode */
  filter: invert(1) hue-rotate(180deg);
}
</style>
