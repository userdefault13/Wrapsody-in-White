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
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">About Last Wrap Hero</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          A developer's side project turned micro-business
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-4xl mx-auto">
        <!-- Introduction -->
        <div class="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Hi! I'm <strong class="text-primary-600 dark:text-primary-400">Last Wrap Hero</strong> — software developer by day, gift-wrapping enthusiast by holiday season.
          </p>
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            In my free time I decided to turn some code into a tiny micro-business — a way to build my portfolio of real-world projects, help busy people during the craziest time of year, and yeah… make a few extra bucks for our own holiday fund.
          </p>
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            This little gift-wrapping service started as a side project with a dual purpose:
          </p>
        </div>

        <!-- Purpose Points -->
        <div class="bg-primary-50 dark:bg-gray-700/50 rounded-lg p-8 mb-12">
          <ul class="space-y-4 text-gray-700 dark:text-gray-300">
            <li class="flex items-start">
              <span class="text-primary-600 dark:text-primary-400 mr-3 mt-1">•</span>
              <span class="text-lg">Give my brain a break from debugging and let me work with my hands for a change</span>
            </li>
            <li class="flex items-start">
              <span class="text-primary-600 dark:text-primary-400 mr-3 mt-1">•</span>
              <span class="text-lg">Prove to future employers (and myself) that I can actually ship something real — from building the website, booking system, and payment flow from scratch to running the day-to-day operation and keeping customers happy.</span>
            </li>
          </ul>
        </div>

        <!-- Location -->
        <div class="mb-12">
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Everything is ran from my home workshop here in <strong class="text-primary-600 dark:text-primary-400">Long Beach</strong>.
          </p>
        </div>

        <!-- Closing -->
        <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Whether you dread wrapping or ran out of time, I've got you.
          </p>
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Thanks for supporting a developer who's using the holiday rush to level up both his wrapping skills and his real-world project portfolio.
          </p>
          <p class="text-xl text-primary-600 dark:text-primary-400 font-semibold">
            Let's make your presents look as good as the thought behind them!
          </p>
        </div>

        <!-- CTA Button -->
        <div class="flex justify-center mt-12">
          <button @click="openBookingModal" class="btn-primary text-lg px-8 py-4">
            Book Your Wrapping Service
          </button>
        </div>
      </div>
    </section>

    <!-- Footer spacing -->
    <div class="h-16"></div>

    <!-- Modals -->
    <BookingModal
      :is-open="isBookingModalOpen"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />
    <LookupOrderModal
      :is-open="isLookupModalOpen"
      @close="closeLookupModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BookingModal from '~/components/BookingModal.vue'
import LookupOrderModal from '~/components/LookupOrderModal.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'
import Logo from '~/components/Logo.vue'

// Modal state
const isBookingModalOpen = ref(false)
const isLookupModalOpen = ref(false)

// Modal functions
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

const handleBookingCreated = (bookingData) => {
  console.log('Booking created:', bookingData)
  closeBookingModal()
  // Could navigate to confirmation page here if needed
}

// Set page meta
useHead({
  title: 'About - Last Wrap Hero',
  meta: [
    {
      name: 'description',
      content: 'Learn about Last Wrap Hero - a developer\'s side project turned micro-business. Professional gift wrapping services from Long Beach, CA.'
    }
  ]
})
</script>

