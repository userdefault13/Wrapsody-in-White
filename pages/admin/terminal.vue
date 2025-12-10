<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Check-In Terminal</h1>
            <p class="text-gray-600 dark:text-gray-400">Manage item check-in and wrapping progress</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-2">
            <DarkModeToggle />
            <button
              @click="handleLogout"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Logout
              </span>
            </button>
            <NuxtLink to="/admin" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Dashboard
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search Booking
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Booking ID, name, email, or phone"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              @input="handleSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Filter by Stage
            </label>
            <select
              v-model="selectedStage"
              @change="loadBookings"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Stages</option>
              <option value="awaiting_checkin">Awaiting Check-In</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">In Progress</option>
              <option value="quality_check">Quality Check</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="showCheckInModal = true"
              class="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Check-In
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">Awaiting Check-In</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.awaitingCheckIn }}
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.inProgress }}
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">Quality Check</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.qualityCheck }}
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">Ready</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ stats.ready }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading bookings...</p>
      </div>

      <!-- Workflow Kanban -->
      <div v-else-if="bookings.length > 0 || filteredBookings.length > 0">
        <WorkflowKanban
          :bookings="displayBookings"
          :items="[]"
          :workers="workersMap"
          @status-updated="handleStatusUpdate"
          @view-details="handleViewDetails"
          @group-click="handleGroupClick"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p class="text-gray-600 dark:text-gray-400">No bookings found. Start by checking in a new booking.</p>
      </div>
    </div>

    <!-- Check-In Modal -->
    <CheckInModal
      :is-open="showCheckInModal"
      :booking="selectedBooking"
      @close="closeCheckInModal"
      @checked-in="handleCheckedIn"
      @payment-adjustment="handlePaymentAdjustment"
      @show-summary="handleShowCheckInSummary"
    />

    <CheckInSummaryModal
      :is-open="showCheckInSummaryModal"
      :booking="selectedBookingForSummary"
      :workers="workersMap"
      @close="closeCheckInSummaryModal"
    />

    <!-- Payment Adjustment Modal -->
    <PaymentAdjustmentModal
      v-if="paymentAdjustment"
      :is-open="showPaymentAdjustmentModal"
      :adjustment="paymentAdjustment"
      @close="closePaymentAdjustment"
      @payment-complete="handlePaymentAdjustmentComplete"
    />

    <!-- Item Details Modal -->
    <ItemDetailModal
      v-if="selectedItem"
      :is-open="showItemDetail"
      :item="selectedItem"
      :booking="getBookingForItem(selectedItem)"
      :workers="workersMap"
      @close="closeItemDetail"
      @updated="handleItemUpdated"
      @start-wrapping="handleStartWrapping"
      @start-quality-check="handleStartQualityCheck"
      @move-back-to-quality-check="handleMoveBackToQualityCheck"
    />

    <!-- Wrapping Instruction Modal -->
    <WrappingInstructionModal
      v-if="wrappingItem"
      :is-open="showWrappingInstruction"
      :item="wrappingItem"
      :worker-name="wrappingWorker?.name || wrappingWorker?.walletAddress || 'Worker'"
      @close="closeWrappingInstruction"
      @complete="handleWrappingComplete"
      @progress-saved="handleProgressSaved"
    />

    <!-- Quality Check Modal -->
    <QualityCheckModal
      v-if="qualityCheckItem"
      :is-open="showQualityCheck"
      :item="qualityCheckItem"
      :worker-name="currentWorker?.name || currentWorker?.walletAddress || 'Worker'"
      @close="closeQualityCheck"
      @complete="handleQualityCheckComplete"
      @progress-saved="handleQualityCheckProgressSaved"
      @move-back="handleQualityCheckMoveBack"
    />

    <!-- Work Order Details Modal -->
    <WorkOrderDetailsModal
      v-if="selectedWorkOrderBooking"
      :is-open="showWorkOrderDetails"
      :booking="selectedWorkOrderBooking"
      :workers="workersMap"
      @close="closeWorkOrderDetails"
      @view-item="handleWorkOrderViewItem"
    />

    <!-- Next Item Modal -->
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
          v-if="nextItemModal.show"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="handleDeclineNextItem"
        >
          <div class="flex min-h-screen items-center justify-center p-4">
            <div
              class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
              @click.stop
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Next Item Available
                </h2>
                <button
                  @click="handleDeclineNextItem"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Content -->
              <div class="p-6">
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  You've completed wrapping one item, but there's another item waiting to be wrapped for this order.
                </p>
                
                <div v-if="nextItemModal.item" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    {{ nextItemModal.item.description || `Item ${nextItemModal.item.itemNumber}` }}
                  </h3>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <p v-if="nextItemModal.item.sizeId">Size: Size ID: {{ nextItemModal.item.sizeId }}</p>
                    <p v-if="nextItemModal.item.wrappingStyle">Style: {{ nextItemModal.item.wrappingStyle }}</p>
                    <p>Status: {{ nextItemModal.item.status === 'checked_in' ? 'Checked In (Unassigned)' : 'In Progress' }}</p>
                  </div>
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Would you like to be assigned to this item and start wrapping it?
                </p>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  @click="handleDeclineNextItem"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  No, Thanks
                </button>
                <button
                  @click="handleAcceptNextItem"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Yes, Start Wrapping
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'
import WorkflowKanban from '~/components/WorkflowKanban.vue'
import CheckInModal from '~/components/CheckInModal.vue'
import CheckInSummaryModal from '~/components/CheckInSummaryModal.vue'
import ItemDetailModal from '~/components/ItemDetailModal.vue'
import PaymentAdjustmentModal from '~/components/PaymentAdjustmentModal.vue'
import WrappingInstructionModal from '~/components/WrappingInstructionModal.vue'
import QualityCheckModal from '~/components/QualityCheckModal.vue'
import WorkOrderDetailsModal from '~/components/WorkOrderDetailsModal.vue'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { disconnect, walletAddress } = useAuth()
const router = useRouter()
const { executeQuery } = useGraphQL()

