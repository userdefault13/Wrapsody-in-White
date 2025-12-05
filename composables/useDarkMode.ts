import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export const useDarkMode = () => {
  // Initialize dark mode from localStorage or system preference
  const initDarkMode = () => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('dark-mode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (stored !== null) {
      isDark.value = stored === 'true'
    } else {
      isDark.value = prefersDark
    }

    applyDarkMode(isDark.value)
  }

  // Apply dark mode to document
  const applyDarkMode = (dark: boolean) => {
    if (typeof window === 'undefined') return

    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('dark-mode', String(isDark.value))
    applyDarkMode(isDark.value)
  }

  // Set dark mode
  const setDarkMode = (dark: boolean) => {
    isDark.value = dark
    localStorage.setItem('dark-mode', String(dark))
    applyDarkMode(dark)
  }

  // Watch for system preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // Only update if user hasn't set a preference
      if (localStorage.getItem('dark-mode') === null) {
        isDark.value = e.matches
        applyDarkMode(e.matches)
      }
    })
  }

  // Initialize on mount
  if (typeof window !== 'undefined') {
    onMounted(() => {
      initDarkMode()
    })
    // Also initialize immediately if already mounted
    initDarkMode()
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode
  }
}

