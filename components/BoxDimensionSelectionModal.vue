<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Confirm Box Size & Attempts
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select the box dimension used and number of attempts to accurately track wrapping paper usage
                </p>
              </div>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div v-if="loading" class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Loading box dimensions...</p>
              </div>

              <div v-else-if="error" class="text-center py-8">
                <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
                <button @click="loadBoxDimensions" class="btn-primary">Retry</button>
              </div>

              <div v-else-if="boxDimensions.length === 0" class="text-center py-8">
                <p class="text-gray-600 dark:text-gray-400 mb-4">No box dimensions found for this size.</p>
                <button @click="close" class="btn-secondary">Close</button>
              </div>

              <div v-else class="space-y-6">
                <!-- Item Info -->
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Item: {{ item?.description || `Item ${item?.itemNumber}` }}
                  </h3>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <span>Size: {{ getItemSizeDisplay(item) }}</span>
                  </div>
                </div>

                <!-- Box Dimensions Selection -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Select Box Dimension Used
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      v-for="dimension in boxDimensions"
                      :key="dimension.id"
                      @click="selectedBoxDimensionId = dimension.id"
                      :class="[
                        'p-4 rounded-lg border-2 transition-all text-left',
                        selectedBoxDimensionId === dimension.id
                          ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-700'
                      ]"
                    >
                      <div class="flex items-start justify-between mb-2">
                        <span class="font-semibold text-gray-900 dark:text-white">
                          {{ getDimensionLabel(dimension) }}
                        </span>
                        <svg
                          v-if="selectedBoxDimensionId === dimension.id"
                          class="w-5 h-5 text-primary-600 dark:text-primary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <span class="font-medium">Dimensions:</span>
                          <span class="ml-1">{{ dimension.length }} × {{ dimension.width }} × {{ dimension.height }} in</span>
                        </div>
                        <div>
                          <span class="font-medium">Paper Needed:</span>
                          <span class="ml-1">{{ dimension.wrappingPaperNeeded.toFixed(2) }} sq in</span>
                        </div>
                        <div v-if="dimension.surfaceArea">
                          <span class="font-medium">Surface Area:</span>
                          <span class="ml-1">{{ dimension.surfaceArea.toFixed(2) }} sq in</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Number of Attempts -->
                <div>
                  <label class="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Number of Attempts
                  </label>
                  <div class="flex items-center gap-4">
                    <button
                      @click="decreaseAttempts"
                      :disabled="attempts <= 1"
                      class="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      v-model.number="attempts"
                      type="number"
                      min="1"
                      class="w-20 text-center text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-600 dark:focus:border-primary-400"
                    />
                    <button
                      @click="increaseAttempts"
                      class="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Track how many times you wrapped this item to accurately calculate paper usage
                  </p>
                </div>

                <!-- Summary -->
                <div v-if="selectedBoxDimensionId" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Estimated Paper Usage</h4>
                  <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <div>
                      <span>Per attempt:</span>
                      <span class="font-medium ml-1">{{ getSelectedDimension()?.wrappingPaperNeeded.toFixed(2) || '0.00' }} sq in</span>
                    </div>
                    <div>
                      <span>Total ({{ attempts }} attempt{{ attempts !== 1 ? 's' : '' }}):</span>
                      <span class="font-bold text-lg ml-1">{{ getTotalPaperNeeded().toFixed(2) }} sq in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="close"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                @click="handleConfirm"
                :disabled="!selectedBoxDimensionId || attempts < 1 || saving"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg v-if="saving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Confirming...' : 'Confirm & Complete Wrapping' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'confirm'])

const { executeQuery } = useGraphQL()
const loading = ref(false)
const error = ref(null)
const boxDimensions = ref([])
const selectedBoxDimensionId = ref(null)
const attempts = ref(1)
const saving = ref(false)

const getItemSizeDisplay = (item) => {
  if (!item) return 'N/A'
  
  if (item.size && typeof item.size === 'object') {
    return item.size.displayName || item.size.name || 'N/A'
  }
  
  if (item.sizeId) {
    return `Size ID: ${item.sizeId}`
  }
  
  if (item.size && typeof item.size === 'string') {
    return item.size
  }
  
  return 'N/A'
}

const getDimensionLabel = (dimension) => {
  // Extract the number from the ID (e.g., "boxdim-xsmall-1" -> "xsmall-1")
  const match = dimension.id.match(/boxdim-(\w+)-(\d+)/)
  if (match) {
    const sizeName = match[1]
    const number = match[2]
    return `${sizeName}-${number}`
  }
  // Fallback to just the ID
  return dimension.id
}

const getSelectedDimension = () => {
  return boxDimensions.value.find(d => d.id === selectedBoxDimensionId.value)
}

const getTotalPaperNeeded = () => {
  const dimension = getSelectedDimension()
  if (!dimension) return 0
  return dimension.wrappingPaperNeeded * attempts.value
}

const increaseAttempts = () => {
  attempts.value++
}

const decreaseAttempts = () => {
  if (attempts.value > 1) {
    attempts.value--
  }
}

const loadBoxDimensions = async () => {
  if (!props.item?.sizeId) {
    error.value = 'Item does not have a size assigned'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const query = `
      query GetBoxDimensions($sizeId: ID!) {
        boxDimensions(sizeId: $sizeId, active: true) {
          id
          sizeId
          length
          width
          height
          surfaceArea
          wrappingPaperNeeded
          wasteFactor
        }
      }
    `
    
    const data = await executeQuery(query, { sizeId: props.item.sizeId })
    boxDimensions.value = data.boxDimensions || []
    
    if (boxDimensions.value.length === 0) {
      error.value = `No active box dimensions found for size: ${props.item.sizeId}`
    }
  } catch (err) {
    console.error('Error loading box dimensions:', err)
    error.value = err.message || 'Failed to load box dimensions'
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  if (!selectedBoxDimensionId.value || attempts.value < 1) return

  saving.value = true
  try {
    const dimension = getSelectedDimension()
    
    emit('confirm', {
      boxDimensionId: selectedBoxDimensionId.value,
      attempts: attempts.value,
      wrappingPaperNeeded: getTotalPaperNeeded(),
      dimension: dimension
    })
  } catch (err) {
    console.error('Error confirming:', err)
    alert('Failed to confirm. Please try again.')
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('close')
}

// Reset when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedBoxDimensionId.value = null
    attempts.value = 1
    error.value = null
    loadBoxDimensions()
  }
})

// Also watch for item changes
watch(() => props.item?.sizeId, () => {
  if (props.isOpen) {
    loadBoxDimensions()
  }
})
</script>