const loading = ref(true)
const bookings = ref([])
const searchQuery = ref('')
const selectedStage = ref('')
const showCheckInModal = ref(false)
const selectedBooking = ref(null)
const showCheckInSummaryModal = ref(false)
const selectedBookingForSummary = ref(null)
const showItemDetail = ref(false)
const selectedItem = ref(null)
const showPaymentAdjustmentModal = ref(false)
const paymentAdjustment = ref(null)
const showWrappingInstruction = ref(false)
const wrappingItem = ref(null)
const wrappingWorker = ref(null)

const showQualityCheck = ref(false)
const qualityCheckItem = ref(null)
const currentWorker = ref(null)
const workers = ref([])
const workersMap = computed(() => {
  const map = {}
  workers.value.forEach(worker => {
    map[worker.id] = worker
  })
  return map
})
const showWorkOrderDetails = ref(false)
const selectedWorkOrderBooking = ref(null)

const filteredBookings = computed(() => {
  if (!searchQuery.value) return bookings.value
  
  const query = searchQuery.value.toLowerCase()
  return bookings.value.filter(booking => 
    booking.id.toLowerCase().includes(query) ||
    booking.name.toLowerCase().includes(query) ||
    booking.email.toLowerCase().includes(query) ||
    booking.phone.includes(query)
  )
})

const displayBookings = computed(() => {
  let result = filteredBookings.value
  
  if (selectedStage.value) {
    result = result.filter(booking => booking.currentStage === selectedStage.value)
  }
  
  return result
})

const stats = computed(() => {
  const allItems = []
  bookings.value.forEach(booking => {
    if (booking.items && Array.isArray(booking.items)) {
      allItems.push(...booking.items)
    }
  })
  
  return {
    awaitingCheckIn: bookings.value.filter(b => b.currentStage === 'awaiting_checkin').length,
    inProgress: allItems.filter(i => i.status === 'wrapping').length,
    qualityCheck: allItems.filter(i => i.status === 'quality_check').length,
    ready: allItems.filter(i => i.status === 'ready').length
  }
})

