<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Availability Schedule</h2>
                <p class="text-sm text-gray-600 mt-1">Set your available dates and time slots for bookings</p>
              </div>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Recurring Schedule -->
              <div class="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Recurring Schedule</h2>
                <p class="text-gray-600 mb-4 text-sm">Set available time slots for each day of the week</p>
                <div class="space-y-3">
                  <div
                    v-for="(day, index) in daysOfWeek"
                    :key="index"
                    class="border-2 rounded-lg transition-all bg-white"
                    :class="[
                      expandedDay === index ? 'border-primary-500 shadow-md' : 'border-gray-200',
                      getDaySchedule(index)?.isBlocked ? 'bg-red-50 border-red-300' : ''
                    ]"
                  >
                    <!-- Day Header -->
                    <button
                      @click="toggleDay(index)"
                      class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">{{ day.emoji }}</span>
                        <div class="text-left">
                          <div class="font-semibold text-gray-900">{{ day.name }}</div>
                          <div class="text-xs text-gray-500">
                            <span v-if="getDaySchedule(index)?.isBlocked" class="text-red-600 font-semibold">Blocked</span>
                            <span v-else-if="getDaySchedule(index)?.slots.length" class="text-green-600">
                              {{ getDaySchedule(index)?.slots.length }} time slot(s)
                            </span>
                            <span v-else class="text-gray-400">No schedule set</span>
                          </div>
                        </div>
                      </div>
                      <svg
                        :class="[
                          'w-5 h-5 text-gray-400 transition-transform',
                          expandedDay === index ? 'transform rotate-180' : ''
                        ]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    <!-- Expanded Content -->
                    <div
                      v-if="expandedDay === index"
                      class="px-4 pb-4 border-t border-gray-200 pt-4"
                    >
                      <!-- Block Day Option -->
                      <div class="mb-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            :checked="getDaySchedule(index)?.isBlocked || false"
                            @change="toggleBlockDay(index, $event.target.checked)"
                            class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span class="text-sm font-semibold text-red-700">Block this day</span>
                        </label>
                      </div>

                      <!-- Time Slots (only show if not blocked) -->
                      <div v-if="!getDaySchedule(index)?.isBlocked">
                        <div class="flex items-center justify-between mb-3">
                          <label class="block text-sm font-semibold text-gray-700">
                            Available Time Slots
                          </label>
                          <button
                            @click="selectAllTimeSlots(index)"
                            class="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                          >
                            Select All
                          </button>
                        </div>
                        <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                          <label
                            v-for="slot in allTimeSlots"
                            :key="slot"
                            class="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors"
                          >
                            <input
                              type="checkbox"
                              :value="slot"
                              :checked="getDaySchedule(index)?.slots.includes(slot) || false"
                              @change="updateDaySchedule(index, slot, $event.target.checked)"
                              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span class="text-sm text-gray-700">{{ formatTime(slot) }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Specific Date Availability -->
              <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Add Specific Date Availability</h2>
                <div class="grid md:grid-cols-4 gap-4">
                  <div>
                    <label for="schedule-date" class="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      id="schedule-date"
                      v-model="newAvailability.date"
                      type="date"
                      :min="minDate"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-semibold text-gray-700">
                        Available Time Slots *
                      </label>
                      <button
                        @click="selectAllTimeSlotsForDate"
                        class="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                      >
                        Select All
                      </button>
                    </div>
                    <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                      <label
                        v-for="slot in allTimeSlots"
                        :key="slot"
                        class="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors"
                      >
                        <input
                          type="checkbox"
                          :value="slot"
                          v-model="newAvailability.slots"
                          class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span class="text-sm text-gray-700">{{ formatTime(slot) }}</span>
                      </label>
                    </div>
                  </div>
                  <div class="flex items-end">
                    <button
                      @click="addAvailability"
                      :disabled="!canAddAvailability"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <!-- Current Availability -->
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-gray-900">Scheduled Availability</h2>
                  <button
                    v-if="availability.length > 0"
                    @click="confirmClearAll"
                    class="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div v-if="availability.length === 0" class="p-12 text-center">
                  <p class="text-gray-500 text-lg">No availability scheduled.</p>
                  <p class="text-gray-400 text-sm mt-2">Add dates above to set your schedule.</p>
                </div>

                <div v-else class="divide-y divide-gray-200">
                  <div
                    v-for="day in sortedAvailability"
                    :key="day.date"
                    class="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">
                          {{ formatDate(day.date) }}
                        </h3>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="slot in day.slots"
                            :key="slot"
                            class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {{ formatTime(slot) }}
                          </span>
                          <span v-if="day.slots.length === 0" class="text-gray-400 text-sm">
                            No slots available
                          </span>
                        </div>
                      </div>
                      <button
                        @click="removeAvailability(day.date)"
                        class="ml-4 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Clear All Confirmation Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showClearConfirm"
        class="fixed inset-0 z-[60] overflow-y-auto"
        @click.self="showClearConfirm = false"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Clear All Availability?</h3>
            <p class="text-gray-600 mb-6">
              This will remove all scheduled availability. This action cannot be undone.
            </p>
            <div class="flex gap-4">
              <button
                @click="showClearConfirm = false"
                class="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                @click="handleClearAll"
                class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Clear All
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
import { useAvailability } from '~/composables/useAvailability'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const { 
  availability, 
  setDayAvailability, 
  removeDayAvailability, 
  clearAllAvailability: clearAll,
  setDayOfWeekSchedule,
  getDayOfWeekSchedule
} = useAvailability()

const expandedDay = ref(null)
const newAvailability = ref({
  date: '',
  slots: []
})
const showClearConfirm = ref(false)

// Generate all time slots (6 AM to 11 PM, every hour)
const allTimeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = 6 + i
  return `${hour.toString().padStart(2, '0')}:00`
})

