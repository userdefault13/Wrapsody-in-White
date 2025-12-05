<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">Wrapsody in White</h1>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#services" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</a>
            <a href="#pricing" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Pricing</a>
            <a href="#about" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">About</a>
            <a href="#contact" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Contact</a>
            <button @click="openLookupModal" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Look Up Order</button>
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
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Beautiful Gift Wrapping,<br />
              <span class="text-primary-600 dark:text-primary-400">Delivered to Your Door</span>
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Affordable, quick, and professional mobile gift wrapping services in Long Beach, CA. 
              Perfect for busy families and holiday shoppers.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button @click="openBookingModal" class="btn-primary text-center">Get Started</button>
              <a href="#pricing" class="btn-secondary text-center">View Pricing</a>
            </div>
            <div class="mt-8 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Same-Day Service
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                20-30% More Affordable
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-2xl">
              <div class="bg-white rounded-lg p-6 shadow-lg">
                <div class="space-y-4">
                  <div class="h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded"></div>
                  <div class="h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded"></div>
                  <div class="h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">Professional wrapping for every occasion</p>
        </div>
        <div v-if="loadingServices" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading services...</p>
        </div>
        <div v-else-if="homepageServiceTypes.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No services available at this time.</p>
        </div>
        <div v-else class="grid md:grid-cols-3 gap-8">
          <ServiceCard
            v-for="service in homepageServiceTypes"
            :key="service.id"
            :title="service.title"
            :description="service.description || service.subtitle"
            :icon="getServiceIcon(service.category)"
          />
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="section-padding bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">20-30% more affordable than premium services</p>
        </div>
        <div v-if="loadingPricing" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading pricing...</p>
        </div>
        <div v-else-if="homepageServices.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No pricing available at this time.</p>
        </div>
        <div v-else class="grid md:grid-cols-3 gap-8">
          <PricingCard
            v-for="(service, index) in homepageServices"
            :key="service.id"
            :tier="service.name"
            :price="`$${service.price}${service.priceType === 'per-hour' ? '/hr' : ''}`"
            :description="service.description"
            :features="Array.isArray(service.features) ? service.features.join(', ') : ''"
            :popular="index === 1"
            @book-now="openBookingModal"
          />
        </div>
        <div class="mt-8 text-center">
          <p class="text-gray-600 dark:text-gray-300 mb-4">Delivery fee: $15 (waived for orders over $50)</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Custom tags: +$2 | Eco-friendly options available</p>
          <NuxtLink to="/services" class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold">
            View All Services →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Wrapsody in White?</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <FeatureItem
              title="Affordable Excellence"
              description="High-quality wrapping at budget-friendly prices. No luxury markup."
            />
            <FeatureItem
              title="Fast & Convenient"
              description="15-20 minutes per gift. Same-day service available. We come to you!"
            />
            <FeatureItem
              title="Local & Personal"
              description="Long Beach focused. Personalized service with creative, themed options."
            />
          </div>
          <div class="space-y-6">
            <FeatureItem
              title="Eco-Friendly Options"
              description="Sustainable wrapping materials available. Better for the planet."
            />
            <FeatureItem
              title="Holiday Specialists"
              description="Perfect for Christmas, birthdays, weddings, and all special occasions."
            />
            <FeatureItem
              title="Flexible Scheduling"
              description="Book online or call. Weekend and evening appointments available."
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Contact/Booking Section -->
    <section id="contact" class="section-padding bg-primary-600 dark:bg-primary-700 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-primary-100 mb-8">Book your wrapping service today!</p>
        <button @click="openBookingModal" class="btn-primary bg-white text-primary-600 hover:bg-primary-50 inline-block">
          Book Now
        </button>
        <div class="mt-8 grid md:grid-cols-2 gap-6 text-left">
          <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <h3 class="font-semibold text-lg mb-2">Contact Us</h3>
            <p class="text-primary-100">Long Beach, CA</p>
            <p class="text-primary-100">Email: hello@wrapsodyinwhite.com</p>
            <p class="text-primary-100">Phone: (555) 123-4567</p>
          </div>
          <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <h3 class="font-semibold text-lg mb-2">Service Hours</h3>
            <p class="text-primary-100">Monday - Friday: 9 AM - 6 PM</p>
            <p class="text-primary-100">Saturday - Sunday: 10 AM - 4 PM</p>
            <p class="text-primary-100">Same-day service available!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 dark:bg-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 class="text-2xl font-bold text-white mb-4">Wrapsody in White</h3>
            <p class="text-gray-400">Professional mobile gift wrapping services in Long Beach, CA</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="#services" class="hover:text-white transition">Services</a></li>
              <li><a href="#pricing" class="hover:text-white transition">Pricing</a></li>
              <li><a href="#about" class="hover:text-white transition">About</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Contact</h4>
            <ul class="space-y-2 text-gray-400">
              <li>Long Beach, CA</li>
              <li>Email: hello@wrapsodyinwhite.com</li>
              <li>Phone: (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Wrapsody in White. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />

    <!-- Payment Modal -->
    <PaymentModal
      v-if="pendingPayment"
      :is-open="isPaymentModalOpen"
      :booking="pendingPayment.booking"
      :total="pendingPayment.total"
      @close="closePaymentModal"
      @payment-complete="handlePaymentComplete"
    />

    <!-- Lookup Order Modal -->
    <LookupOrderModal
      :is-open="isLookupModalOpen"
      @close="closeLookupModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'

// SEO
useHead({
  title: 'Wrapsody in White - Mobile Gift Wrapping Services | Long Beach, CA',
  meta: [
    { name: 'description', content: 'Affordable mobile gift wrapping services in Long Beach, CA. Quick, beautiful, and budget-friendly. Book your holiday wrapping today!' }
  ]
})

const isBookingModalOpen = ref(false)
const isLookupModalOpen = ref(false)
const isPaymentModalOpen = ref(false)
const pendingPayment = ref(null)
const allPricing = ref([])
const allServiceTypes = ref([])
const loadingServices = ref(true)
const loadingPricing = ref(true)

// Get first 3 service types for homepage
const homepageServiceTypes = computed(() => {
  return allServiceTypes.value.slice(0, 3)
})

// Get first 3 pricing tiers for homepage
const homepageServices = computed(() => {
  return allPricing.value.slice(0, 3)
})

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

const fetchServiceTypes = async () => {
  try {
    loadingServices.value = true
    const { executeQuery } = useGraphQL()
    const query = `
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
    const data = await executeQuery(query)
    allServiceTypes.value = data.services.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    loadingServices.value = false
  }
}

const fetchPricing = async () => {
  try {
    loadingPricing.value = true
    const { executeQuery } = useGraphQL()
    const query = `
      query {
        pricing(active: true) {
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
    allPricing.value = data.pricing.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching pricing:', error)
  } finally {
    loadingPricing.value = false
  }
}

const openBookingModal = () => {
  isBookingModalOpen.value = true
}

const closeBookingModal = () => {
  isBookingModalOpen.value = false
}

const openLookupModal = () => {
  isLookupModalOpen.value = true
}

const closeLookupModal = () => {
  isLookupModalOpen.value = false
}

const router = useRouter()

const handleBookingCreated = (data) => {
  console.log('Booking created, opening payment modal:', data)
  
  if (!data || !data.booking || !data.booking.id) {
    console.error('Invalid booking data:', data)
    return
  }
  
  // Store booking and total for payment modal
  pendingPayment.value = {
    booking: data.booking,
    total: data.total
  }
  
  // Open payment modal
  isPaymentModalOpen.value = true
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
  pendingPayment.value = null
}

const handlePaymentComplete = async (paymentData) => {
  console.log('Payment completed:', paymentData)
  
  // Get booking ID from payment data or pending payment
  const bookingId = paymentData.bookingId || pendingPayment.value?.booking?.id
  
  if (!bookingId) {
    console.error('No booking ID found for confirmation')
    return
  }
  
  // Close payment modal first
  closePaymentModal()
  
  // Wait a moment for modal to close
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Navigate to confirmation page
  const confirmationUrl = `/confirmation/${bookingId}`
  
  // Use router for navigation
  try {
    await router.push(confirmationUrl)
  } catch (err) {
    console.error('Navigation error:', err)
    // Fallback to window location
    window.location.href = confirmationUrl
  }
}

onMounted(() => {
  fetchServiceTypes()
  fetchPricing()
})
</script>
