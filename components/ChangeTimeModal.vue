<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Change Appointment Time</h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleUpdate" class="space-y-6">
              <!-- Date Selection -->
              <div>
                <label for="new-date" class="block text-sm font-semibold text-gray-700 mb-2">
                  New Date *
                </label>
                <input
                  id="new-date"
                  v-model="form.date"
                  type="date"
                  :min="minDate"
                  required
                  @change="form.time = ''"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Time Selection -->
              <div v-if="form.date">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  New Time *
                </label>
                <div class="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  <button
                    v-for="slot in availableTimeSlots"
                    :key="slot"
                    type="button"
                    :class="[
                      'px-4 py-2 rounded-lg border-2 transition-all text-sm',
                      form.time === slot
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                    ]"
                    @click="form.time = slot"
                  >
                    {{ formatTime(slot) }}
                  </button>
                  <p v-if="availableTimeSlots.length === 0" class="text-gray-500 col-span-full text-center py-4">
                    No available time slots for this date.
                  </p>
                </div>
              </div>

              <!-- Current Appointment -->
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm font-medium text-gray-700 mb-1">Current Appointment:</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatDate(booking?.date) }} at {{ formatTime(booking?.time) }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!canSubmit || updating"
                  class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="!updating">Update Time</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBookings } from '~/composables/useBookings'
import { useAvailability } from '~/composables/useAvailability'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const { getAvailableTimeSlots } = useBookings()
const { isDateAvailable } = useAvailability()

const form = ref({
  date: '',
  time: ''
})

const updating = ref(false)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const availableTimeSlots = computed(() => {
  if (!form.value.date) return []
  return getAvailableTimeSlots(form.value.date)
})

const canSubmit = computed(() => {
  if (!form.value.date || !form.value.time) return false
  // Must have changed either date or time
  return form.value.date !== props.booking?.date || 
         form.value.time !== props.booking?.time
})

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

const handleUpdate = async () => {
  if (!canSubmit.value) return

  // Validate date is available
  if (!isDateAvailable(form.value.date)) {
    alert('The selected date is not available. Please choose another date.')
    return
  }

  // Validate time slot is available
  const availableSlots = getAvailableTimeSlots(form.value.date)
  if (!availableSlots.includes(form.value.time)) {
    alert('The selected time slot is not available. Please choose another time.')
    return
  }

  updating.value = true

  try {
    const response = await $fetch(`/api/bookings/${props.booking.id}`, {
      method: 'PATCH',
      body: {
        date: form.value.date,
        time: form.value.time
      }
    })

    if (response.success) {
      // Show success message
      alert('Your appointment time has been updated successfully!')
      emit('updated')
      closeModal()
    } else {
      throw new Error('Failed to update time')
    }
  } catch (error) {
    console.error('Error updating time:', error)
    const errorMessage = error?.data?.message || error?.message || 'There was an error updating your appointment time. Please try again.'
    alert(errorMessage)
  } finally {
    updating.value = false
  }
}

const closeModal = () => {
  form.value = { date: '', time: '' }
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.booking) {
    form.value.date = props.booking.date
    form.value.time = props.booking.time
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
</style>

