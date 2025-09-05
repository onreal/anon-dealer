import { ref, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  // Initialize dark mode from localStorage or system preference
  const initializeDarkMode = () => {
    const saved = localStorage.getItem('anon_dark_mode')
    if (saved !== null) {
      isDark.value = saved === 'true'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyDarkMode()
  }

  // Apply dark mode to document
  const applyDarkMode = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('anon_dark_mode', isDark.value.toString())
    applyDarkMode()
  }

  // Watch for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (localStorage.getItem('anon_dark_mode') === null) {
      isDark.value = e.matches
      applyDarkMode()
    }
  }

  // Initialize
  initializeDarkMode()
  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return {
    isDark,
    toggleDarkMode,
    initializeDarkMode
  }
}
