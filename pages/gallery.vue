<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <Logo :show-text="true" />
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Home</NuxtLink>
            <NuxtLink to="/services" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Services</NuxtLink>
            <NuxtLink to="/gallery" class="text-primary-600 dark:text-primary-400 font-semibold">Gallery</NuxtLink>
            <NuxtLink to="/about" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">About</NuxtLink>
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
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Gallery</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Explore our beautiful selection of wrapping paper, ribbon tags, and bows
        </p>
      </div>
    </section>

    <!-- Category Tabs -->
    <section class="section-padding bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="activeCategory = category.id"
            :class="[
              'px-6 py-3 text-lg font-semibold transition-colors border-b-2',
              activeCategory === category.id
                ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-primary-600 dark:hover:text-primary-400'
            ]"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Gallery Grid -->
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading gallery...</p>
        </div>
        <div v-else-if="currentImages.length === 0" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <svg class="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">No images available</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm">Check back soon for our latest selection!</p>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="(image, index) in currentImages"
            :key="index"
            @click="openImageModal(image, index)"
            class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <img
              :src="image.url"
              :alt="image.alt || `${activeCategoryName} ${index + 1}`"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              @error="handleImageError"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p class="text-sm font-semibold">{{ image.title || `${activeCategoryName} ${index + 1}` }}</p>
                <p v-if="image.description" class="text-xs text-white/80 mt-1">{{ image.description }}</p>
              </div>
            </div>
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
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
        <p class="text-xl text-primary-100 mb-8">Book your wrapping service today and choose from our beautiful selection!</p>
        <div class="flex justify-center">
          <button @click="openBookingModal" class="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
            Book Now
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 dark:bg-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo size="lg" :show-text="false" />
            <p class="text-gray-400 mt-4">Your cozy neighborhood<br>gift-wrapping rescue spot</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/services" class="hover:text-white transition">Services</NuxtLink></li>
              <li><NuxtLink to="/gallery" class="hover:text-white transition">Gallery</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white transition">About</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Contact</h4>
            <ul class="space-y-2 text-gray-400">
              <li>Long Beach, CA</li>
              <li>Email: lastwraphero@gmail.com</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Last Wrap Hero. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Image Modal -->
    <div
      v-if="selectedImage"
      @click="closeImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <button
        @click="closeImageModal"
        class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        v-if="currentImages.length > 1"
        @click.stop="previousImage"
        class="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="currentImages.length > 1"
        @click.stop="nextImage"
        class="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div @click.stop class="max-w-7xl w-full">
        <img
          :src="selectedImage.url"
          :alt="selectedImage.alt || selectedImage.title"
          class="max-h-[90vh] w-full object-contain mx-auto rounded-lg"
        />
        <div v-if="selectedImage.title || selectedImage.description" class="mt-4 text-center text-white">
          <h3 v-if="selectedImage.title" class="text-2xl font-bold mb-2">{{ selectedImage.title }}</h3>
          <p v-if="selectedImage.description" class="text-gray-300">{{ selectedImage.description }}</p>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="isBookingModalOpen"
      @close="closeBookingModal"
      @booking-created="handleBookingCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BookingModal from '~/components/BookingModal.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'
import Logo from '~/components/Logo.vue'

// SEO
useHead({
  title: 'Gallery - Last Wrap Hero',
  meta: [
    { name: 'description', content: 'Explore our beautiful selection of wrapping paper, ribbon tags, and bows. Find the perfect style for your gift wrapping needs.' }
  ]
})

const categories = [
  { id: 'wrapping-paper', name: 'Wrapping Paper' },
  { id: 'ribbon-tags', name: 'Ribbon Tags' },
  { id: 'bows', name: 'Bows' }
]

const activeCategory = ref('wrapping-paper')
const loading = ref(false)
const selectedImage = ref(null)
const selectedImageIndex = ref(0)
const isBookingModalOpen = ref(false)

// Sample gallery images - in production, these would come from an API or file system
const galleryImages = ref({
  'wrapping-paper': [],
  'ribbon-tags': [],
  'bows': []
})

// Get current category images
const currentImages = computed(() => {
  return galleryImages.value[activeCategory.value] || []
})

const activeCategoryName = computed(() => {
  const category = categories.find(c => c.id === activeCategory.value)
  return category ? category.name : 'Gallery'
})

// Load images from public/uploads/gallery directory
const loadGalleryImages = async () => {
  loading.value = true
  try {
    // Load images for all categories
    for (const category of categories) {
      try {
        const response = await $fetch(`/api/gallery/${category.id}`)
        if (response.success && response.images) {
          galleryImages.value[category.id] = response.images
        }
      } catch (error) {
        console.error(`Error loading images for ${category.id}:`, error)
        galleryImages.value[category.id] = []
      }
    }
  } catch (error) {
    console.error('Error loading gallery images:', error)
  } finally {
    loading.value = false
  }
}

// Watch for category changes and reload images if needed
watch(activeCategory, () => {
  // Images are already loaded for all categories, so no need to reload
  // But you could add lazy loading here if needed
})

const handleImageError = (event) => {
  // Replace broken image with placeholder
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E'
}

const openImageModal = (image, index) => {
  selectedImage.value = image
  selectedImageIndex.value = index
}

const closeImageModal = () => {
  selectedImage.value = null
  selectedImageIndex.value = 0
}

const nextImage = () => {
  if (currentImages.value.length > 0) {
    selectedImageIndex.value = (selectedImageIndex.value + 1) % currentImages.value.length
    selectedImage.value = currentImages.value[selectedImageIndex.value]
  }
}

const previousImage = () => {
  if (currentImages.value.length > 0) {
    selectedImageIndex.value = selectedImageIndex.value === 0 
      ? currentImages.value.length - 1 
      : selectedImageIndex.value - 1
    selectedImage.value = currentImages.value[selectedImageIndex.value]
  }
}

// Keyboard navigation for modal
const handleKeydown = (event) => {
  if (!selectedImage.value) return
  
  if (event.key === 'Escape') {
    closeImageModal()
  } else if (event.key === 'ArrowRight') {
    nextImage()
  } else if (event.key === 'ArrowLeft') {
    previousImage()
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
  loadGalleryImages()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

