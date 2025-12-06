<template>
  <div class="workflow-kanban">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Check-In Column -->
      <div class="kanban-column">
        <div class="column-header bg-blue-100 dark:bg-blue-900/30">
          <h3 class="font-semibold text-blue-900 dark:text-blue-300">Check-In</h3>
          <span class="badge bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-300">
            {{ getItemsByStatus('checked_in').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="group in getBookingGroupsByStatus('checked_in')"
            :key="group.booking.id"
            :booking="group.booking"
            :items="group.items"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- Wrapping Column -->
      <div class="kanban-column">
        <div class="column-header bg-yellow-100 dark:bg-yellow-900/30">
          <h3 class="font-semibold text-yellow-900 dark:text-yellow-300">Wrapping</h3>
          <span class="badge bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-300">
            {{ getItemsByStatus('wrapping').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="group in getBookingGroupsByStatus('wrapping')"
            :key="group.booking.id"
            :booking="group.booking"
            :items="group.items"
            :workers="workers"
            @status-updated="handleStatusUpdate"
            @view-details="handleViewDetails"
            @group-click="handleGroupClick"
          />
        </div>
      </div>

      <!-- Quality Check Column -->
      <div class="kanban-column">
        <div class="column-header bg-purple-100 dark:bg-purple-900/30">
          <h3 class="font-semibold text-purple-900 dark:text-purple-300">Quality Check</h3>
          <span class="badge bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-300">
            {{ getItemsByStatus('quality_check').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="group in getBookingGroupsByStatus('quality_check')"
            :key="group.booking.id"
            :booking="group.booking"
            :items="group.items"
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
            {{ getItemsByStatus('ready').length }}
          </span>
        </div>
        <div class="column-content">
          <BookingGroup
            v-for="group in getBookingGroupsByStatus('ready')"
            :key="group.booking.id"
            :booking="group.booking"
            :items="group.items"
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

const allItems = computed(() => {
  // Flatten items from all bookings
  const itemsList = []
  props.bookings.forEach(booking => {
    if (booking.items && Array.isArray(booking.items)) {
      booking.items.forEach(item => {
        itemsList.push({ ...item, bookingId: booking.id })
      })
    }
  })
  // Also include standalone items if provided
  if (props.items && props.items.length > 0) {
    itemsList.push(...props.items)
  }
  return itemsList
})

const getItemsByStatus = (status) => {
  return allItems.value.filter(item => item.status === status)
}

// Group items by booking for each status
const getBookingGroupsByStatus = (status) => {
  const itemsInStatus = getItemsByStatus(status)
  
  // Group items by bookingId
  const groupsMap = new Map()
  
  itemsInStatus.forEach(item => {
    const bookingId = item.bookingId
    if (!groupsMap.has(bookingId)) {
      const booking = props.bookings.find(b => b.id === bookingId)
      if (booking) {
        groupsMap.set(bookingId, {
          booking,
          items: []
        })
      }
    }
    const group = groupsMap.get(bookingId)
    if (group) {
      group.items.push(item)
    }
  })
  
  // Convert map to array and sort items within each group
  return Array.from(groupsMap.values()).map(group => ({
    ...group,
    items: group.items.sort((a, b) => (a.itemNumber || 0) - (b.itemNumber || 0))
  }))
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

