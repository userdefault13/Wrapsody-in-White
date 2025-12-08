<template>
  <div class="workflow-kanban">
    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
      <!-- Pending Check-In Column -->
      <div class="kanban-column">
        <div class="column-header bg-gray-100 dark:bg-gray-900/30">
          <h3 class="font-semibold text-gray-900 dark:text-gray-300">Pending Check-In</h3>
          <span class="badge bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
            {{ getOrdersByStatus('pending_checkin').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="booking in getOrdersByStatus('pending_checkin')"
            :key="booking.id"
            :booking="booking"
            :items="booking.items || []"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- Unassigned Column -->
      <div class="kanban-column">
        <div class="column-header bg-indigo-100 dark:bg-indigo-900/30">
          <h3 class="font-semibold text-indigo-900 dark:text-indigo-300">Unassigned</h3>
          <span class="badge bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-300">
            {{ getOrdersByStatus('unassigned').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="booking in getOrdersByStatus('unassigned')"
            :key="booking.id"
            :booking="booking"
            :items="booking.items || []"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- Assigned Column -->
      <div class="kanban-column">
        <div class="column-header bg-blue-100 dark:bg-blue-900/30">
          <h3 class="font-semibold text-blue-900 dark:text-blue-300">Assigned</h3>
          <span class="badge bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-300">
            {{ getOrdersByStatus('assigned').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="booking in getOrdersByStatus('assigned')"
            :key="booking.id"
            :booking="booking"
            :items="booking.items || []"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- In Progress Column (WIP) -->
      <div class="kanban-column">
        <div class="column-header bg-yellow-100 dark:bg-yellow-900/30">
          <h3 class="font-semibold text-yellow-900 dark:text-yellow-300">In Progress</h3>
          <span class="badge bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-300">
            {{ getOrdersByStatus('in_progress').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="booking in getOrdersByStatus('in_progress')"
            :key="booking.id"
            :booking="booking"
            :items="booking.items || []"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- QA Column -->
      <div class="kanban-column">
        <div class="column-header bg-purple-100 dark:bg-purple-900/30">
          <h3 class="font-semibold text-purple-900 dark:text-purple-300">QA</h3>
          <span class="badge bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-300">
            {{ getOrdersByStatus('qa').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="booking in getOrdersByStatus('qa')"
            :key="booking.id"
            :booking="booking"
            :items="booking.items || []"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- Ready Column -->
      <div class="kanban-column">
        <div class="column-header bg-green-100 dark:bg-green-900/30">
          <h3 class="font-semibold text-green-900 dark:text-green-300">Ready</h3>
          <span class="badge bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-300">
            {{ getOrdersByStatus('ready').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="booking in getOrdersByStatus('ready')"
            :key="booking.id"
            :booking="booking"
            :items="booking.items || []"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BookingGroup from './BookingGroup.vue'

const props = defineProps({
  bookings: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['status-updated', 'view-details', 'group-click'])

// Calculate order status based on item statuses
// Priority: ready > qa > in_progress > assigned > unassigned > pending_checkin
const calculateOrderStatus = (booking) => {
  const items = booking.items || []
  
  // Don't show orders that are picked up or delivered in the terminal
  if (booking.status === 'picked_up' || booking.status === 'delivered') {
    return null
  }
  
  // Filter to only checked-in items (exclude pending_checkin)
  const checkedInItems = items.filter(item => 
    item.status !== 'pending_checkin' && item.status !== undefined
  )
  
  // If booking has no checked-in items, it's pending check-in
  if (checkedInItems.length === 0) {
    // If booking has no items at all and status is pending, show in pending check-in
    if (items.length === 0 && (booking.status === 'pending' || !booking.checkedInAt)) {
      return 'pending_checkin'
    }
    // If booking has items but they're all pending_checkin, show in pending check-in
    if (items.length > 0 && items.every(item => item.status === 'pending_checkin' || !item.status)) {
      return 'pending_checkin'
    }
    // If booking status is in_progress but no items checked in, show in pending check-in
    if (booking.status === 'in_progress' && items.length === 0) {
      return 'pending_checkin'
    }
    // Default: pending check-in if no checked-in items
    return 'pending_checkin'
  }
  
  // Priority 1: Check if all items are ready or picked_up
  const allReady = checkedInItems.every(item => 
    item.status === 'ready' || item.status === 'picked_up'
  )
  if (allReady) {
    // Only show as ready if booking status is not picked_up or delivered
    if (booking.status !== 'picked_up' && booking.status !== 'delivered') {
      return 'ready'
    }
    return null // Don't show picked up or delivered orders
  }
  
  // Priority 2: Check if ALL items are in quality check (not just any)
  const itemsInQualityCheck = checkedInItems.filter(item => item.status === 'quality_check')
  const allItemsInQualityCheck = checkedInItems.length > 0 && 
                                  itemsInQualityCheck.length === checkedInItems.length &&
                                  checkedInItems.every(item => item.status === 'quality_check')
  
  // LOGGING: Debug why booking is in QA
  if (itemsInQualityCheck.length > 0) {
    console.log('🔍 [QA DEBUG] Booking being considered for QA:', {
      bookingId: booking.id,
      bookingName: booking.name,
      bookingStatus: booking.status,
      bookingCurrentStage: booking.currentStage,
      totalItems: items.length,
      checkedInItemsCount: checkedInItems.length,
      itemsInQualityCheckCount: itemsInQualityCheck.length,
      allItemsInQualityCheck: allItemsInQualityCheck,
      itemsInQualityCheck: itemsInQualityCheck.map(item => ({
        id: item.id,
        itemNumber: item.itemNumber,
        description: item.description,
        status: item.status,
        wrappingProgress: item.wrappingProgress,
        wrappingProgressComplete: item.wrappingProgress ? 
          `${item.wrappingProgress.filter(Boolean).length}/${item.wrappingProgress.length}` : 'N/A'
      })),
      itemsNotInQualityCheck: checkedInItems.filter(item => item.status !== 'quality_check').map(item => ({
        id: item.id,
        itemNumber: item.itemNumber,
        description: item.description,
        status: item.status,
        wrappingProgress: item.wrappingProgress,
        wrappingProgressComplete: item.wrappingProgress ? 
          `${item.wrappingProgress.filter(Boolean).length}/${item.wrappingProgress.length}` : 'N/A',
        assignedWorker: item.assignedWorker
      })),
      allItemsStatus: checkedInItems.map(item => ({
        id: item.id,
        itemNumber: item.itemNumber,
        description: item.description,
        status: item.status,
        wrappingProgress: item.wrappingProgress,
        wrappingProgressComplete: item.wrappingProgress ? 
          `${item.wrappingProgress.filter(Boolean).length}/${item.wrappingProgress.length}` : 'N/A',
        assignedWorker: item.assignedWorker
      }))
    })
  }
  
  if (allItemsInQualityCheck) {
    console.log(`✅ [QA DEBUG] Booking ${booking.id} moved to QA - ALL ${checkedInItems.length} items are in quality_check status`)
    return 'qa'
  } else if (itemsInQualityCheck.length > 0) {
    console.log(`❌ [QA DEBUG] Booking ${booking.id} should NOT be in QA - only ${itemsInQualityCheck.length}/${checkedInItems.length} items are in quality_check`)
    // Some items are in quality_check but not all - check what other items are doing
    const hasWrapping = checkedInItems.some(item => item.status === 'wrapping')
    if (hasWrapping) {
      console.log(`   → Showing in 'in_progress' because some items are still wrapping`)
      return 'in_progress'
    }
    const hasCheckedIn = checkedInItems.some(item => item.status === 'checked_in')
    if (hasCheckedIn) {
      console.log(`   → Showing in 'unassigned' because some items are still checked_in`)
      return 'unassigned'
    }
    // Fallback to assigned if items have workers but aren't wrapping
    const hasAssigned = checkedInItems.some(item => item.assignedWorker)
    if (hasAssigned) {
      console.log(`   → Showing in 'assigned' because some items have assigned workers`)
      return 'assigned'
    }
  }
  
  // Priority 3: Check if any item is wrapping (in progress)
  const hasWrapping = checkedInItems.some(item => item.status === 'wrapping')
  if (hasWrapping) {
    return 'in_progress'
  }
  
  // Priority 4: Check if any item has assigned worker
  const hasAssigned = checkedInItems.some(item => item.assignedWorker)
  if (hasAssigned) {
    return 'assigned'
  }
  
  // Priority 5: If booking status is in_progress and items are checked_in,
  // show in in_progress column (WIP) even if items aren't wrapping yet
  if (booking.status === 'in_progress' && checkedInItems.length > 0) {
    return 'in_progress'
  }
  
  // Priority 6: All items are checked_in but none assigned - show in unassigned
  // This includes orders that were just checked in (status is still pending)
  return 'unassigned'
}

// Get orders by their calculated status
const getOrdersByStatus = (status) => {
  return props.bookings.filter(booking => {
    const orderStatus = calculateOrderStatus(booking)
    return orderStatus === status
  })
}

const handleStatusUpdate = (itemId, newStatus) => {
  emit('status-updated', itemId, newStatus)
}

const handleViewDetails = (item) => {
  emit('view-details', item)
}

const handleGroupClick = (data) => {
  emit('group-click', data)
}
</script>

<style scoped>
.kanban-column {
  @apply bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
  min-height: 400px;
}

.column-header {
  @apply p-4 rounded-t-lg flex items-center justify-between;
}

.column-content {
  @apply p-2 space-y-2 max-h-[600px] overflow-y-auto;
}

.badge {
  @apply px-2 py-1 rounded-full text-xs font-semibold;
}
</style>

