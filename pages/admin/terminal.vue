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

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'
import WorkflowKanban from '~/components/WorkflowKanban.vue'
import CheckInModal from '~/components/CheckInModal.vue'
import ItemDetailModal from '~/components/ItemDetailModal.vue'
import PaymentAdjustmentModal from '~/components/PaymentAdjustmentModal.vue'
import WrappingInstructionModal from '~/components/WrappingInstructionModal.vue'
import QualityCheckModal from '~/components/QualityCheckModal.vue'

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
          items {
            id
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
          }
        }
      }
    `
    
    const data = await executeQuery(query, {
      stage: selectedStage.value || null
    })
    
    console.log('Loaded bookings:', data.terminalBookings?.length || 0)
    console.log('Bookings data:', data.terminalBookings)
    bookings.value = data.terminalBookings || []
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

    // Filter items that need wrapping (status is wrapping or checked_in)
    const itemsNeedingWrapping = booking.items.filter((i) => {
      return i.status === 'wrapping' || i.status === 'checked_in'
    })

    // Check if there are more items that need wrapping
    if (itemsNeedingWrapping.length > 0) {
      // Find the next item that needs wrapping (excluding the one just completed)
      const nextItem = itemsNeedingWrapping.find((i) => i.id !== item.id) || itemsNeedingWrapping[0]
      
      if (nextItem && nextItem.id !== item.id) {
        // Open wrapping modal for the next item
        console.log('Opening wrapping modal for next item:', nextItem.id)
        
        // Get the worker who was wrapping (if available)
        const worker = wrappingWorker.value
        
        // Open the next item's wrapping modal
        handleStartWrapping({
          item: nextItem,
          worker: worker || { id: nextItem.assignedWorker }
        })
        
        // Show a message to the user
        alert(`Item "${item.description || item.id}" completed! Moving to next item: "${nextItem.description || nextItem.id}"`)
        return
      }
    }

    // No more items need wrapping - check if all items are 100% complete
    const allCheckedInItems = booking.items.filter((i) => i.status !== 'pending_checkin')
    const allItemsComplete = allCheckedInItems.every((i) => {
      // Check if item has wrappingProgress and it's 100% complete
      if (!i.wrappingProgress || !Array.isArray(i.wrappingProgress)) {
        return false
      }
      
      // All steps must be true (completed)
      const totalSteps = i.wrappingProgress.length
      const completedSteps = i.wrappingProgress.filter(Boolean).length
      
      // Item must be at quality_check or ready status AND have 100% wrapping progress
      return (i.status === 'quality_check' || i.status === 'ready') && 
             completedSteps === totalSteps && 
             totalSteps > 0
    })

    if (!allItemsComplete) {
      // Some items are not 100% complete - show warning
      const incompleteItems = allCheckedInItems.filter((i) => {
        if (!i.wrappingProgress || !Array.isArray(i.wrappingProgress)) return true
        const totalSteps = i.wrappingProgress.length
        const completedSteps = i.wrappingProgress.filter(Boolean).length
        return !(i.status === 'quality_check' || i.status === 'ready') || 
               completedSteps !== totalSteps || 
               totalSteps === 0
      })
      
      console.warn('Not all items are 100% complete:', incompleteItems.map((i) => ({
        id: i.id,
        status: i.status,
        progress: i.wrappingProgress
      })))
    }

    // Close modal and refresh
    closeWrappingInstruction()
    await loadBookings()
  } catch (error) {
    console.error('Error completing wrapping:', error)
    alert('Failed to mark item as complete. Please try again.')
    closeWrappingInstruction()
  }
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
  
  // When clicking on a booking group with checked-in items, open the first unassigned item for assignment
  // Or if all items are assigned, open the first item for viewing
  if (items && items.length > 0) {
    // Find first unassigned item, or first item if all are assigned
    const unassignedItem = items.find(item => !item.assignedWorker && item.status === 'checked_in')
    const itemToOpen = unassignedItem || items[0]
    
    if (itemToOpen) {
      handleViewDetails(itemToOpen)
    }
  }
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

