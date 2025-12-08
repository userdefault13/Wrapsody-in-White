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
            class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Item Details
                </h2>
                <span v-if="item?.id" class="text-sm text-primary-600 dark:text-primary-400 font-mono">
                  {{ item.id }}
                </span>
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

            <!-- Content -->
            <div v-if="item" class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p class="text-gray-900 dark:text-white">{{ (itemData || item).description || 'N/A' }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Size
                  </label>
                  <div v-if="!editingSize" class="flex items-center gap-2">
                    <p class="text-gray-900 dark:text-white">
                      {{ getItemSizeDisplay(itemData || item) }}
                    </p>
                    <button
                      @click="editingSize = true"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      title="Edit Size"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <select
                      v-model="selectedSizeId"
                      class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Select Size</option>
                      <option
                        v-for="size in sizes"
                        :key="size.id"
                        :value="size.id"
                      >
                        {{ size.displayName }}
                      </option>
                    </select>
                    <button
                      @click="handleSaveSize"
                      :disabled="savingSize"
                      class="px-3 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span v-if="!savingSize">Save</span>
                      <span v-else class="flex items-center gap-1">
                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    </button>
                    <button
                      @click="handleCancelSizeEdit"
                      :disabled="savingSize"
                      class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div v-if="(itemData || item).wrappingStyle">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Wrapping Style
                  </label>
                  <p class="text-gray-900 dark:text-white">{{ (itemData || item).wrappingStyle }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span :class="getStatusClass((itemData || item).status)">
                    {{ getStatusLabel((itemData || item).status) }}
                  </span>
                </div>

                <div v-if="(itemData || item).assignedWorker">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Worker
                  </label>
                  <p class="text-gray-900 dark:text-white">
                    {{ getWorkerName((itemData || item).assignedWorker) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                v-if="canStartWrapping"
                @click="handleStartWrapping"
                :disabled="startingWrap"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!startingWrap" class="flex items-center gap-2">
                  <svg v-if="hasExistingProgress" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ hasExistingProgress ? 'Resume Progress' : 'Start Wrapping' }}
                </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ hasExistingProgress ? 'Resuming...' : 'Starting...' }}
                </span>
              </button>
              <button
                v-if="canStartQualityCheck"
                @click="handleStartQualityCheck"
                class="btn-primary"
              >
                <span class="flex items-center gap-2">
                  <svg v-if="hasQualityCheckProgress" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ hasQualityCheckProgress ? 'Resume Quality Check' : 'Start Quality Check' }}
                </span>
              </button>
              <button
                v-if="canMoveBackToQualityCheck"
                @click="handleMoveBackToQualityCheck"
                :disabled="movingBack"
                class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!movingBack" class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Move Back to Quality Check
                </span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Moving...
                </span>
              </button>
              <button @click="close" class="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
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
  booking: {
    type: Object,
    default: null
  },
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'updated', 'start-wrapping', 'start-quality-check', 'move-back-to-quality-check'])

const { walletAddress } = useAuth()
const { executeQuery } = useGraphQL()
const startingWrap = ref(false)
const movingBack = ref(false)
const currentWorker = ref(null)
const copied = ref(false)
const editingSize = ref(false)
const selectedSizeId = ref(null)
const sizes = ref([])
const savingSize = ref(false)
const itemData = ref(null)

const currentItem = computed(() => itemData.value || props.item)

const canStartWrapping = computed(() => {
  if (!currentItem.value) return false
  // Can start wrapping if status is checked_in or wrapping (to restart)
  return currentItem.value.status === 'checked_in' || currentItem.value.status === 'wrapping'
})

const canStartQualityCheck = computed(() => {
  if (!currentItem.value) return false
  // Can start quality check if status is quality_check or wrapping (if wrapping is done)
  return currentItem.value.status === 'quality_check' || currentItem.value.status === 'wrapping'
})

const canMoveBackToQualityCheck = computed(() => {
  if (!currentItem.value) return false
  // Can move back to quality check if status is ready
  return currentItem.value.status === 'ready'
})

const hasExistingProgress = computed(() => {
  if (!props.item) return false
  // Check if wrappingProgress exists and has at least one completed step
  const progress = props.item.wrappingProgress
  return Array.isArray(progress) && progress.length > 0 && progress.some(Boolean)
})

const totalSteps = computed(() => {
  // All sizes have 5 steps (Prepare, Measure, Wrap, Finishing, Quality Check)
  return 5
})

const completedStepsCount = computed(() => {
  if (!props.item || !props.item.wrappingProgress) return 0
  const progress = props.item.wrappingProgress
  if (!Array.isArray(progress)) return 0
  return progress.filter(Boolean).length
})

const progressPercentage = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((completedStepsCount.value / totalSteps.value) * 100)
})

const hasQualityCheckProgress = computed(() => {
  if (!props.item) return false
  // Check if qualityCheckProgress exists and has at least one completed step
  const progress = props.item.qualityCheckProgress
  return Array.isArray(progress) && progress.length > 0 && progress.some(Boolean)
})

