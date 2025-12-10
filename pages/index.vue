<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">Last Wrap Hero</h1>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#services" @click.prevent="scrollToSection('services')" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</a>
            <a href="#pricing" @click.prevent="scrollToSection('pricing')" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Pricing</a>
            <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">How it works</a>
            <a href="#contact" @click.prevent="scrollToSection('contact')" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Contact</a>
          </div>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <button @click="openBookingModal" class="btn-primary text-sm">Book Now</button>
            <button @click="openLookupModal" class="btn-secondary text-sm">Look Up Order</button>
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
              Still have a pile of unwrapped gifts?<br />
              <span class="text-primary-600 dark:text-primary-400">I've got you covered</span>
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your cozy neighborhood gift-wrapping rescue spot is here! Drop off, pick up later, or I'll deliver back to you, same day. Take back time to enjoy the holiday season.
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
          <div class="relative space-y-6">
            <!-- Christmas Countdown -->
            <ChristmasCountdown />
            
            <!-- Available Time Slots -->
            <div class="bg-gradient-to-br from-primary-100 dark:from-dark-800 to-primary-200 dark:to-dark-700 rounded-2xl p-6 shadow-2xl">
              <div class="bg-white dark:bg-dark-900 rounded-lg p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                  📅 Available Time Slots
                </h3>
                <div v-if="loadingSlots" class="text-center py-4">
                  <p class="text-gray-500 dark:text-gray-400">Loading available slots...</p>
                </div>
                <div v-else-if="availableSlots.length === 0" class="text-center py-4">
                  <p class="text-gray-500 dark:text-gray-400">No available slots at this time</p>
                </div>
                <div v-else class="max-h-64 overflow-y-auto">
                  <div class="space-y-4">
                    <div
                      v-for="(dateSlots, date) in groupedSlots"
                      :key="date"
                      class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0"
                    >
                      <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {{ formatDateHeader(date) }}
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="slot in dateSlots"
                          :key="`${date}-${slot}`"
                          @click="openBookingModalWithSlot(date, slot)"
                          class="px-3 py-1.5 text-xs font-medium bg-primary-100 dark:bg-dark-700 text-primary-800 dark:text-dark-200 rounded-md hover:bg-primary-200 dark:hover:bg-dark-600 transition-colors cursor-pointer"
                        >
                          {{ formatTime(slot) }}
                        </button>
                      </div>
                    </div>
                  </div>
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
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-4">Professional wrapping for every occasion</p>
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
      <div class="text-center mt-8">
        <NuxtLink to="/services" class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold">
          View All Services →
        </NuxtLink>
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
          <p class="text-gray-600 dark:text-gray-300 mb-4">Delivery fee: $15 (waived for orders over $75)</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Custom tags: +$2 | Eco-friendly options available</p>
          <NuxtLink to="/services" class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold">
            View All Prices →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Last Wrap Hero?</h2>
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

    <!-- How It Works Section -->
    <section id="how-it-works" class="section-padding bg-gray-50 dark:bg-gray-900">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 md:p-12 shadow-lg">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">How it works</h2>
          <p class="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
            (and why we protect our address until the last step):
          </p>
          
          <!-- Visual Flow Infographic -->
          <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
            <!-- Step 1 -->
            <div class="flex flex-col items-center flex-1 max-w-xs">
              <div class="relative mb-4">
                <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <svg class="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-400 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Order & Pay</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center text-sm">Place your order and pay upfront — that confirms you're serious.</p>
            </div>

            <!-- Arrow 1 -->
            <div class="hidden md:block flex-shrink-0">
              <svg class="w-8 h-8 text-primary-400 dark:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div class="md:hidden my-2">
              <svg class="w-8 h-8 text-primary-400 dark:text-primary-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Step 2 -->
            <div class="flex flex-col items-center flex-1 max-w-xs">
              <div class="relative mb-4">
                <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <svg class="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-400 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Get Address</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center text-sm">After confirmation, we share our exact Long Beach address for drop-off/pick-up.</p>
            </div>

            <!-- Arrow 2 -->
            <div class="hidden md:block flex-shrink-0">
              <svg class="w-8 h-8 text-primary-400 dark:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div class="md:hidden my-2">
              <svg class="w-8 h-8 text-primary-400 dark:text-primary-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Step 3 -->
            <div class="flex flex-col items-center flex-1 max-w-xs">
              <div class="relative mb-4">
                <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <svg class="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-400 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">Appointment</h3>
              <p class="text-gray-600 dark:text-gray-300 text-center text-sm">Everything happens by appointment — keeps the Grinches away and my wife happy.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact/Booking Section -->
    <section id="contact" class="section-padding bg-primary-600 dark:bg-primary-700 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-primary-100 mb-8">Book your wrapping service today!</p>
        <div class="flex justify-center">
          <button @click="openBookingModal" class="btn-primary bg-white text-primary-600 hover:bg-primary-50">
            Book Now
          </button>
        </div>
        <div class="mt-8 grid md:grid-cols-2 gap-6 text-left">
          <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <h3 class="font-semibold text-lg mb-2">Contact Us</h3>
            <p class="text-primary-100">Long Beach, CA</p>
            <p class="text-primary-100">Email: lastwraphero@gmail.com</p>
            <p class="text-primary-100 flex items-center gap-2">
              <span>Reach out on</span>
              <a href="https://x.com/LastWrapHero" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity inline-flex items-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="X (formerly Twitter)">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </p>
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
            <h3 class="text-2xl font-bold text-white mb-4">Last Wrap Hero</h3>
            <p class="text-gray-400">Your cozy neighborhood gift-wrapping rescue spot</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/services" class="hover:text-white transition">Services</NuxtLink></li>
              <li><NuxtLink to="/services" class="hover:text-white transition">Pricing</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white transition">About</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Contact</h4>
            <ul class="space-y-2 text-gray-400">
              <li>Long Beach, CA</li>
              <li>Email: lastwraphero@gmail.com</li>
              <li class="flex items-center gap-2">
                <span>Follow us on</span>
                <a href="https://x.com/LastWrapHero" target="_blank" rel="noopener noreferrer" class="hover:text-white transition inline-flex items-center">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="X (formerly Twitter)">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Last Wrap Hero. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      :initial-date="selectedBookingDate"
      :initial-time="selectedBookingTime"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />

    <!-- Payment Modal -->
    <PaymentModal
      v-if="pendingPayment"
      :is-open="isPaymentModalOpen"
      :booking="pendingPayment.booking"
      :booking-data="pendingPayment.bookingData"
      :item-counts="pendingPayment.itemCounts"
      :total="pendingPayment.total"
      @close="closePaymentModal"
      @payment-complete="handlePaymentComplete"
    />

    <!-- Lookup Order Modal -->
    <LookupOrderModal
      :is-open="isLookupModalOpen"
      @close="closeLookupModal"
    />

    <!-- Chat Widget -->
    <ChatWidget />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'
