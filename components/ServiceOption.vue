<template>
  <button
    type="button"
    :class="[
      'p-4 rounded-lg border-2 transition-all text-left',
      selected
        ? 'border-primary-600 bg-primary-50'
        : 'border-gray-200 hover:border-primary-300 bg-white'
    ]"
    @click="$emit('select')"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
      <div v-if="selected" class="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
    <p class="text-sm text-gray-600 mb-2">{{ service.description }}</p>
    <p class="text-lg font-bold text-primary-600">
      ${{ service.price }}{{ service.id === 'unlimited' ? '/hr' : '' }}
    </p>
  </button>
</template>

<script setup>
defineProps({
  service: Object,
  selected: Boolean
})

defineEmits(['select'])
</script>

