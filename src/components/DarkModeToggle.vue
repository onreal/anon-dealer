<template>
  <div class="dark-mode-toggle" @click="toggleDarkMode">
    <el-icon>
      <Sunny v-if="isDark" />
      <Moon v-else />
    </el-icon>
  </div>
</template>

<script setup>
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useDarkMode } from '../composables/DarkMode'

const { isDark, toggleDarkMode } = useDarkMode()
</script>

<style scoped>
.dark-mode-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: #ffffff;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.dark-mode-toggle .el-icon {
  font-size: 20px;
  color: #1e293b;
  transition: all 0.3s ease;
}

.dark-mode-toggle:hover .el-icon {
  color: #3b82f6;
}

/* Dark mode styles */
.dark .dark-mode-toggle {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}

.dark .dark-mode-toggle:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  border-color: #60a5fa;
}

.dark .dark-mode-toggle .el-icon {
  color: #f8fafc;
}

.dark .dark-mode-toggle:hover .el-icon {
  color: #60a5fa;
}
</style>
