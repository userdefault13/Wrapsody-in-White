<template>
  <div
    class="item-card group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 shadow-sm hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
    @click="$emit('view-details', item)"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h4 class="font-semibold text-gray-900 dark:text-white text-sm transition-colors duration-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {{ item.description || `Item ${item.itemNumber}` }}
          </h4>
          <!-- Wrapping Progress Shield (Yellow - In Progress color) -->
          <div
            v-if="isWrapping100Percent"
            class="flex items-center justify-center w-5 h-5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
            title="Wrapping 100% Complete"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <!-- QA Progress Shield (Purple - QA color) -->
          <div
            v-if="isQA100Percent"
            class="flex items-center justify-center w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
            title="Quality Check 100% Complete"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <p v-if="booking" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {{ booking.name }}
        </p>
      </div>
      <span
        v-if="item.size"
        class="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
      >
        {{ item.size }}
      </span>
    </div>

    <div v-if="item.specialInstructions" class="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
      {{ item.specialInstructions }}
    </div>

    <div class="flex items-center justify-between mt-2">
      <div class="flex gap-1 flex-wrap">
        <span
          v-if="hasWorkerStarted"
          class="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ workerName || 'In Progress' }}
        </span>
        <span
          v-if="item.isLargerThanPaidSize"
          class="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
        >
          Larger
        </span>
        <span
          v-if="item.isSmallerThanPaidSize"
          class="px-2 py-0.5 text-xs font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
        >
          Smaller
        </span>
        <span
          v-if="item.isExpensiveElectronics"
          class="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
        >
          Electronics
        </span>
      </div>
      <button
        @click.stop="handleStatusUpdate"
        class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200 hover:underline"
      >
        Update
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  booking: {
    type: Object,
    default: null
  },
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update-status', 'view-details'])

const hasWorkerStarted = computed(() => {
  // Show badge if worker is assigned, wrapping has started, or progress exists
  return !!(props.item.assignedWorker || props.item.wrappingStartedAt || (props.item.wrappingProgress && props.item.wrappingProgress.some(Boolean)))
})

const isWrapping100Percent = computed(() => {
  if (!props.item.wrappingProgress || !Array.isArray(props.item.wrappingProgress)) {
    return false
  }
  const totalSteps = props.item.wrappingProgress.length
  if (totalSteps === 0) return false
  const completedSteps = props.item.wrappingProgress.filter(Boolean).length
  return completedSteps === totalSteps
})

const isQA100Percent = computed(() => {
  if (!props.item.qualityCheckProgress || !Array.isArray(props.item.qualityCheckProgress)) {
    return false
  }
  const totalSteps = props.item.qualityCheckProgress.length
  if (totalSteps === 0) return false
  const completedSteps = props.item.qualityCheckProgress.filter(Boolean).length
  return completedSteps === totalSteps
})

const workerName = computed(() => {
  if (!props.item.assignedWorker) return null
  const worker = props.workers[props.item.assignedWorker]
  if (!worker) return null
  return worker.name || worker.walletAddress?.substring(0, 6) + '...' || 'Worker'
})

const handleStatusUpdate = () => {
  emit('update-status', props.item.id, props.item.status)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

