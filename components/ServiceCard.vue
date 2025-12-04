<template>
  <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
    <div class="text-5xl mb-4">{{ icon }}</div>
    <h3 class="text-xl font-bold text-gray-900 mb-3">{{ title }}</h3>
    <p class="text-gray-600">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  icon: String
})
</script>

