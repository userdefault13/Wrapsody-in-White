<template>
  <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity group">
    <img 
      src="/logo.svg" 
      alt="Last Wrap Hero" 
      :class="[
        'transition-opacity duration-200',
        size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : 'h-10',
        'w-auto'
      ]"
      :style="darkMode ? { filter: 'brightness(1.2) contrast(0.9)' } : {}"
    />
    <span v-if="showText" class="text-xl font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
      Last Wrap Hero
    </span>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'
import { useDarkMode } from '~/composables/useDarkMode'

const props = defineProps({
  showText: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const { isDark } = useDarkMode()
const darkMode = computed(() => isDark.value)
</script>