import ChristmasCountdown from '~/components/ChristmasCountdown.vue'

// SEO
useHead({
  title: 'Last Wrap Hero - Your Gift Wrapping Rescue Spot',
  meta: [
    { name: 'description', content: 'Your cozy neighborhood gift-wrapping rescue spot! Drop off, pick up later, or we\'ll deliver back to you. Take back time to enjoy the holiday season.' }
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
const availableSlots = ref([])
const loadingSlots = ref(true)
const selectedBookingDate = ref(null)
const selectedBookingTime = ref(null)

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

// Group available slots by date and filter past time slots for today
const groupedSlots = computed(() => {
  const grouped = {}
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()
  const todayDateString = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`
  const currentTime = today.getHours() * 60 + today.getMinutes() // Current time in minutes
  
  availableSlots.value.forEach((slot) => {
    // Check if this slot is for today
    const isToday = slot.date === todayDateString
    
    if (isToday) {
      // For today, filter out past time slots
      const [hours, minutes] = slot.time.split(':').map(Number)
      const slotTime = hours * 60 + (minutes || 0) // Slot time in minutes
      
      // Only include slots that are in the future
      if (slotTime > currentTime) {
        if (!grouped[slot.date]) {
          grouped[slot.date] = []
        }
        grouped[slot.date].push(slot.time)
      }
    } else {
      // For future dates, include all slots
      if (!grouped[slot.date]) {
        grouped[slot.date] = []
      }
      grouped[slot.date].push(slot.time)
    }
  })
  
  // Sort dates
  const sortedDates = Object.keys(grouped).sort()
  const sorted = {}
  sortedDates.forEach(date => {
    sorted[date] = grouped[date].sort()
  })
  return sorted
})

// Format date header
const formatDateHeader = (dateString) => {
  // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateOnly = new Date(year, month - 1, day)
  dateOnly.setHours(0, 0, 0, 0)
  
  const diffTime = dateOnly.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Format time (e.g., "06:00" -> "6:00 AM")
const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Fetch available time slots for the next 7 days
const fetchAvailableSlots = async () => {
  try {
    loadingSlots.value = true
    const { executeQuery } = useGraphQL()
    
    // Get dates for the next 7 days using local date to avoid timezone issues
    const dates = []
    const today = new Date()
    const todayYear = today.getFullYear()
    const todayMonth = today.getMonth()
    const todayDay = today.getDate()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(todayYear, todayMonth, todayDay + i)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
    }
    
    console.log('Fetching slots for dates:', dates)
    
    // Fetch slots for each date
    const slots = []
    for (const date of dates) {
      try {
        const query = `
          query {
            availableTimeSlots(date: "${date}")
          }
        `
        const data = await executeQuery(query)
        const timeSlots = data.availableTimeSlots || []
        console.log(`Date ${date}: ${timeSlots.length} slots`, timeSlots)
        // Only add slots if there are any (blocked days will have empty arrays)
        if (timeSlots.length > 0) {
          timeSlots.forEach((time) => {
            slots.push({ date, time })
          })
        }
      } catch (error) {
        console.error(`Error fetching slots for ${date}:`, error)
      }
    }
    
    availableSlots.value = slots
    console.log('Final availableSlots:', availableSlots.value)
  } catch (error) {
    console.error('Error fetching available slots:', error)
  } finally {
    loadingSlots.value = false
  }
}

const openBookingModal = () => {
  selectedBookingDate.value = null
  selectedBookingTime.value = null
  isBookingModalOpen.value = true
}

const openBookingModalWithSlot = (date, time) => {
  selectedBookingDate.value = date
  selectedBookingTime.value = time
  isBookingModalOpen.value = true
}

const closeBookingModal = () => {
  isBookingModalOpen.value = false
  // Reset selected date/time after a short delay to allow modal to close
  setTimeout(() => {
    selectedBookingDate.value = null
    selectedBookingTime.value = null
  }, 300)
}

const openLookupModal = () => {
  isLookupModalOpen.value = true
}

const closeLookupModal = () => {
  isLookupModalOpen.value = false
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const offset = 80 // Account for fixed nav height
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const router = useRouter()

const handleBookingCreated = (data) => {
  console.log('Booking data prepared, opening payment modal:', data)
  
  if (!data || (!data.booking && !data.bookingData)) {
    console.error('Invalid booking data:', data)
    return
  }
  
  // Store booking data and total for payment modal
  // bookingData will be used to create booking AFTER payment succeeds
  pendingPayment.value = {
    booking: data.booking || null, // Legacy support
    bookingData: data.bookingData || null, // New: booking data to create after payment
    itemCounts: data.itemCounts || null, // Item counts for work order creation
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
  
  // Get booking ID from payment data (booking should now be created after payment)
  const bookingId = paymentData.bookingId || paymentData.booking?.id || pendingPayment.value?.booking?.id
  
  if (!bookingId) {
    console.error('No booking ID found for confirmation')
    alert('Payment completed but booking ID not found. Please contact support.')
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
  fetchAvailableSlots()
})
</script>
