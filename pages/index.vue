<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">Wrapsody in White</h1>
          </div>
          <div class="hidden md:flex space-x-8">
            <a href="#services" class="text-gray-700 hover:text-primary-600 transition">Services</a>
            <a href="#pricing" class="text-gray-700 hover:text-primary-600 transition">Pricing</a>
            <a href="#about" class="text-gray-700 hover:text-primary-600 transition">About</a>
            <a href="#contact" class="text-gray-700 hover:text-primary-600 transition">Contact</a>
          </div>
          <button @click="openBookingModal" class="btn-primary text-sm">Book Now</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Beautiful Gift Wrapping,<br />
              <span class="text-primary-600">Delivered to Your Door</span>
            </h2>
            <p class="text-xl text-gray-600 mb-8">
              Affordable, quick, and professional mobile gift wrapping services in Long Beach, CA. 
              Perfect for busy families and holiday shoppers.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button @click="openBookingModal" class="btn-primary text-center">Get Started</button>
              <a href="#pricing" class="btn-secondary text-center">View Pricing</a>
            </div>
            <div class="mt-8 flex items-center gap-6 text-sm text-gray-600">
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
    <section id="services" class="section-padding bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p class="text-xl text-gray-600">Professional wrapping for every occasion</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <ServiceCard
            title="Mobile Wrapping"
            description="We come to you! Perfect for busy schedules. Same-day service available."
            icon="🚗"
          />
          <ServiceCard
            title="Pop-Up Service"
            description="Find us at local malls and events. Quick, convenient wrapping on the go."
            icon="📍"
          />
          <ServiceCard
            title="Bulk Orders"
            description="Special rates for businesses and large orders. 15% off for 10+ gifts."
            icon="📦"
          />
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="section-padding bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p class="text-xl text-gray-600">20-30% more affordable than premium services</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <PricingCard
            tier="Basic"
            price="$8"
            description="Small gifts (books, small boxes)"
            features="Professional wrapping, basic ribbon"
            :popular="false"
            @book-now="openBookingModal"
          />
          <PricingCard
            tier="Premium"
            price="$12"
            description="Medium gifts (standard boxes)"
            features="Premium paper, decorative bows, custom tags"
            :popular="true"
            @book-now="openBookingModal"
          />
          <PricingCard
            tier="Unlimited"
            price="$50/hr"
            description="Home visit service"
            features="Wrap all your gifts, multiple styles, 1-hour minimum"
            :popular="false"
            @book-now="openBookingModal"
          />
        </div>
        <div class="mt-8 text-center">
          <p class="text-gray-600 mb-4">Delivery fee: $15 (waived for orders over $50)</p>
          <p class="text-sm text-gray-500">Custom tags: +$2 | Eco-friendly options available</p>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section-padding bg-white">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Why Choose Wrapsody in White?</h2>
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
    <section id="contact" class="section-padding bg-primary-600 text-white">
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
    <footer class="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
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
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// SEO
useHead({
  title: 'Wrapsody in White - Mobile Gift Wrapping Services | Long Beach, CA',
  meta: [
    { name: 'description', content: 'Affordable mobile gift wrapping services in Long Beach, CA. Quick, beautiful, and budget-friendly. Book your holiday wrapping today!' }
  ]
})

const isBookingModalOpen = ref(false)

const openBookingModal = () => {
  isBookingModalOpen.value = true
}

const closeBookingModal = () => {
  isBookingModalOpen.value = false
}

const router = useRouter()

const handleBookingCreated = (booking) => {
  console.log('Booking created successfully:', booking)
  console.log('Booking ID:', booking?.id)
  
  if (!booking || !booking.id) {
    console.error('Booking object missing id:', booking)
    return
  }
  
  const confirmationUrl = `/confirmation/${booking.id}`
  console.log('Navigating to:', confirmationUrl)
  
  // Close modal first
  closeBookingModal()
  
  // Navigate immediately - use window.location for reliability
  setTimeout(() => {
    window.location.href = confirmationUrl
  }, 100)
}
</script>
