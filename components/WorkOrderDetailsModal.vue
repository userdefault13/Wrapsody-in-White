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
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Work Order Details
              </h2>
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
            <div v-if="loading" class="p-6 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">Loading work order...</p>
            </div>

            <div v-else-if="booking" class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div class="space-y-6">
                <!-- Order Information Summary -->
                <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="flex items-center justify-between mb-3">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Order Information
                    </label>
                    <button
                      @click="copyBookingId"
                      class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                      title="Copy Booking ID"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span v-if="!copied">Copy ID</span>
                      <span v-else class="text-green-600 dark:text-green-400">Copied!</span>
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Booking ID:</span>
                      <p class="text-gray-900 dark:text-white font-mono text-xs mt-0.5">{{ booking.id || 'N/A' }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Customer:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.name || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'N/A' }}</p>
                    </div>
                    <div v-if="booking.email">
                      <span class="text-gray-500 dark:text-gray-400">Email:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.email }}</p>
                    </div>
                    <div v-if="booking.phone">
                      <span class="text-gray-500 dark:text-gray-400">Phone:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.phone }}</p>
                    </div>
                    <div v-if="booking.date || booking.time">
                      <span class="text-gray-500 dark:text-gray-400">Date & Time:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">
                        <span v-if="booking.date">{{ formatDate(booking.date) }}</span>
                        <span v-if="booking.date && booking.time"> </span>
                        <span v-if="booking.time">{{ formatTime(booking.time) }}</span>
                        <span v-if="!booking.date && !booking.time">N/A</span>
                      </p>
                    </div>
                    <div v-if="booking.numberOfGifts">
                      <span class="text-gray-500 dark:text-gray-400">Total Items:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.numberOfGifts }}</p>
                    </div>
                    <div v-if="booking.status">
                      <span class="text-gray-500 dark:text-gray-400">Order Status:</span>
                      <span :class="getBookingStatusClass(booking.status)" class="mt-0.5 inline-block">
                        {{ getBookingStatusLabel(booking.status) }}
                      </span>
                    </div>
                    <div v-if="booking.service">
                      <span class="text-gray-500 dark:text-gray-400">Service:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.service }}</p>
                    </div>
                  </div>
                </div>

                <!-- Work Order Information -->
                <div v-if="workOrder" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Work Order Information
                  </h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Work Order ID:</span>
                      <p class="text-gray-900 dark:text-white font-mono text-xs mt-0.5">{{ workOrder.id || 'N/A' }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Work Order Number:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ workOrder.workOrderNumber || 'N/A' }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Status:</span>
                      <span :class="getWorkOrderStatusClass(workOrder.status)" class="mt-0.5 inline-block">
                        {{ getWorkOrderStatusLabel(workOrder.status) }}
                      </span>
                    </div>
                    <div v-if="workOrder.assignedWorker">
                      <span class="text-gray-500 dark:text-gray-400">Assigned Worker:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ getWorkerName(workOrder.assignedWorker) }}</p>
                    </div>
                    <div v-if="workOrder.priority !== null && workOrder.priority !== undefined">
                      <span class="text-gray-500 dark:text-gray-400">Priority:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ workOrder.priority }}</p>
                    </div>
                    <div v-if="workOrder.startedAt">
                      <span class="text-gray-500 dark:text-gray-400">Started At:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(workOrder.startedAt) }}</p>
                    </div>
                    <div v-if="workOrder.completedAt">
                      <span class="text-gray-500 dark:text-gray-400">Completed At:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(workOrder.completedAt) }}</p>
                    </div>
                    <div v-if="workOrder.createdAt">
                      <span class="text-gray-500 dark:text-gray-400">Created At:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(workOrder.createdAt) }}</p>
                    </div>
                  </div>
                  <div v-if="workOrder.notes" class="mt-4">
                    <span class="text-gray-500 dark:text-gray-400">Notes:</span>
                    <p class="text-gray-900 dark:text-white mt-0.5">{{ workOrder.notes }}</p>
                  </div>
                </div>

                <!-- Items Accounting -->
                <div class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Items ({{ displayItems.length }})
                    </h3>
                  </div>
                  
                  <div v-if="displayItems.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No items found.</p>
                    <p v-if="!workOrder" class="text-xs mt-2">Items will appear after check-in.</p>
                  </div>
                  
                  <div v-else class="space-y-3">
                    <div
                      v-for="item in displayItems"
                      :key="item.id"
                      class="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors cursor-pointer"
                      @click="handleItemClick(item)"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">
                              Item #{{ item.itemNumber }}
                            </span>
                            <span :class="getItemStatusClass(item.status)">
                              {{ getItemStatusLabel(item.status) }}
                            </span>
                          </div>
                          <div class="text-sm text-gray-900 dark:text-white mb-1">
                            <span class="font-medium">Description:</span>
                            <span class="ml-2">{{ item.description || 'N/A' }}</span>
                          </div>
                          <div class="grid grid-cols-2 gap-4 text-sm mt-2">
                            <div>
                              <span class="text-gray-500 dark:text-gray-400">Size:</span>
                              <span class="ml-2 text-gray-900 dark:text-white">
                                {{ getItemSizeDisplay(item) }}
                              </span>
                            </div>
                            <div v-if="item.assignedWorker">
                              <span class="text-gray-500 dark:text-gray-400">Assigned To:</span>
                              <span class="ml-2 text-gray-900 dark:text-white">
                                {{ getWorkerName(item.assignedWorker) }}
                              </span>
                            </div>
                          </div>
                          <div v-if="item.specialInstructions" class="mt-2 text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Special Instructions:</span>
                            <p class="text-gray-900 dark:text-white mt-0.5">{{ item.specialInstructions }}</p>
                          </div>
                          <div v-if="item.wrappingStyle" class="mt-2 text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Wrapping Style:</span>
                            <p class="text-gray-900 dark:text-white mt-0.5">{{ item.wrappingStyle }}</p>
                          </div>
                          <div v-if="item.giftFrom || item.giftTo" class="mt-2 text-sm grid grid-cols-2 gap-4">
                            <div v-if="item.giftFrom">
                              <span class="text-gray-500 dark:text-gray-400">From:</span>
                              <p class="text-gray-900 dark:text-white mt-0.5">{{ item.giftFrom }}</p>
                            </div>
                            <div v-if="item.giftTo">
                              <span class="text-gray-500 dark:text-gray-400">To:</span>
                              <p class="text-gray-900 dark:text-white mt-0.5">{{ item.giftTo }}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          @click.stop="handleItemClick(item)"
                          class="ml-4 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="p-6 text-center">
              <p class="text-gray-600 dark:text-gray-400">Booking information not available.</p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
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
import { ref, computed, watch } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  },
  workOrderId: {
    type: String,
    default: null
  },
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'view-item'])

