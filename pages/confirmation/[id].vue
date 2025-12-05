<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Loading booking details...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="booking" class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <!-- Success Header -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
          <div class="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p class="text-green-100 text-lg">We've received your booking request and will confirm shortly.</p>
        </div>

        <!-- Booking Details -->
        <div class="p-8">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Booking Details
            </h2>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Booking ID</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white font-mono">{{ booking.id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</dt>
                  <dd>
                    <span :class="getStatusClass(booking.status)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold">
                      {{ getStatusLabel(booking.status) }}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Customer Information
            </h2>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ booking.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.email }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.phone }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.address }}</dd>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Service Details
            </h2>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Service Type</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ getServiceName(booking.service) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Number of Gifts</dt>
                  <dd class="text-lg text-gray-900 dark:text-white">{{ booking.numberOfGifts }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatDate(booking.date) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Time</dt>
                  <dd class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatTime(booking.time) }}</dd>
                </div>
              </div>
              <div v-if="booking.message" class="pt-4 border-t border-gray-200 dark:border-gray-600">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Special Instructions</dt>
                <dd class="text-gray-900 dark:text-white">{{ booking.message }}</dd>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              What's Next?
            </h3>
            <ul class="space-y-2 text-blue-800">
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>We'll contact you to confirm your appointment</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Our wrapper will arrive at your address on {{ formatDate(booking.date) }} at {{ formatTime(booking.time) }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/" class="btn-primary text-center flex-1">
              Back to Home
            </NuxtLink>
            <button @click="printPage" class="btn-secondary text-center flex-1">
              Print Confirmation
            </button>
            <button 
              v-if="booking.status !== 'cancelled' && booking.status !== 'completed'"
              @click="confirmCancelOrder" 
              class="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 text-center flex-1"
            >
              Cancel Order
            </button>
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
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Not Found</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">We couldn't find a booking with that ID. Please check your booking ID and try again.</p>
        <NuxtLink to="/" class="btn-primary inline-block">Back to Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()
const booking = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  const bookingId = route.params.id
  
  try {
    // Fetch booking from API
    const response = await $fetch(`/api/bookings/${bookingId}`)
    
    if (response.success && response.data) {
      booking.value = response.data
    } else {
      error.value = 'Booking not found'
    }
  } catch (err) {
    console.error('Error fetching booking:', err)
    error.value = err.message || 'Failed to load booking'
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

const printPage = () => {
  window.print()
}

const confirmCancelOrder = async () => {
  if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
    return
  }
  
  try {
    const response = await $fetch(`/api/bookings/${booking.value.id}`, {
      method: 'PATCH',
      body: { status: 'cancelled' }
    })
    
    if (response.success) {
      booking.value.status = 'cancelled'
      alert('Your booking has been cancelled successfully.')
    } else {
      throw new Error('Failed to cancel booking')
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    alert('There was an error cancelling your booking. Please try again or contact support.')
  }
}
</script>
