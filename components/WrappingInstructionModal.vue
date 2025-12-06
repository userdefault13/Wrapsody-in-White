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
            class="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ hasExistingProgress ? 'Resume Wrapping' : 'Wrapping Instructions' }}
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Size: {{ item?.size || 'N/A' }} | Worker: {{ workerName }}
                  <span v-if="hasExistingProgress" class="ml-2 text-primary-600 dark:text-primary-400 font-medium">
                    ({{ completedStepsCount }} / {{ totalSteps }} steps completed)
                  </span>
                </p>
                <!-- Progress Bar -->
                <div class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress: {{ completedStepsCount }} / {{ totalSteps }}
                    </span>
                    <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {{ progressPercentage }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-500 ease-out rounded-full"
                      :style="{ width: `${progressPercentage}%` }"
                    ></div>
                  </div>
                </div>
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
            <div v-if="item" class="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div class="space-y-6">
                <!-- Item Info -->
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Item: {{ item.description || `Item ${item.itemNumber}` }}
                  </h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Size:</span>
                      <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ item.size || 'N/A' }}</span>
                    </div>
                    <div v-if="item.wrappingStyle">
                      <span class="text-gray-600 dark:text-gray-400">Style:</span>
                      <span class="ml-2 font-medium text-gray-900 dark:text-white">{{ item.wrappingStyle }}</span>
                    </div>
                  </div>
                  <div v-if="item.specialInstructions" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span class="text-gray-600 dark:text-gray-400">Special Instructions:</span>
                    <p class="mt-1 text-gray-900 dark:text-white">{{ item.specialInstructions }}</p>
                  </div>
                </div>

                <!-- Wrapping Instructions by Size -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Step-by-Step Instructions
                  </h3>
                  
                  <div class="space-y-4">
                    <div
                      v-for="(step, index) in instructions"
                      :key="index"
                      :class="[
                        'flex gap-4 p-4 rounded-lg transition-all duration-200',
                        completedSteps[index]
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      ]"
                    >
                      <div
                        :class="[
                          'flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center transition-all',
                          completedSteps[index]
                            ? 'bg-green-500 dark:bg-green-600 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        ]"
                      >
                        <svg
                          v-if="completedSteps[index]"
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span v-else>{{ index + 1 }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h4
                              :class="[
                                'font-semibold mb-1',
                                completedSteps[index]
                                  ? 'text-green-800 dark:text-green-200'
                                  : 'text-gray-900 dark:text-white'
                              ]"
                            >
                              {{ step.title }}
                            </h4>
                            <p
                              :class="[
                                'text-sm',
                                completedSteps[index]
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              ]"
                            >
                              {{ step.description }}
                            </p>
                            <ul
                              v-if="step.details"
                              :class="[
                                'mt-2 space-y-1 text-sm',
                                completedSteps[index]
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              ]"
                            >
                              <li v-for="(detail, i) in step.details" :key="i" class="flex items-start">
                                <span class="mr-2">•</span>
                                <span>{{ detail }}</span>
                              </li>
                            </ul>
                          </div>
                          <button
                            v-if="!completedSteps[index]"
                            @click="completeStep(index)"
                            class="ml-4 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium text-sm flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Complete
                          </button>
                          <button
                            v-else
                            @click="undoStep(index)"
                            class="ml-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium text-sm flex items-center gap-2"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tips Section -->
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 class="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                    💡 Pro Tips
                  </h4>
                  <ul class="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                    <li v-for="(tip, index) in tips" :key="index" class="flex items-start">
                      <span class="mr-2">•</span>
                      <span>{{ tip }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <span v-if="completedStepsCount === totalSteps" class="text-green-600 dark:text-green-400 font-medium">
                  ✓ All steps completed!
                </span>
                <span v-else-if="completedStepsCount > 0" class="text-primary-600 dark:text-primary-400 font-medium">
                  Progress saved: {{ completedStepsCount }} / {{ totalSteps }} steps
                </span>
                <span v-else>
                  Complete all steps to finish wrapping
                </span>
              </div>
              <div class="flex gap-4">
                <button
                  @click="handleSaveProgress"
                  :disabled="saving"
                  class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ saving ? 'Saving...' : 'Save Progress' }}
                </button>
                <button
                  @click="handleComplete"
                  :disabled="completedStepsCount !== totalSteps"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg v-if="completedStepsCount === totalSteps" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  workerName: {
    type: String,
    default: 'Worker'
  }
})

