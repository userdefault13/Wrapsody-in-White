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
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ hasExistingProgress ? 'Resume Quality Check' : 'Quality Check' }}
                </h2>
                <p v-if="item" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Size: {{ item.size || 'N/A' }} | Worker: {{ workerName }}
                  <span v-if="completedStepsCount > 0">
                    ({{ completedStepsCount }} / {{ totalSteps }} steps completed)
                  </span>
                </p>
              </div>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Progress Bar -->
            <div v-if="item" class="px-6 pt-4">
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

            <!-- Content -->
            <div v-if="item" class="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <!-- Item Details -->
              <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Item</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ item.description || `Item ${item.itemNumber}` }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Size</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ item.size || 'N/A' }}</p>
                  </div>
                  <div v-if="item.wrappingStyle" class="col-span-2">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Style</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ item.wrappingStyle }}</p>
                  </div>
                </div>
              </div>

              <!-- Quality Check Checklist -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quality Check Checklist
                </h3>
                
                <div
                  v-for="(check, index) in qualityChecks"
                  :key="index"
                  class="p-4 rounded-lg border-2 transition-all"
                  :class="completedSteps[index] 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'"
                >
                  <div class="flex items-start gap-4">
                    <!-- Step Number -->
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                        :class="completedSteps[index]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
                      >
                        {{ index + 1 }}
                      </div>
                    </div>

                    <!-- Check Content -->
                    <div class="flex-1">
                      <h4
                        class="font-semibold mb-2"
                        :class="completedSteps[index]
                          ? 'text-green-800 dark:text-green-300'
                          : 'text-gray-900 dark:text-white'"
                      >
                        {{ check.title }}
                      </h4>
                      <p
                        class="text-sm mb-3"
                        :class="completedSteps[index]
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'"
                      >
                        {{ check.description }}
                      </p>
                      <ul v-if="check.details && check.details.length > 0" class="list-disc list-inside space-y-1">
                        <li
                          v-for="(detail, detailIndex) in check.details"
                          :key="detailIndex"
                          class="text-sm"
                          :class="completedSteps[index]
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'"
                        >
                          {{ detail }}
                        </li>
                      </ul>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex-shrink-0 flex items-center gap-2">
                      <button
                        v-if="!completedSteps[index]"
                        @click="completeStep(index)"
                        class="btn-primary flex items-center gap-2"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Complete
                      </button>
                      <button
                        v-else
                        @click="undoStep(index)"
                        class="btn-secondary flex items-center gap-2"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Undo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Save Progress Message -->
              <div v-if="completedStepsCount > 0 && completedStepsCount < totalSteps" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span v-if="completedStepsCount === totalSteps" class="text-green-600 dark:text-green-400 font-medium">
                    All checks completed! You can mark this item as ready.
                  </span>
                  <span v-else-if="completedStepsCount > 0" class="text-primary-600 dark:text-primary-400 font-medium">
                    Progress saved: {{ completedStepsCount }} / {{ totalSteps }} steps
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <button
                  @click="handleMoveBack"
                  :disabled="saving"
                  class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Move Back to Wrapping
                </button>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span v-if="completedStepsCount < totalSteps">
                    Complete all checks to finish quality control
                  </span>
                  <span v-else class="text-green-600 dark:text-green-400 font-medium">
                    All quality checks completed!
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="handleMarkComplete"
                  :disabled="completedStepsCount !== totalSteps || saving"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg v-if="completedStepsCount === totalSteps && !saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-if="saving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ saving ? 'Saving...' : 'Mark as Ready' }}
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

const emit = defineEmits(['close', 'complete', 'progress-saved', 'move-back'])

const { executeQuery } = useGraphQL()
const saving = ref(false)

// Quality check checklist items
const qualityChecks = computed(() => [
  {
    title: 'Check for Wrinkles or Loose Paper',
    description: 'Inspect the wrapping paper for any wrinkles, creases, or loose areas.',
    details: [
      'Ensure paper is smooth and taut',
      'Check all corners and edges',
      'Verify no air bubbles or gaps'
    ]
  },
  {
    title: 'Verify Tape is Secure and Hidden',
    description: 'Ensure all tape is properly applied and not visible.',
    details: [
      'Check tape is firmly attached',
      'Verify tape edges are not visible',
      'Ensure no tape residue on visible surfaces'
    ]
  },
  {
    title: 'Inspect Decorative Elements',
    description: 'Verify ribbons, bows, and tags are properly attached.',
    details: [
      'Check ribbon is securely tied',
      'Verify bow is properly attached',
      'Ensure gift tag is visible and readable'
    ]
  },
  {
    title: 'Check Overall Presentation',
    description: 'Review the final wrapped item for professional appearance.',
    details: [
      'Ensure clean and polished look',
      'Verify appropriate for gift size',
      'Check matches requested style'
    ]
  },
  {
    title: 'Final Quality Approval',
    description: 'Confirm the item meets all quality standards and is ready for pickup.',
    details: [
      'All previous checks passed',
      'Item is properly labeled',
      'Ready for customer pickup'
    ]
  }
])

