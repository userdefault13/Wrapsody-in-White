<template>
  <button
    type="button"
    :class="[
      'p-4 rounded-lg border-2 transition-all text-left dark:bg-gray-800',
      selected
        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 bg-white dark:bg-gray-800'
    ]"
    @click="$emit('select')"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ service.name }}</h3>
        <!-- Debug: Show serviceCategory value if it exists -->
        <span 
          v-if="service && service.serviceCategory && service.serviceCategory !== '' && service.serviceCategory !== null" 
          :class="[
            'px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap',
            getServiceTagClass(service.serviceCategory)
          ]"
        >
          {{ getServiceTagLabel(service.serviceCategory) }}
        </span>
        <!-- Temporary debug: Show if serviceCategory is missing -->
        <span 
          v-else-if="service && (!service.serviceCategory || service.serviceCategory === '')" 
          class="px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap bg-gray-400 text-white"
          title="No serviceCategory set"
        >
          No Tag
        </span>
      </div>
      <div v-if="selected" class="w-5 h-5 bg-primary-600 dark:bg-primary-400 rounded-full flex items-center justify-center">
        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{{ service.description }}</p>
    <p class="text-lg font-bold text-primary-600 dark:text-primary-400">
      ${{ service.price }}{{ service.priceType === 'per-hour' ? '/hr' : '' }}
    </p>
  </button>
</template>

<script setup>
import { watch, onMounted } from 'vue'

const props = defineProps({
  service: Object,
  selected: Boolean
})

defineEmits(['select'])

// Debug: log service data on mount and when service changes
onMounted(() => {
  if (props.service) {
    console.log('ServiceOption mounted - service:', props.service.name, 'serviceCategory:', props.service?.serviceCategory, 'full service:', props.service)
  }
})

watch(() => props.service, (newService) => {
  if (newService) {
    console.log('ServiceOption service changed - service:', newService.name, 'serviceCategory:', newService?.serviceCategory)
  }
}, { immediate: true })

const getServiceTagLabel = (category) => {
  const labels = {
    'dropoff': 'Drop-Off',
    'delivery': 'Delivery',
    'onsite': 'On-Site'
  }
  return labels[category] || category
}

const getServiceTagClass = (category) => {
  const classes = {
    'dropoff': 'bg-blue-500 text-white dark:bg-blue-600',
    'delivery': 'bg-green-500 text-white dark:bg-green-600',
    'onsite': 'bg-purple-500 text-white dark:bg-purple-600'
  }
  return classes[category] || 'bg-gray-500 text-white dark:bg-gray-600'
}
</script>

