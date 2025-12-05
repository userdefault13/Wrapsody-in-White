<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Look Up Your Order</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">Enter your booking ID or email to view and manage your order</p>
      </div>

      <!-- Search Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <form @submit.prevent="handleLookup" class="space-y-6">
          <!-- Booking ID Input -->
          <div>
            <label for="bookingId" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Booking ID
            </label>
            <input
              id="bookingId"
              v-model="searchForm.bookingId"
              type="text"
              placeholder="e.g., booking-1234567890-abc123"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You can find your Booking ID in your confirmation email
            </p>
          </div>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="searchForm.email"
              type="email"
              placeholder="your.email@example.com"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enter the email address used for booking
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!canSearch || searching"
            class="w-full bg-primary-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!searching">Look Up Order</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          </button>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-red-800 dark:text-red-300 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Help Section -->
      <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Need Help?
        </h3>
        <p class="text-blue-800 dark:text-blue-300 text-sm mb-2">
          If you can't find your booking, please contact us:
        </p>
        <ul class="text-blue-800 dark:text-blue-300 text-sm space-y-1">
          <li>📧 Email: support@wrapsodyinwhite.com</li>
          <li>📞 Phone: (555) 123-4567</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({ layout: false })

const searchForm = ref({
  bookingId: '',
  email: ''
})

const searching = ref(false)
const error = ref('')

const canSearch = computed(() => {
  return searchForm.value.bookingId.trim() || searchForm.value.email.trim()
})

const handleLookup = async () => {
  if (!canSearch.value) return

  searching.value = true
  error.value = ''

  try {
    let booking = null

    // Search by Booking ID first
    if (searchForm.value.bookingId.trim()) {
      const response = await $fetch(`/api/bookings/${searchForm.value.bookingId.trim()}`)
      if (response.success && response.data) {
        booking = response.data
      }
    }
    // If not found by ID, search by email
    else if (searchForm.value.email.trim()) {
      const response = await $fetch('/api/bookings', {
        query: {
          email: searchForm.value.email.trim()
        }
      })
      if (response.success && response.data && response.data.length > 0) {
        // Get the most recent booking for this email
        booking = response.data[0]
      }
    }

    if (booking) {
      // Navigate to order management page
      navigateTo(`/order/${booking.id}`)
    } else {
      error.value = 'No booking found. Please check your Booking ID or email address and try again.'
    }
  } catch (err) {
    console.error('Lookup error:', err)
    error.value = 'An error occurred while searching for your order. Please try again.'
  } finally {
    searching.value = false
  }
}
</script>

