<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <Logo :show-text="true" />
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <NuxtLink to="/" class="btn-secondary text-sm">
              ← Back to Home
            </NuxtLink>
            <button @click="openBookingModal" class="btn-primary text-sm">Book Now</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Services and Prices</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          An awesome gift wrapping services for the holiday season.
        </p>
      </div>
    </section>

    <!-- Services with Pricing -->
    <section class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading services...</p>
        </div>
        <div v-else-if="services.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No services available at this time.</p>
        </div>
        <div v-else class="space-y-12">
          <div
            v-for="(service, index) in services"
            :key="service.id"
            :class="[
              'bg-white dark:bg-gray-700 rounded-xl shadow-lg border-2 relative overflow-hidden',
              isHomepageService(index) 
                ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800' 
                : 'border-gray-200 dark:border-gray-600'
            ]"
          >
            <!-- Featured Badge for Homepage Services -->
            <div
              v-if="isHomepageService(index)"
              class="absolute top-4 right-4 bg-primary-600 dark:bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Featured
            </div>
            
            <!-- Service Header -->
            <div class="p-8 border-b border-gray-200 dark:border-gray-600">
              <div class="flex items-start gap-6">
                <!-- Service Icon -->
                <div class="text-6xl flex-shrink-0">{{ getServiceIcon(service.category) }}</div>
                
                <!-- Service Info -->
                <div class="flex-1">
                  <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ service.title }}</h3>
                  <p v-if="service.subtitle" class="text-lg text-primary-600 dark:text-primary-400 font-semibold mb-3">{{ service.subtitle }}</p>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">{{ service.description }}</p>
                  
                  <!-- Tag Badge -->
                  <div v-if="service.tag" class="inline-block">
                    <span class="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                      {{ service.tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pricing Tiers for this Service -->
            <div class="p-8">
              <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Pricing Options</h4>
              <div v-if="getPricingForService(service.category).length === 0" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No pricing options available for this service.</p>
              </div>
              <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="pricing in getPricingForService(service.category)"
                  :key="pricing.id"
                  class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <h5 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ pricing.name }}</h5>
                  <div class="mb-3">
                    <span class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      ${{ pricing.price }}{{ pricing.priceType === 'per-hour' ? '/hr' : '' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ pricing.description }}</p>
                  
                  <!-- Features -->
                  <ul v-if="pricing.features && pricing.features.length > 0" class="space-y-2 mb-4">
                    <li
                      v-for="feature in pricing.features"
                      :key="feature"
                      class="flex items-start text-xs text-gray-600 dark:text-gray-300"
                    >
                      <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Book Now Button -->
              <div class="mt-8 text-center">
                <button
                  @click="openBookingModal"
                  class="btn-primary px-8 py-3 text-lg"
                >
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section-padding bg-primary-600 dark:bg-primary-700">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-primary-100 mb-8">Book your wrapping service today!</p>
        <div class="flex justify-center">
          <button @click="openBookingModal" class="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
            Book Now
          </button>
        </div>
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
import Logo from '~/components/Logo.vue'

// SEO
useHead({
  title: 'Services - Last Wrap Hero',
  meta: [
    { name: 'description', content: 'View all our professional gift wrapping services. From basic to premium, we have options for every need.' }
  ]
})

const services = ref([])
const pricing = ref([])
const loading = ref(true)
const isBookingModalOpen = ref(false)

// Check if service is one of the first 3 (homepage services)
const isHomepageService = (index) => {
  return index < 3
}

// Map category to icon
const getServiceIcon = (category) => {
  const iconMap = {
    'dropoff': '📦',
    'delivery': '🚗',
    'onsite': '📍',
    'popup': '📍',
    'bulk': '📦',
    'holiday': '🎄',
    'eco': '🌱',
    'luxury': '✨'
  }
  return iconMap[category] || '🎁'
}

// Get pricing tiers for a specific service category
const getPricingForService = (serviceCategory) => {
  if (!serviceCategory) return []
  return pricing.value
    .filter(p => p.serviceCategory === serviceCategory)
    .sort((a, b) => a.order - b.order)
}

const fetchServices = async () => {
  try {
    loading.value = true
    const { executeQuery } = useGraphQL()
    
    // Fetch service types
    const servicesQuery = `
      query {
        services(active: true) {
          id
          title
          subtitle
          description
          tag
          category
          active
          order
        }
      }
    `
    const servicesData = await executeQuery(servicesQuery)
    services.value = servicesData.services.sort((a, b) => a.order - b.order)
    
    // Fetch pricing tiers
    const pricingQuery = `
      query {
        pricing(active: true) {
          id
          name
          description
          price
          priceType
          features
          serviceCategory
          active
          order
        }
      }
    `
    const pricingData = await executeQuery(pricingQuery)
    pricing.value = pricingData.pricing.sort((a, b) => a.order - b.order)
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