const { executeQuery } = useGraphQL()
const loading = ref(false)
const workOrder = ref(null)
const copied = ref(false)

const displayItems = computed(() => {
  // Prioritize work order items, fallback to booking items
  if (workOrder.value?.items && workOrder.value.items.length > 0) {
    return workOrder.value.items
  }
  if (props.booking?.items && props.booking.items.length > 0) {
    return props.booking.items
  }
  return []
})

const loadWorkOrder = async () => {
  if (!props.booking && !props.workOrderId) return
  
  try {
    loading.value = true
    
    // If we have a workOrderId, fetch directly
    if (props.workOrderId) {
      const query = `
        query GetWorkOrder($id: ID!) {
          workOrder(id: $id) {
            id
            bookingId
            workOrderNumber
            status
            assignedWorker
            priority
            notes
            startedAt
            completedAt
            createdAt
            updatedAt
            items {
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
              giftFrom
              giftTo
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
        }
      `
      const data = await executeQuery(query, { id: props.workOrderId })
      workOrder.value = data.workOrder
    } else if (props.booking) {
      // Fetch work orders for this booking
      const query = `
        query GetWorkOrders($bookingId: ID!) {
          workOrders(bookingId: $bookingId) {
            id
            bookingId
            workOrderNumber
            status
            assignedWorker
            priority
            notes
            startedAt
            completedAt
            createdAt
            updatedAt
            items {
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
              giftFrom
              giftTo
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
        }
      `
      const data = await executeQuery(query, { bookingId: props.booking.id })
      // Use the first work order (or could show all)
      if (data.workOrders && data.workOrders.length > 0) {
        workOrder.value = data.workOrders[0]
      }
    }
  } catch (error) {
    console.error('Error loading work order:', error)
    workOrder.value = null
  } finally {
    loading.value = false
  }
}

watch([() => props.isOpen, () => props.booking, () => props.workOrderId], async ([isOpen, booking, workOrderId]) => {
  if (isOpen && (booking || workOrderId)) {
    await loadWorkOrder()
  } else {
    workOrder.value = null
  }
}, { immediate: true })

const close = () => {
  emit('close')
}

const handleItemClick = (item) => {
  emit('view-item', item)
}

const getWorkOrderStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    quality_check: 'Quality Check',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getWorkOrderStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    assigned: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    in_progress: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    quality_check: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    ready: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    completed: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return classes[status] || classes.pending
}

const getItemStatusLabel = (status) => {
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

const getItemStatusClass = (status) => {
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

const getWorkerName = (workerId) => {
  if (!workerId || !props.workers) return workerId || 'N/A'
  const worker = props.workers[workerId]
  return worker?.name || worker?.walletAddress || workerId
}

const getItemSizeDisplay = (item) => {
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
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch (error) {
    return timeString
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
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

const getBookingStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
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
    delivered: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return classes[status] || classes.pending
}
</script>

<style scoped>
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors;
}
</style>

