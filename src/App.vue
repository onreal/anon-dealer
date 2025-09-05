<template>
  <ElContainer>
    <ElHeader>
          <img
              src="https://pro.formkit.com/logo.svg"
              alt="FormKit Logo"
              width="244"
              height="50"
              class="logo"
          >
    </ElHeader>
    <ElMain>
      <router-view />
    </ElMain>
    <ElFooter>
      Extend as you want this open source project
      <Navigation/>
    </ElFooter>
    
    <!-- Dark Mode Toggle -->
    <DarkModeToggle />
  </ElContainer>
</template>


<script setup lang="ts">
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
  margin-bottom: 60px; /* Space for fixed navigation */
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
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
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
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%);
}
</style>