const loadWorkers = async () => {
  try {
    const query = `
      query {
        workers {
          id
          walletAddress
          name
          workerType
        }
      }
    `
    const data = await executeQuery(query)
    workers.value = data.workers || []
  } catch (error) {
    console.error('Error loading workers:', error)
    workers.value = []
  }
}

const loadBookings = async () => {
  try {
    loading.value = true
    const query = `
      query TerminalBookings($stage: WorkflowStage) {
        terminalBookings(stage: $stage) {
          id
          firstName
          lastName
          name
          email
          phone
          service
          date
          time
          numberOfGifts
          status
          currentStage
          checkedInAt
          workOrders {
            id
            workOrderNumber
            status
            items {
              id
              workOrderId
              bookingId
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
              isExpensiveElectronics
              checkedInAt
              wrappingStartedAt
              wrappingCompletedAt
              wrappingProgress
              qualityCheckProgress
              qualityCheckedAt
              readyAt
              boxDimensionId
              wrappingPaperSelection
            }
          }
        }
      }
    `
    
    const data = await executeQuery(query, {
      stage: selectedStage.value || null
    })
    
    console.log('Loaded bookings:', data.terminalBookings?.length || 0)
    console.log('Bookings data:', data.terminalBookings)
    
    // Flatten workOrders.items into booking.items for compatibility
    const bookingsWithItems = (data.terminalBookings || []).map(booking => ({
      ...booking,
      items: booking.workOrders?.flatMap(wo => wo.items || []) || []
    }))
    
    bookings.value = bookingsWithItems
  } catch (error) {
    console.error('Error loading bookings:', error)
    bookings.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleStatusUpdate = async (itemId, newStatus) => {
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
        id: itemId,
        status: newStatus
      }
    })
    
    // Reload bookings
    await loadBookings()
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Failed to update item status')
  }
}

const handleViewDetails = (item) => {
  // Find the booking that contains this item
  let booking = null
  if (item.bookingId) {
    booking = bookings.value.find(b => b.id === item.bookingId)
  } else {
    // If item doesn't have bookingId, search through all bookings to find it
    for (const b of bookings.value) {
      if (b.items && b.items.some(i => i.id === item.id)) {
        booking = b
        break
      }
    }
  }
  
  if (booking && booking.items) {
    // Find the item in the booking's items array (which has the latest data from DB)
    const latestItem = booking.items.find(i => i.id === item.id)
    if (latestItem) {
      // Merge to ensure we have all fields, prioritizing the latest from DB
      // Ensure bookingId is set so getBookingForItem can find it
      selectedItem.value = { ...item, ...latestItem, bookingId: booking.id }
    } else {
      selectedItem.value = { ...item, bookingId: booking.id }
    }
  } else {
    // If we found a booking but item wasn't in items array, still set bookingId
    if (booking) {
      selectedItem.value = { ...item, bookingId: booking.id }
    } else {
      selectedItem.value = item
    }
  }
  showItemDetail.value = true
}

const getBookingForItem = (item) => {
  if (!item || !item.bookingId) {
    console.log('getBookingForItem: item or bookingId missing', item)
    return null
  }
  const booking = bookings.value.find(booking => booking.id === item.bookingId)
  console.log('getBookingForItem:', { itemId: item.id, bookingId: item.bookingId, booking, allBookings: bookings.value.length })
  return booking
}

const closeCheckInModal = () => {
  showCheckInModal.value = false
  selectedBooking.value = null
}

const handleShowCheckInSummary = (booking) => {
  selectedBookingForSummary.value = booking
  showCheckInSummaryModal.value = true
  // Close the check-in modal
  closeCheckInModal()
}

const closeCheckInSummaryModal = () => {
  showCheckInSummaryModal.value = false
  selectedBookingForSummary.value = null
}

