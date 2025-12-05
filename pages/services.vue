<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400">Wrapsody in White</NuxtLink>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Home</NuxtLink>
            <NuxtLink to="/services" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</NuxtLink>
            <button @click="openBookingModal" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Book Now</button>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <button @click="openBookingModal" class="btn-primary text-sm">Book Now</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Services</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Professional gift wrapping services for every occasion
        </p>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading services...</p>
        </div>
        <div v-else-if="services.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No services available at this time.</p>
        </div>
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="service in services"
            :key="service.id"
            class="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-600"
          >
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ service.name }}</h3>
            <div class="mb-4">
              <span class="text-4xl font-bold text-primary-600 dark:text-primary-400">
                ${{ service.price }}{{ service.priceType === 'per-hour' ? '/hr' : '' }}
              </span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-6">{{ service.description }}</p>
            <ul v-if="service.features && service.features.length > 0" class="space-y-3 mb-8">
              <li
                v-for="feature in service.features"
                :key="feature"
                class="flex items-start text-sm text-gray-600 dark:text-gray-300"
              >
                <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <button
              @click="openBookingModal"
              class="w-full btn-primary text-center"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section-padding bg-primary-600 dark:bg-primary-700">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-primary-100 mb-8">Book your wrapping service today!</p>
        <button @click="openBookingModal" class="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
          Book Now
        </button>
      </div>
    </section>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BookingModal from '~/components/BookingModal.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'
import { useGraphQL } from '~/composables/useGraphQL'

// SEO
useHead({
  title: 'Services - Wrapsody in White',
  meta: [
    { name: 'description', content: 'View all our professional gift wrapping services. From basic to premium, we have options for every need.' }
  ]
})

const services = ref([])
const loading = ref(true)
const isBookingModalOpen = ref(false)

const fetchServices = async () => {
  try {
    loading.value = true
    const { executeQuery } = useGraphQL()
    const query = `
      query {
        services(active: true) {
          id
          name
          description
          price
          priceType
          features
          group
          active
          order
        }
      }
    `
    const data = await executeQuery(query)
    services.value = data.services
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    loading.value = false
  }
}

const openBookingModal = () => {
  isBookingModalOpen.value = true
}

const closeBookingModal = () => {
  isBookingModalOpen.value = false
}

const handleBookingCreated = (bookingData) => {
  console.log('Booking created:', bookingData)
  closeBookingModal()
  // Navigate to confirmation page
  if (bookingData.booking?.id) {
    navigateTo(`/confirmation/${bookingData.booking.id}`)
  }
}

onMounted(() => {
  fetchServices()
})
</script>