const emit = defineEmits(['close', 'complete', 'progress-saved'])

const { executeQuery } = useGraphQL()
const saving = ref(false)

// Track completed steps
const completedSteps = ref([])

const instructions = computed(() => {
  const size = props.item?.size?.toLowerCase() || ''
  
  // Base instructions for all sizes
  const baseInstructions = [
    {
      title: 'Prepare Your Workspace',
      description: 'Set up a clean, flat surface with all necessary materials.',
      details: [
        'Gather wrapping paper, scissors, tape, and ribbon/bow',
        'Ensure adequate lighting',
        'Have a measuring tool ready'
      ]
    },
    {
      title: 'Measure and Cut Paper',
      description: 'Measure the item and cut appropriate wrapping paper.',
      details: []
    },
    {
      title: 'Wrap the Item',
      description: 'Carefully wrap the item ensuring smooth edges and tight corners.',
      details: []
    },
    {
      title: 'Add Finishing Touches',
      description: 'Apply ribbon, bow, or other decorative elements.',
      details: []
    },
    {
      title: 'Quality Check',
      description: 'Inspect the wrapped item for any imperfections.',
      details: [
        'Check for wrinkles or loose paper',
        'Ensure tape is secure and hidden',
        'Verify decorative elements are properly attached'
      ]
    }
  ]

  // Size-specific modifications
  if (size.includes('xsmall') || size.includes('extra small')) {
    baseInstructions[1].details = [
      'Measure item dimensions',
      'Add 2-3 inches to each side for overlap',
      'Cut paper in one clean motion'
    ]
    baseInstructions[2].details = [
      'Place item in center of paper',
      'Fold sides first, then top and bottom',
      'Use minimal tape for clean look'
    ]
    baseInstructions[3].details = [
      'Use thin ribbon or twine',
      'Add small bow or gift tag',
      'Keep decorations minimal and elegant'
    ]
  } else if (size.includes('small')) {
    baseInstructions[1].details = [
      'Measure item dimensions',
      'Add 3-4 inches to each side for overlap',
      'Cut paper ensuring straight edges'
    ]
    baseInstructions[2].details = [
      'Center item on paper',
      'Fold and crease edges sharply',
      'Use double-sided tape for invisible seams'
    ]
    baseInstructions[3].details = [
      'Add medium-width ribbon',
      'Create a bow or use pre-made bow',
      'Consider adding a gift tag'
    ]
  } else if (size.includes('medium')) {
    baseInstructions[1].details = [
      'Measure all dimensions carefully',
      'Add 4-5 inches to each side',
      'Cut paper on a flat surface'
    ]
    baseInstructions[2].details = [
      'Position item in center',
      'Fold corners first for neat edges',
      'Use strong tape to secure folds'
    ]
    baseInstructions[3].details = [
      'Use wider ribbon (1-2 inches)',
      'Create a full bow or decorative knot',
      'Add coordinating gift tag'
    ]
  } else if (size.includes('large') || size.includes('odd')) {
    baseInstructions[1].details = [
      'Measure carefully, accounting for odd shapes',
      'Add 5-6 inches to each side',
      'May need multiple pieces of paper for large items'
    ]
    baseInstructions[2].details = [
      'Work methodically around the item',
      'Reinforce corners with extra tape',
      'Smooth out any air bubbles'
    ]
    baseInstructions[3].details = [
      'Use wide ribbon or multiple ribbons',
      'Create a substantial bow',
      'Add multiple decorative elements if needed'
    ]
  } else if (size.includes('extra large') || size.includes('fragile')) {
    baseInstructions[1].details = [
      'Measure all dimensions, especially for fragile items',
      'Add 6-8 inches to each side for secure wrapping',
      'May require heavy-duty or reinforced paper'
    ]
    baseInstructions[2].details = [
      'Wrap with extra care for fragile items',
      'Add padding if necessary',
      'Use strong tape and reinforce all seams'
    ]
    baseInstructions[3].details = [
      'Use wide, strong ribbon',
      'Create a large, secure bow',
      'Add "Fragile" label if needed'
    ]
  }

  return baseInstructions
})