const handleCheckedIn = async () => {
  // Refresh bookings to show newly checked-in items
  await loadBookings()
  closeCheckInModal()
  // Force a refresh after a short delay to ensure data is loaded
  setTimeout(() => {
    loadBookings()
  }, 500)
}

const handlePaymentAdjustment = (data) => {
  console.log('Payment adjustment event received:', data)
  console.log('Adjustment amount:', data?.adjustment?.amount)
  paymentAdjustment.value = data
  showPaymentAdjustmentModal.value = true
  console.log('Payment adjustment modal should be open:', showPaymentAdjustmentModal.value)
}

const closePaymentAdjustment = () => {
  showPaymentAdjustmentModal.value = false
  paymentAdjustment.value = null
}

const handlePaymentAdjustmentComplete = () => {
  closePaymentAdjustment()
  closeCheckInModal()
  handleCheckedIn()
}

const closeItemDetail = () => {
  showItemDetail.value = false
  selectedItem.value = null
}

const handleItemUpdated = () => {
  loadBookings()
  closeItemDetail()
}

const handleStartWrapping = (data) => {
  // Find the latest item data from bookings to ensure we have the most recent wrappingProgress
  const booking = bookings.value.find(b => b.id === data.item.bookingId)
  if (booking && booking.items) {
    // Find the item in the booking's items array (which has the latest data from DB)
    const latestItem = booking.items.find(i => i.id === data.item.id)
    if (latestItem) {
      // Merge to ensure we have all fields, prioritizing the latest from DB
      wrappingItem.value = { ...data.item, ...latestItem }
      console.log('handleStartWrapping: Using latest item from bookings array')
      console.log('handleStartWrapping: Item wrappingProgress:', latestItem.wrappingProgress)
      console.log('handleStartWrapping: Item has wrappingProgress:', 'wrappingProgress' in latestItem)
      console.log('handleStartWrapping: Full latest item:', latestItem)
    } else {
      console.log('handleStartWrapping: Item not found in booking items, using passed item')
      wrappingItem.value = data.item
    }
  } else {
    console.log('handleStartWrapping: Booking not found, using passed item')
    wrappingItem.value = data.item
  }
  
  console.log('handleStartWrapping: Final wrappingItem value:', wrappingItem.value)
  console.log('handleStartWrapping: Final wrappingProgress:', wrappingItem.value?.wrappingProgress)
  console.log('handleStartWrapping: boxDimensionId:', wrappingItem.value?.boxDimensionId)
  console.log('handleStartWrapping: wrappingPaperSelection:', wrappingItem.value?.wrappingPaperSelection)
  
  wrappingWorker.value = data.worker
  showWrappingInstruction.value = true
  // Keep item detail modal open or close it - let's close it to focus on instructions
  closeItemDetail()
}

const closeWrappingInstruction = () => {
  showWrappingInstruction.value = false
  wrappingItem.value = null
  wrappingWorker.value = null
}

const handleProgressSaved = () => {
  // Refresh bookings to show updated progress
  loadBookings()
}

const nextItemModal = ref({
  show: false,
  item: null,
  booking: null
})

