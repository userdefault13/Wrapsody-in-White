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
                Check-In Summary
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
              <p class="text-gray-600 dark:text-gray-400">Loading check-in details...</p>
            </div>

            <div v-else-if="booking" class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div class="space-y-6">
                <!-- Booking Information -->
                <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Booking Information
                  </h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Booking ID:</span>
                      <p class="text-gray-900 dark:text-white font-mono text-xs mt-0.5">{{ booking.id }}</p>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Customer:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.name || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'N/A' }}</p>
                    </div>
                    <div v-if="booking.email">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.email }}</p>
                    </div>
                    <div v-if="booking.phone">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Phone:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ booking.phone }}</p>
                    </div>
                    <div v-if="booking.date || booking.time">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Date & Time:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">
                        <span v-if="booking.date">{{ formatDate(booking.date) }}</span>
                        <span v-if="booking.date && booking.time"> </span>
                        <span v-if="booking.time">{{ formatTime(booking.time) }}</span>
                      </p>
                    </div>
                    <div v-if="booking.checkedInAt">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Checked In At:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(booking.checkedInAt) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Work Order Information -->
                <div v-if="workOrder" class="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Work Order Information
                  </h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Work Order ID:</span>
                      <p class="text-gray-900 dark:text-white font-mono text-xs mt-0.5">{{ workOrder.id }}</p>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Work Order Number:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ workOrder.workOrderNumber }}</p>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                      <span :class="getWorkOrderStatusClass(workOrder.status)" class="mt-0.5 inline-block">
                        {{ getWorkOrderStatusLabel(workOrder.status) }}
                      </span>
                    </div>
                    <div v-if="workOrder.assignedWorker">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Assigned Worker:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ getWorkerName(workOrder.assignedWorker) }}</p>
                    </div>
                    <div v-if="workOrder.startedAt">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Started At:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(workOrder.startedAt) }}</p>
                    </div>
                    <div v-if="workOrder.completedAt">
                      <span class="font-semibold text-gray-700 dark:text-gray-300">Completed At:</span>
                      <p class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(workOrder.completedAt) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Checked-In Items -->
                <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Checked-In Items ({{ checkedInItems.length }})
                  </h3>
                  <div v-if="checkedInItems.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    No items have been checked in yet.
                  </div>
                  <div v-else class="space-y-3">
                    <div
                      v-for="item in checkedInItems"
                      :key="item.id"
                      class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Item #{{ item.itemNumber }}
                            </span>
                            <span :class="getItemStatusClass(item.status)" class="text-xs">
                              {{ getItemStatusLabel(item.status) }}
                            </span>
                          </div>
                          <div class="text-sm text-gray-900 dark:text-white mb-1">
                            <span class="font-semibold">Description:</span> {{ item.description || 'N/A' }}
                          </div>
                          <div v-if="item.size" class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span class="font-semibold">Size:</span> {{ item.size.displayName || item.size.name || 'N/A' }}
                          </div>
                          <div v-if="item.wrappingStyle" class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span class="font-semibold">Wrapping Style:</span> {{ item.wrappingStyle }}
                          </div>
                          <div v-if="item.giftFrom || item.giftTo" class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span v-if="item.giftFrom" class="mr-4">
                              <span class="font-semibold">From:</span> {{ item.giftFrom }}
                            </span>
                            <span v-if="item.giftTo">
                              <span class="font-semibold">To:</span> {{ item.giftTo }}
                            </span>
                          </div>
                          <div v-if="item.specialInstructions" class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span class="font-semibold">Special Instructions:</span> {{ item.specialInstructions }}
                          </div>
                          <div v-if="item.checkedInAt" class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Checked in: {{ formatDateTime(item.checkedInAt) }}
                          </div>
                        </div>
                        <div v-if="item.assignedWorker" class="text-xs text-gray-500 dark:text-gray-500">
                          Worker: {{ getWorkerName(item.assignedWorker) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Info Message -->
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        This booking has already been checked in.
                      </p>
                      <p class="text-sm text-blue-800 dark:text-blue-300">
                        This is a read-only summary. To make changes, please use the terminal view.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="close"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
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
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const { executeQuery } = useGraphQL()
const loading = ref(false)
const workOrder = ref(null)
const checkedInItems = ref([])

const loadCheckInData = async () => {
  if (!props.booking) return

  try {
    loading.value = true

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
    
    if (data.workOrders && data.workOrders.length > 0) {
      // Get the first work order (or most recent)
      workOrder.value = data.workOrders[0]
      
      // Get all checked-in items (status != 'pending_checkin')
      checkedInItems.value = (workOrder.value.items || []).filter(
        item => item.status && item.status !== 'pending_checkin'
      )
    } else {
      workOrder.value = null
      checkedInItems.value = []
    }
  } catch (error) {
    console.error('Error loading check-in data:', error)
    workOrder.value = null
    checkedInItems.value = []
  } finally {
    loading.value = false
  }
}

watch([() => props.isOpen, () => props.booking], ([isOpen, booking]) => {
  if (isOpen && booking) {
    loadCheckInData()
  } else {
    workOrder.value = null
    checkedInItems.value = []
  }
}, { immediate: true })

const close = () => {
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  try {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch {
    return timeString
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateString
  }
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
    completed: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
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
  if (!workerId || !props.workers) return 'N/A'
  const worker = props.workers[workerId]
  return worker ? (worker.name || worker.walletAddress || workerId) : workerId
}
</script>

