<template>
  <div class="booking-group mb-4 cursor-pointer" @click="handleGroupClick">
    <div class="booking-header bg-gray-100 dark:bg-gray-700 rounded-t-lg p-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
            {{ booking.name }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {{ booking.id }} • {{ formatDate(booking.date) }} {{ formatTime(booking.time) }}
          </p>
        </div>
        <span class="px-2 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
          {{ items.length }} item{{ items.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>
    <div class="booking-items bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-600 border-t-0 p-2 space-y-2">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :booking="booking"
        :workers="workers"
        @update-status="handleStatusUpdate"
        @view-details="handleViewDetails"
      />
    </div>
  </div>
</template>

<script setup>
import ItemCard from './ItemCard.vue'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  workers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['status-updated', 'view-details', 'group-click'])

const handleStatusUpdate = (itemId, newStatus) => {
  emit('status-updated', itemId, newStatus)
}

const handleViewDetails = (item) => {
  emit('view-details', item)
}

const handleGroupClick = (event) => {
  // Don't trigger if clicking on item cards or buttons
  if (event.target.closest('.item-card') || event.target.closest('button')) {
    return
  }
  emit('group-click', { booking: props.booking, items: props.items })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
</script>

<style scoped>
.booking-group {
  @apply rounded-lg overflow-hidden;
}
</style>