const handleWrappingComplete = async (data) => {
  try {
    const item = data.item || data
    const bookingId = data.bookingId || item.bookingId

    // Refresh bookings to get latest data
    await loadBookings()

    // Find the booking and all its items
    const booking = bookings.value.find(b => b.id === bookingId)
    if (!booking || !booking.items) {
      console.error('Booking not found or has no items')
      closeWrappingInstruction()
      return
    }

    // Get all checked-in items (exclude pending_checkin)
    const allCheckedInItems = booking.items.filter((i) => i.status !== 'pending_checkin')
    
    // Check if ALL items have 100% wrapping progress
    const allItemsHave100PercentWrapping = allCheckedInItems.every((i) => {
      if (!i.wrappingProgress || !Array.isArray(i.wrappingProgress)) return false
      const totalSteps = i.wrappingProgress.length
      if (totalSteps === 0) return false
      const completedSteps = i.wrappingProgress.filter(Boolean).length
      return completedSteps === totalSteps
    })

    // If not all items are 100% complete, check for items waiting to be assigned/wrapped
    if (!allItemsHave100PercentWrapping) {
      // Find items that are checked_in (not yet assigned/wrapped)
      const unassignedItems = allCheckedInItems.filter((i) => {
        return i.status === 'checked_in' && !i.assignedWorker
      })

      // Also find items that are wrapping but not 100% complete
      const incompleteWrappingItems = allCheckedInItems.filter((i) => {
        if (i.status !== 'wrapping') return false
        if (!i.wrappingProgress || !Array.isArray(i.wrappingProgress)) return true
        const totalSteps = i.wrappingProgress.length
        if (totalSteps === 0) return true
        const completedSteps = i.wrappingProgress.filter(Boolean).length
        return completedSteps < totalSteps
      })

      // Find the next item to wrap (prioritize unassigned items)
      const nextItem = unassignedItems[0] || incompleteWrappingItems.find((i) => i.id !== item.id) || incompleteWrappingItems[0]
      
      if (nextItem && nextItem.id !== item.id) {
        // Show modal asking if worker wants to take the next item
        nextItemModal.value = {
          show: true,
          item: nextItem,
          booking: booking
        }
        closeWrappingInstruction()
        return
      }
    }

    // All items are 100% complete - NOW we can move ALL items to QA
    // Find all items that have 100% wrapping progress but are not yet in QA
    const itemsToMoveToQA = allCheckedInItems.filter((i) => {
      // Item must have 100% wrapping progress
      if (!i.wrappingProgress || !Array.isArray(i.wrappingProgress)) return false
      const totalSteps = i.wrappingProgress.length
      if (totalSteps === 0) return false
      const completedSteps = i.wrappingProgress.filter(Boolean).length
      const is100Percent = completedSteps === totalSteps
      
      // Item must not already be in QA or ready
      const notInQA = i.status !== 'quality_check' && i.status !== 'ready' && i.status !== 'picked_up'
      
      return is100Percent && notInQA
    })
    
    if (itemsToMoveToQA.length > 0) {
      try {
        const updateMutation = `
          mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
            updateWorkItem(input: $input) {
              id
              status
              wrappingCompletedAt
            }
          }
        `
        
        // Move all items with 100% progress to QA
        const updatePromises = itemsToMoveToQA.map((itemToUpdate) => {
          return executeQuery(updateMutation, {
            input: {
              id: itemToUpdate.id,
              status: 'quality_check'
            }
          })
        })
        
        await Promise.all(updatePromises)
        
        console.log(`✅ Moved ${itemsToMoveToQA.length} item(s) to QA - all items have 100% wrapping progress`)
        console.log(`   Items moved: ${itemsToMoveToQA.map(i => i.id).join(', ')}`)
      } catch (error) {
        console.error('Error moving items to QA:', error)
        alert('Failed to move items to quality check. Please try again.')
      }
    } else {
      console.log('✅ All items already in QA or ready')
    }

    closeWrappingInstruction()
    
    // Refresh to show updated status
    await loadBookings()
  } catch (error) {
    console.error('Error handling wrapping complete:', error)
    closeWrappingInstruction()
  }
}

