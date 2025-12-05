<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80 transition">
              Wrapsody in White
            </NuxtLink>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/#services" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</NuxtLink>
            <NuxtLink to="/#pricing" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Pricing</NuxtLink>
            <NuxtLink to="/#about" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">About</NuxtLink>
            <NuxtLink to="/#contact" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Contact</NuxtLink>
            <button @click="showLookupModal = true" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Look Up Order</button>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <NuxtLink to="/" class="btn-primary text-sm">Book Now</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Loading order details...</p>
      </div>

      <!-- Order Details -->
      <div v-else-if="booking" class="space-y-6">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Details</h1>
              <p class="text-gray-600 dark:text-gray-300">Booking ID: <span class="font-mono font-semibold">{{ booking.id }}</span></p>
            </div>
            <div>
              <span :class="getStatusClass(booking.status)" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold">
                {{ getStatusLabel(booking.status) }}
              </span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-wrap gap-3">
            <button
              v-if="booking.status !== 'cancelled' && booking.status !== 'completed'"
              @click="showCancelModal = true"
              class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel Order
            </button>
            <button
              v-if="booking.status !== 'cancelled' && booking.status !== 'completed'"
              @click="showTimeModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Change Time
            </button>
            <button
              @click="showInfoModal = true"
              :disabled="booking.status === 'cancelled' || booking.status === 'completed'"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Update Contact Info
            </button>
            <button @click="showLookupModal = true" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Look Up Another Order
            </button>
          </div>
        </div>

        <!-- Order Information -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Order Information</h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Service Details -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Details</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Service Type</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ getServiceName(booking.service) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Gifts</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.numberOfGifts }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatDate(booking.date) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Time</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatTime(booking.time) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Contact Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.email }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.phone }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.address }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Special Instructions -->
          <div v-if="booking.message" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Special Instructions</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ booking.message }}</p>
          </div>

          <!-- Order Timeline -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Timeline</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Order Created</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(booking.createdAt) }}</p>
                </div>
              </div>
              <div v-if="booking.updatedAt && booking.updatedAt !== booking.createdAt" class="flex items-center gap-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(booking.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div class="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">We couldn't find an order with that ID.</p>
        <button @click="showLookupModal = true" class="btn-primary inline-block">Look Up Order</button>
      </div>

      <!-- Cancel Order Modal -->
      <CancelOrderModal
        v-if="showCancelModal"
        :booking-id="booking?.id"
        @close="showCancelModal = false"
        @cancelled="handleOrderCancelled"
      />

      <!-- Change Time Modal -->
      <ChangeTimeModal
        v-if="showTimeModal"
        :booking="booking"
        @close="showTimeModal = false"
        @updated="handleOrderUpdated"
      />

      <!-- Update Info Modal -->
      <UpdateInfoModal
        v-if="showInfoModal"
        :booking="booking"
        @close="showInfoModal = false"
        @updated="handleOrderUpdated"
      />

      <!-- Lookup Order Modal -->
      <LookupOrderModal
        :is-open="showLookupModal"
        @close="showLookupModal = false"
      />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CancelOrderModal from '~/components/CancelOrderModal.vue'
import ChangeTimeModal from '~/components/ChangeTimeModal.vue'
import UpdateInfoModal from '~/components/UpdateInfoModal.vue'
import LookupOrderModal from '~/components/LookupOrderModal.vue'

definePageMeta({ layout: false })

const route = useRoute()
const booking = ref(null)
const loading = ref(true)
const showCancelModal = ref(false)
const showTimeModal = ref(false)
const showInfoModal = ref(false)
const showLookupModal = ref(false)

onMounted(async () => {
  const bookingId = route.params.id
  
  try {
    const response = await $fetch(`/api/bookings/${bookingId}`)
    
    if (response.success && response.data) {
      booking.value = response.data
    }
  } catch (err) {
    console.error('Error fetching booking:', err)
  } finally {
    loading.value = false
  }
})

const getServiceName = (serviceId) => {
  const services = {
    basic: 'Basic ($8 per gift)',
    premium: 'Premium ($12 per gift)',
    unlimited: 'Unlimited ($50/hour)'
  }
  return services[serviceId] || serviceId
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
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

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const loadBooking = async () => {
  if (!booking.value?.id) return
  
  try {
    loading.value = true
    const response = await $fetch(`/api/bookings/${booking.value.id}`)
    if (response.success && response.data) {
      booking.value = response.data
    }
  } catch (err) {
    console.error('Error reloading booking:', err)
  } finally {
    loading.value = false
  }
}

const handleOrderCancelled = async () => {
  // Reload booking data to reflect cancellation
  await loadBooking()
  
  // Close cancel modal if open
  showCancelModal.value = false
}

const handleOrderUpdated = async () => {
  // Reload booking data to reflect updates
  await loadBooking()
  
  // Close modals if open
  showTimeModal.value = false
  showInfoModal.value = false
}
</script>