// Track completed steps
const completedSteps = ref([])

// Initialize completed steps array when modal opens or item changes
const loadProgress = () => {
  if (!props.item) {
    completedSteps.value = []
    return
  }
  
  const numChecks = qualityChecks.value.length
  
  // Load existing progress from item, or initialize with all steps as incomplete
  if (props.item.qualityCheckProgress && Array.isArray(props.item.qualityCheckProgress)) {
    // Copy the progress array
    const progress = [...props.item.qualityCheckProgress]
    
    // Ensure the array matches the number of checks
    while (progress.length < numChecks) {
      progress.push(false)
    }
    
    // Take only the first numChecks elements
    completedSteps.value = progress.slice(0, numChecks)
  } else {
    // Initialize with all steps as incomplete
    completedSteps.value = new Array(numChecks).fill(false)
  }
}

// Watch for modal opening
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.item) {
    await nextTick()
    setTimeout(() => {
      loadProgress()
    }, 100)
  } else {
    completedSteps.value = []
  }
})

// Also watch for item changes
watch(() => [props.item?.id, props.item?.qualityCheckProgress], async () => {
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

const totalSteps = computed(() => qualityChecks.value.length)

const completedStepsCount = computed(() => {
  return completedSteps.value.filter(Boolean).length
})

const hasExistingProgress = computed(() => {
  if (!props.item) return false
  const progress = props.item.qualityCheckProgress
  return Array.isArray(progress) && progress.length > 0 && progress.some(Boolean)
})

const progressPercentage = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((completedStepsCount.value / totalSteps.value) * 100)
})

const completeStep = async (index) => {
  completedSteps.value[index] = true
  // Save to database immediately
  await saveProgressToDB()
}

const undoStep = async (index) => {
  completedSteps.value[index] = false
  // Save to database immediately
  await saveProgressToDB()
}

const saveProgressToDB = async () => {
  if (!props.item || saving.value) return

  saving.value = true
  try {
    console.log('💾 Saving quality check progress:', {
      itemId: props.item.id,
      progress: completedSteps.value,
      completedCount: completedSteps.value.filter(Boolean).length
    })
    
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          qualityCheckProgress
        }
      }
    `
    
    const result = await executeQuery(mutation, {
      input: {
        id: props.item.id,
        qualityCheckProgress: completedSteps.value
      }
    })

    console.log('✅ Quality check progress saved successfully:', result)
    emit('progress-saved')
  } catch (error) {
    console.error('❌ Error saving quality check progress:', error)
    alert('Failed to save progress. Please try again.')
  } finally {
    saving.value = false
  }
}


const handleMarkComplete = async () => {
  if (!props.item || saving.value || completedStepsCount.value !== totalSteps.value) return

  saving.value = true
  try {
    // Save progress and update status in a single mutation
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          qualityCheckProgress
          status
          qualityCheckedAt
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: props.item.id,
        qualityCheckProgress: completedSteps.value,
        status: 'ready'
      }
    })

    emit('complete')
    close()
  } catch (error) {
    console.error('Error marking item as ready:', error)
    alert('Failed to mark item as ready. Please try again.')
  } finally {
    saving.value = false
  }
}

const handleMoveBack = async () => {
  if (!props.item || saving.value) return

  const confirmed = confirm(
    'Are you sure you want to move this item back to wrapping? This will allow the worker to make corrections.'
  )

  if (!confirmed) return

  saving.value = true
  try {
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          qualityCheckProgress
          status
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: props.item.id,
        qualityCheckProgress: completedSteps.value,
        status: 'wrapping'
      }
    })

    emit('move-back')
    close()
  } catch (error) {
    console.error('Error moving item back:', error)
    alert('Failed to move item back to wrapping. Please try again.')
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