const handleAcceptNextItem = async () => {
  if (!nextItemModal.value.item) return
  
  const nextItem = nextItemModal.value.item
  nextItemModal.value.show = false
  
  // Get or load the current worker
  let worker = wrappingWorker.value || currentWorker.value
  
  // If no worker is loaded, fetch it from wallet address
  if (!worker && walletAddress.value) {
    try {
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
      const workerData = await executeQuery(query, {
        walletAddress: normalizedAddress
      })
      worker = workerData.worker
      if (worker) {
        currentWorker.value = worker
        wrappingWorker.value = worker
      }
    } catch (error) {
      console.error('Error loading worker:', error)
      alert('Failed to load worker information. Please try again.')
      return
    }
  }
  
  if (!worker) {
    alert('Worker information not available. Please ensure you are connected.')
    return
  }
  
  // Assign the worker to the next item and start wrapping
  try {
    // First, assign the worker to the item
    const assignMutation = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          status
          assignedWorker
          wrappingStartedAt
        }
      }
    `
    
    await executeQuery(assignMutation, {
      input: {
        id: nextItem.id,
        status: 'wrapping',
        assignedWorker: worker.id
      }
    })
    
    console.log(`✅ Assigned worker ${worker.id} to item ${nextItem.id}`)
    
    // Refresh bookings to get the latest item data
    await loadBookings()
    
    // Find the updated item from the refreshed bookings
    const booking = bookings.value.find(b => b.id === nextItemModal.value.booking?.id)
    const updatedItem = booking?.items?.find(i => i.id === nextItem.id)
    
    // Open wrapping modal for the next item with updated data
    handleStartWrapping({
      item: updatedItem || nextItem,
      worker: worker
    })
  } catch (error) {
    console.error('Error accepting next item:', error)
    alert('Failed to assign next item. Please try again.')
  }
}

const handleDeclineNextItem = () => {
  nextItemModal.value.show = false
  // Refresh to show current state
  loadBookings()
}

const handleStartQualityCheck = async (data) => {
  // Load worker if not already loaded
  if (!currentWorker.value && walletAddress.value) {
    try {
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
      const workerData = await executeQuery(query, {
        walletAddress: normalizedAddress
      })
      currentWorker.value = workerData.worker
    } catch (error) {
      console.error('Error loading worker:', error)
    }
  }

  // Find the latest item data from bookings to ensure we have the most recent qualityCheckProgress
  const booking = bookings.value.find(b => b.id === data.item.bookingId)
  if (booking && booking.items) {
    const latestItem = booking.items.find(i => i.id === data.item.id)
    if (latestItem) {
      qualityCheckItem.value = { ...data.item, ...latestItem }
    } else {
      qualityCheckItem.value = data.item
    }
  } else {
    qualityCheckItem.value = data.item
  }
  
  showQualityCheck.value = true
  closeItemDetail()
}

const closeQualityCheck = () => {
  showQualityCheck.value = false
  qualityCheckItem.value = null
}

const handleQualityCheckProgressSaved = () => {
  // Refresh bookings to show updated progress
  loadBookings()
}

const handleQualityCheckComplete = async () => {
  // Item status is already updated to 'ready' by the modal
  // Just refresh bookings and close modal
  loadBookings()
  closeQualityCheck()
}

const handleQualityCheckMoveBack = async () => {
  // Item status is already updated to 'wrapping' by the modal
  // Just refresh bookings and close modal
  loadBookings()
  closeQualityCheck()
}

const handleMoveBackToQualityCheck = async () => {
  // Item status is already updated to 'quality_check' by the modal
  // Just refresh bookings
  loadBookings()
}

const handleGroupClick = (data) => {
  const booking = data.booking
  const items = data.items || []
  
  // Check if this is a pending check-in order (no checked-in items)
  const checkedInItems = items.filter(item => 
    item.status !== 'pending_checkin' && item.status !== undefined
  )
  
  // If no items are checked in, open the check-in modal
  if (checkedInItems.length === 0) {
    selectedBooking.value = booking
    showCheckInModal.value = true
    return
  }
  
  // Open work order details modal
  selectedWorkOrderBooking.value = booking
  showWorkOrderDetails.value = true
}

const handleWorkOrderViewItem = (item) => {
  // Close work order modal and open item detail modal
  showWorkOrderDetails.value = false
  handleViewDetails(item)
}

const closeWorkOrderDetails = () => {
  showWorkOrderDetails.value = false
  selectedWorkOrderBooking.value = null
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

onMounted(() => {
  loadWorkers()
  loadBookings()
})
</script>