const tips = computed(() => {
  const size = props.item?.size?.toLowerCase() || ''
  
  if (size.includes('fragile')) {
    return [
      'Handle with extreme care',
      'Add extra padding around fragile areas',
      'Use reinforced tape on all seams',
      'Consider double-wrapping for extra protection'
    ]
  } else if (size.includes('large') || size.includes('extra large')) {
    return [
      'Work on a large, flat surface',
      'Have an assistant if needed for large items',
      'Use heavy-duty tape for security',
      'Test the wrap before finalizing'
    ]
  } else {
    return [
      'Take your time for precision',
      'Keep edges crisp and clean',
      'Match ribbon color to wrapping paper',
      'Double-check all tape is secure'
    ]
  }
})

// Initialize completed steps array when modal opens or item changes
const loadProgress = () => {
  if (!props.item) {
    console.log('loadProgress: No item provided')
    completedSteps.value = []
    return
  }
  
  const numInstructions = instructions.value.length
  console.log('loadProgress: Item data:', {
    itemId: props.item.id,
    wrappingProgress: props.item.wrappingProgress,
    progressType: typeof props.item.wrappingProgress,
    isArray: Array.isArray(props.item.wrappingProgress),
    numInstructions
  })
  
  // Load existing progress from item, or initialize with all steps as incomplete
  if (props.item.wrappingProgress && Array.isArray(props.item.wrappingProgress)) {
    // Copy the progress array
    const progress = [...props.item.wrappingProgress]
    
    console.log('loadProgress: Original progress array from item:', progress)
    console.log('loadProgress: Progress array length:', progress.length)
    console.log('loadProgress: Number of instructions:', numInstructions)
    
    // Ensure the array matches the number of instructions
    while (progress.length < numInstructions) {
      progress.push(false)
    }
    
    // Take only the first numInstructions elements
    completedSteps.value = progress.slice(0, numInstructions)
    
    console.log('loadProgress: Final completedSteps array:', completedSteps.value)
    console.log('loadProgress: Step states:', completedSteps.value.map((val, idx) => `Step ${idx + 1}: ${val ? 'COMPLETE' : 'INCOMPLETE'}`))
    console.log('loadProgress: Completed count:', completedSteps.value.filter(Boolean).length, 'out of', numInstructions)
  } else {
    // Initialize with all steps as incomplete
    completedSteps.value = new Array(numInstructions).fill(false)
    console.log('loadProgress: No wrappingProgress array found on item, initializing with', numInstructions, 'incomplete steps')
    console.log('loadProgress: Item keys:', Object.keys(props.item))
  }
}

// Watch for modal opening
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.item) {
    // Wait for next tick to ensure instructions are computed
    await nextTick()
    // Wait a bit more to ensure all reactive values are settled
    setTimeout(() => {
      loadProgress()
    }, 100)
  } else {
    // Reset when modal closes
    completedSteps.value = []
  }
})

// Also watch for item changes (in case item is updated while modal is open)
watch(() => [props.item?.id, props.item?.wrappingProgress], async () => {
  if (props.isOpen && props.item) {
    await nextTick()
    setTimeout(() => {
      loadProgress()
    }, 100)
  }
}, { deep: true })

// Also load progress on mount if modal is already open
onMounted(() => {
  if (props.isOpen && props.item) {
    nextTick(() => {
      setTimeout(() => {
        loadProgress()
      }, 100)
    })
  }
})

const totalSteps = computed(() => instructions.value.length)

const completedStepsCount = computed(() => {
  return completedSteps.value.filter(Boolean).length
})

const hasExistingProgress = computed(() => {
  if (!props.item) return false
  // Check if wrappingProgress exists and has at least one completed step
  const progress = props.item.wrappingProgress
  return Array.isArray(progress) && progress.length > 0 && progress.some(Boolean)
})

const progressPercentage = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((completedStepsCount.value / totalSteps.value) * 100)
})

const completeStep = (index) => {
  completedSteps.value[index] = true
}

const undoStep = (index) => {
  completedSteps.value[index] = false
}

const handleSaveProgress = async () => {
  if (!props.item || saving.value) return

  saving.value = true
  try {
    const mutation = `
      mutation UpdateBookingItem($input: UpdateBookingItemInput!) {
        updateBookingItem(input: $input) {
          id
          wrappingProgress
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: props.item.id,
        wrappingProgress: completedSteps.value
      }
    })

    emit('progress-saved', {
      item: props.item,
      progress: completedSteps.value
    })
  } catch (error) {
    console.error('Error saving progress:', error)
    alert('Failed to save progress. Please try again.')
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('close')
}

const handleComplete = () => {
  emit('complete', props.item)
}
</script>