// Days of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const daysOfWeek = [
  { name: 'Sun', emoji: '☀️' },
  { name: 'Mon', emoji: '📅' },
  { name: 'Tue', emoji: '📆' },
  { name: 'Wed', emoji: '🗓️' },
  { name: 'Thu', emoji: '📋' },
  { name: 'Fri', emoji: '✅' },
  { name: 'Sat', emoji: '🎉' }
]

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const canAddAvailability = computed(() => {
  return newAvailability.value.date && newAvailability.value.slots.length > 0
})

const sortedAvailability = computed(() => {
  return [...availability.value].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
})

const toggleDay = (index) => {
  expandedDay.value = expandedDay.value === index ? null : index
}

const getDaySchedule = (dayOfWeek) => {
  return getDayOfWeekSchedule(dayOfWeek)
}

const toggleBlockDay = (dayOfWeek, isBlocked) => {
  const currentSchedule = getDayOfWeekSchedule(dayOfWeek)
  const slots = isBlocked ? [] : (currentSchedule?.slots || [])
  setDayOfWeekSchedule(dayOfWeek, slots, isBlocked)
}

const updateDaySchedule = (dayOfWeek, slot, isSelected) => {
  const currentSchedule = getDayOfWeekSchedule(dayOfWeek)
  let slots = currentSchedule?.slots || []
  
  if (isSelected) {
    if (!slots.includes(slot)) {
      slots = [...slots, slot].sort()
    }
  } else {
    slots = slots.filter(s => s !== slot)
  }
  
  setDayOfWeekSchedule(dayOfWeek, slots, false)
}

const selectAllTimeSlots = (dayOfWeek) => {
  // Select all time slots for the day
  setDayOfWeekSchedule(dayOfWeek, [...allTimeSlots], false)
}

const selectAllTimeSlotsForDate = () => {
  // Select all time slots for the specific date form
  newAvailability.value.slots = [...allTimeSlots]
}

const addAvailability = () => {
  if (!canAddAvailability.value) return

  setDayAvailability(
    newAvailability.value.date,
    newAvailability.value.slots,
    true
  )

  // Reset form
  newAvailability.value = {
    date: '',
    slots: []
  }
}

const removeAvailability = (date) => {
  if (confirm(`Remove availability for ${formatDate(date)}?`)) {
    removeDayAvailability(date)
  }
}

const confirmClearAll = () => {
  showClearConfirm.value = true
}

const handleClearAll = () => {
  clearAll()
  showClearConfirm.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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

// Close on Escape key and manage body scroll
watch(() => props.isOpen, (isOpen) => {
  if (typeof window !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      const handleEscape = (e) => {
        if (e.key === 'Escape' && !showClearConfirm.value) {
          emit('close')
        }
      }
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
    }
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.95);
}
</style>