const qualityCheckTotalSteps = computed(() => {
  // Quality check has 5 steps
  return 5
})

const qualityCheckCompletedCount = computed(() => {
  if (!props.item || !props.item.qualityCheckProgress) return 0
  const progress = props.item.qualityCheckProgress
  if (!Array.isArray(progress)) return 0
  return progress.filter(Boolean).length
})

const qualityCheckProgressPercentage = computed(() => {
  if (qualityCheckTotalSteps.value === 0) return 0
  return Math.round((qualityCheckCompletedCount.value / qualityCheckTotalSteps.value) * 100)
})

const getStatusLabel = (status) => {
  const labels = {
    pending_checkin: 'Pending Check-In',
    checked_in: 'Checked In',
    wrapping: 'Wrapping',
    quality_check: 'Quality Check',
    ready: 'Ready',
    picked_up: 'Picked Up'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending_checkin: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    checked_in: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    wrapping: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    quality_check: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    ready: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    picked_up: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
  }
  return classes[status] || classes.pending_checkin
}

const getBookingStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivered: 'Delivered'
  }
  return labels[status] || status
}

const getBookingStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    confirmed: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    in_progress: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    ready: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    picked_up: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    delivered: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
  }
  return classes[status] || classes.pending
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch (error) {
    return dateString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  try {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch (error) {
    return timeString
  }
}

const copyBookingId = async () => {
  if (!props.booking || !props.booking.id) return
  
  try {
    await navigator.clipboard.writeText(props.booking.id)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy booking ID:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.booking.id
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('Fallback copy failed:', err)
      alert('Failed to copy booking ID. Please copy manually: ' + props.booking.id)
    }
    document.body.removeChild(textArea)
  }
}

const loadWorker = async () => {
  if (!walletAddress.value) {
    console.error('No wallet address available')
    return null
  }
  
  try {
    // Normalize wallet address to lowercase for consistent lookup
    const normalizedAddress = walletAddress.value.toLowerCase()
    
    const query = `
      query GetWorker($walletAddress: String!) {
        worker(walletAddress: $walletAddress, id: null) {
          id
          walletAddress
          name
          workerType
        }
      }
    `
    console.log('Loading worker for wallet address:', normalizedAddress)
    const data = await executeQuery(query, {
      walletAddress: normalizedAddress
    })
    console.log('Worker loaded:', data.worker)
    return data.worker
  } catch (error) {
    console.error('Error loading worker:', error)
    // If worker doesn't exist, we could create one automatically
    // For now, just return null and show error
    return null
  }
}

const handleStartWrapping = async () => {
  if (!currentItem.value || startingWrap.value) return

  startingWrap.value = true
  
  try {
    // Load worker if not already loaded
    if (!currentWorker.value) {
      currentWorker.value = await loadWorker()
    }

    // If worker doesn't exist, try to create it automatically
    if (!currentWorker.value && walletAddress.value) {
      console.log('Worker not found, attempting to create worker for:', walletAddress.value)
      try {
        const createMutation = `
          mutation CreateWorker($input: CreateWorkerInput!) {
            createWorker(input: $input) {
              id
              walletAddress
              name
              workerType
            }
          }
        `
        const createData = await executeQuery(createMutation, {
          input: {
            walletAddress: walletAddress.value,
            name: null,
            email: null,
            phone: null
          }
        })
        currentWorker.value = createData.createWorker
        console.log('Worker created successfully:', currentWorker.value)
      } catch (createError) {
        console.error('Error creating worker:', createError)
        alert(`Unable to identify or create worker. Please ensure you are connected with a valid wallet address.\n\nError: ${createError.message || 'Unknown error'}`)
        startingWrap.value = false
        return
      }
    }

    if (!currentWorker.value) {
      alert('Unable to identify worker. Please ensure you are connected with a valid wallet address.')
      startingWrap.value = false
      return
    }

    // Confirm with user
    const sizeDisplay = currentItem.value.size?.displayName || currentItem.value.size?.name || currentItem.value.size || 'N/A'
    const confirmed = confirm(
      `Confirm that ${currentWorker.value.name || currentWorker.value.walletAddress} will wrap this item?\n\n` +
      `Item: ${currentItem.value.description || `Item ${currentItem.value.itemNumber}`}\n` +
      `Size: ${sizeDisplay}`
    )

    if (!confirmed) {
      startingWrap.value = false
      return
    }

    // Update item status to wrapping (this will set wrappingStartedAt automatically)
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          status
          assignedWorker
          wrappingStartedAt
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: currentItem.value.id,
        status: 'wrapping',
        assignedWorker: currentWorker.value.id
      }
    })

    // Emit event to open instruction modal
    emit('start-wrapping', {
      item: currentItem.value,
      worker: currentWorker.value
    })

    // Emit updated event to refresh data
    emit('updated')
  } catch (error) {
    console.error('Error starting wrap:', error)
    alert('Failed to start wrapping. Please try again.')
  } finally {
    startingWrap.value = false
  }
}

