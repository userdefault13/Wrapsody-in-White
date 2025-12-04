<template>
  <div :class="[
    'rounded-lg p-6 shadow-lg',
    colorClasses[color] || colorClasses.blue
  ]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium opacity-80 mb-1">{{ title }}</p>
        <p class="text-3xl font-bold">{{ value }}</p>
      </div>
      <div class="text-4xl opacity-50">
        {{ icon }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  value: Number,
  icon: String,
  color: {
    type: String,
    default: 'blue'
  }
})

const colorClasses = {
  blue: 'bg-blue-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white'
}
</script>

