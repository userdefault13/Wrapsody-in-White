<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="booking"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 class="text-2xl font-bold text-gray-900">Booking Details</h2>
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
              <!-- Booking Info -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                  <dl class="grid grid-cols-2 gap-4">
                    <div>
                      <dt class="text-sm text-gray-500">Booking ID</dt>
                      <dd class="mt-1 text-sm font-mono text-gray-900">{{ booking.id }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Status</dt>
                      <dd class="mt-1">
                        <span :class="getStatusClass(booking.status)">
                          {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Service</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ getServiceName(booking.service) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Number of Gifts</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ booking.numberOfGifts }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Date</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(booking.date) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Time</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatTime(booking.time) }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="text-sm text-gray-500">Service Address</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ booking.address }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Customer Info -->
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <dl class="grid grid-cols-2 gap-4">
                    <div>
                      <dt class="text-sm text-gray-500">Name</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ booking.name }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Phone</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ booking.phone }}</dd>
                    </div>
                    <div class="col-span-2">
                      <dt class="text-sm text-gray-500">Email</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ booking.email }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Special Instructions -->
                <div v-if="booking.message" class="border-t border-gray-200 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                  <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ booking.message }}</p>
                </div>

                <!-- Status Update -->
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                  <div class="flex gap-4">
                    <select
                      :value="booking.status"
                      @change="handleStatusChange"
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      @click="$emit('close')"
                      class="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <!-- Created Date -->
                <div class="border-t border-gray-200 pt-4">
                  <p class="text-xs text-gray-400">
                    Created: {{ formatDateTime(booking.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  booking: Object
})

const emit = defineEmits(['close', 'status-updated'])

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800',
    confirmed: 'px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800',
    completed: 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800',
    cancelled: 'px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800'
  }
  return classes[status] || classes.pending
}

const getServiceName = (serviceId) => {
  const services = {
    basic: 'Basic ($8)',
    premium: 'Premium ($12)',
    unlimited: 'Unlimited ($50/hr)'
  }
  return services[serviceId] || serviceId
}

const formatDate = (dateString) => {
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

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const handleStatusChange = (event) => {
  const newStatus = event.target.value
  emit('status-updated', props.booking.id, newStatus)
}
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