const handleStartQualityCheck = () => {
  if (!currentItem.value) return
  emit('start-quality-check', {
    item: currentItem.value
  })
}

const handleMoveBackToQualityCheck = async () => {
  if (!currentItem.value || movingBack.value) return

  const confirmed = confirm(
    'Are you sure you want to move this item back to quality check? This will allow quality control to review the item again.'
  )

  if (!confirmed) return

  movingBack.value = true
  try {
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          status
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: currentItem.value.id,
        status: 'quality_check'
      }
    })

    emit('move-back-to-quality-check')
    emit('updated')
    close()
  } catch (error) {
    console.error('Error moving item back to quality check:', error)
    alert('Failed to move item back to quality check. Please try again.')
  } finally {
    movingBack.value = false
  }
}

const loadSizes = async () => {
  try {
    const query = `
      query {
        sizes(active: true) {
          id
          name
          displayName
          order
        }
      }
    `
    const data = await executeQuery(query)
    sizes.value = (data.sizes || []).sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error loading sizes:', error)
    sizes.value = []
  }
}

const handleSaveSize = async () => {
  if (!currentItem.value || !selectedSizeId.value || savingSize.value) return
  
  savingSize.value = true
  try {
    const mutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          sizeId
          size {
            id
            name
            displayName
          }
        }
      }
    `
    
    await executeQuery(mutation, {
      input: {
        id: currentItem.value.id,
        sizeId: selectedSizeId.value || null
      }
    })
    
    // Reload item data to get updated size
    await loadItemData()
    editingSize.value = false
    emit('updated')
  } catch (error) {
    console.error('Error updating size:', error)
    alert('Failed to update size. Please try again.')
  } finally {
    savingSize.value = false
  }
}

const handleCancelSizeEdit = () => {
  editingSize.value = false
  selectedSizeId.value = currentItem.value?.sizeId || null
}

const getItemSizeDisplay = (item) => {
  if (!item) return 'N/A'
  
  // Check if size object exists (from GraphQL resolver)
  if (item.size) {
    return item.size.displayName || item.size.name || 'N/A'
  }
  
  // If sizeId exists but size object wasn't loaded, show sizeId
  if (item.sizeId) {
    return `Size ID: ${item.sizeId}`
  }
  
  // Fallback to any size string that might exist
  if (item.size && typeof item.size === 'string') {
    return item.size
  }
  
  return 'N/A'
}

const getWorkerName = (workerId) => {
  if (!workerId) return 'N/A'
  
  // Check if workers prop is provided (as a map)
  if (props.workers && typeof props.workers === 'object') {
    const worker = props.workers[workerId]
    if (worker) {
      return worker.name || worker.walletAddress || workerId
    }
  }
  
  // Fallback to showing the worker ID
  return workerId
}

const loadItemData = async () => {
  if (!props.item?.id) return
  
  // If the item already has sizeId from workOrder (which it should), use it directly
  // The workOrder items already have proper sizeId set from the database
  if (props.item.sizeId) {
    // Try to load size object if not already loaded
    if (!props.item.size && props.item.sizeId) {
      try {
        const sizeQuery = `
          query GetSize($id: ID!) {
            size(id: $id) {
              id
              name
              displayName
            }
          }
        `
        const sizeData = await executeQuery(sizeQuery, { id: props.item.sizeId })
        if (sizeData.size) {
          itemData.value = { ...props.item, size: sizeData.size }
          selectedSizeId.value = props.item.sizeId
          return
        }
      } catch (error) {
        console.warn('Could not load size object, will use sizeId:', error)
      }
    }
    
    // Use the item data as-is if it has sizeId (even without size object)
    itemData.value = props.item
    selectedSizeId.value = props.item.sizeId
    return
  }
  
  // Otherwise, fetch fresh item data with size relationship
  try {
    const query = `
      query GetWorkItem($id: ID!) {
        workItem(id: $id) {
          id
          itemNumber
          description
          sizeId
          size {
            id
            name
            displayName
          }
          photos
          serialNumber
          serialNumberPhoto
          specialInstructions
          wrappingStyle
          status
          assignedWorker
          checkedInAt
          wrappingStartedAt
          wrappingCompletedAt
          wrappingProgress
          qualityCheckProgress
          qualityCheckedAt
          readyAt
        }
      }
    `
    const data = await executeQuery(query, { id: props.item.id })
    if (data.workItem) {
      itemData.value = data.workItem
      selectedSizeId.value = data.workItem.sizeId || null
    } else {
      itemData.value = props.item
    }
  } catch (error) {
    console.error('Error loading item data:', error)
    itemData.value = props.item
  }
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    editingSize.value = false
    await loadItemData()
    await loadSizes()
  }
})

watch(() => props.item, (item) => {
  if (item) {
    selectedSizeId.value = item?.sizeId || null
    // Load fresh data when item changes
    if (props.isOpen) {
      loadItemData()
    }
  }
}, { immediate: true })

const close = () => {
  editingSize.value = false
  emit('close')
}
</script>

