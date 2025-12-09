<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Book Your Wrapping Service</h2>
              <button
                @click="closeModal"
                class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Service Type Selection (First Step) -->
                <div v-if="!selectedServiceType">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Choose Service Type *
                  </label>
                  <div class="grid md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      @click="selectedServiceType = 'dropoff'"
                      class="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left bg-white dark:bg-gray-700"
                    >
                      <div class="flex items-center gap-3 mb-2">
                        <span class="text-3xl">📦</span>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Drop-Off</h3>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Bring your items to us and we'll wrap them for pickup
                      </p>
                    </button>
                    <button
                      type="button"
                      @click="selectedServiceType = 'delivery'"
                      class="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left bg-white dark:bg-gray-700"
                    >
                      <div class="flex items-center gap-3 mb-2">
                        <span class="text-3xl">🚗</span>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Delivery</h3>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        We pick up and deliver your wrapped gifts
                      </p>
                    </button>
                    <button
                      type="button"
                      @click="selectedServiceType = 'onsite'"
                      class="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left bg-white dark:bg-gray-700"
                    >
                      <div class="flex items-center gap-3 mb-2">
                        <span class="text-3xl">📍</span>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">On-Site</h3>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        We come to your location to wrap on-site
                      </p>
                    </button>
                  </div>
                </div>

                <!-- Size & Quantity Selection (Combined Step) -->
                <div v-if="selectedServiceType">
                  <div class="flex items-center gap-4 mb-4">
                    <button
                      type="button"
                      @click="selectedServiceType = null; itemCounts = {}"
                      class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ← Back
                    </button>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Select Sizes & Quantities *
                    </label>
                  </div>
                  
                  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div
                      v-for="pricing in filteredPricing"
                      :key="pricing.id"
                      :class="[
                        'p-6 border-2 rounded-lg transition-all bg-white dark:bg-gray-700',
                        (itemCounts[pricing.id] || 0) > 0
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                      ]"
                    >
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ pricing.name }}</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 min-h-[3rem]">{{ pricing.description }}</p>
                      <p class="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                        ${{ pricing.price }}{{ pricing.priceType === 'per-hour' ? '/hr' : '' }}
                      </p>
                      
                      <!-- Quantity Counter -->
                      <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            @click="decrementItemCount(pricing.id)"
                            :disabled="(itemCounts[pricing.id] || 0) <= 0"
                            class="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span class="text-lg font-bold text-gray-900 dark:text-white w-10 text-center">
                            {{ itemCounts[pricing.id] || 0 }}
                          </span>
                          <button
                            type="button"
                            @click="incrementItemCount(pricing.id)"
                            class="w-8 h-8 rounded-lg border-2 border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Total Items Summary -->
                  <div v-if="totalItemCount > 0" class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-500 dark:border-primary-400">
                    <div class="flex justify-between items-center">
                      <span class="font-semibold text-gray-900 dark:text-white">Total Items:</span>
                      <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ totalItemCount }}</span>
                    </div>
                  </div>
                  <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                    Select quantities for the sizes you need
                  </p>
                </div>

                <!-- Date Selection (only show after items selected) -->
                <div v-if="totalItemCount > 0">
                  <label for="date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Date *
                  </label>
                  <input
                    id="date"
                    ref="dateInput"
                    v-model="selectedDate"
                    type="date"
                    :min="minDate"
                    required
                    @change="selectedTime = ''"
                    @click="openDatePicker"
                    class="date-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                  />
                  <p v-if="selectedDate" class="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                    {{ formatDate(selectedDate) }}
                  </p>
                  <p v-if="selectedDate && checkingAvailability" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Checking availability...
                  </p>
                  <p v-else-if="selectedDate && !dateAvailable" class="mt-2 text-sm text-red-600 dark:text-red-400">
                    This date is not available. Please select another date.
                  </p>
                </div>

                <!-- Time Selection (only show after date selected) -->
                <div v-if="totalItemCount > 0 && selectedDate && dateAvailable && !checkingAvailability">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Time *
                  </label>
                  <div v-if="loadingSlots" class="text-sm text-gray-500 dark:text-gray-400">
                    Loading available time slots...
                  </div>
                  <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <button
                      v-for="slot in filteredTimeSlots"
                      :key="slot"
                      type="button"
                      :class="[
                        'px-3 py-2 rounded-lg border-2 transition-all text-sm',
                        selectedTime === slot
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:border-primary-400'
                      ]"
                      @click="form.time = slot; selectedTime = slot"
                    >
                      {{ formatTime(slot) }}
                    </button>
                  </div>
                  <p v-if="!loadingSlots && filteredTimeSlots.length === 0" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No available time slots for this date.
                  </p>
                </div>

                <!-- Contact Information (show after service type is selected) -->
                <div v-if="selectedServiceType" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label for="firstName" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        v-model="form.firstName"
                        type="text"
                        required
                        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label for="lastName" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        v-model="form.lastName"
                        type="text"
                        required
                        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div v-if="selectedServiceType" class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label for="phone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      type="tel"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label for="address" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Service Address *
                    </label>
                    <input
                      id="address"
                      v-model="form.address"
                      type="text"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="123 Main St, Long Beach, CA"
                    />
                  </div>
                </div>

                <!-- Special Instructions (only show after time selected) -->
                <div v-if="totalItemCount > 0 && selectedTime">
                  <label for="message" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Special Instructions or Requests
                  </label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Any specific wrapping preferences, themes, or special requests..."
                  ></textarea>
                </div>

                <!-- Price Summary (only show after time selected) -->
                <div v-if="totalItemCount > 0 && selectedTime" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-300">Service Type:</span>
                      <span class="font-semibold text-gray-900 dark:text-white capitalize">{{ selectedServiceType }}</span>
                    </div>
                    <div v-for="[pricingId, count] in filteredItemCounts" :key="pricingId" class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-300">
                        {{ pricing.find(p => p.id === pricingId)?.name || 'Item' }}:
                      </span>
                      <span class="font-semibold text-gray-900 dark:text-white">
                        {{ count }} × ${{ pricing.find(p => p.id === pricingId)?.price || 0 }} = ${{ (count * (pricing.find(p => p.id === pricingId)?.price || 0)).toFixed(2) }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-300">Total Items:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">{{ totalItemCount }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-300">Date & Time:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">
                        {{ formatDate(selectedDate) }} {{ formatTime(selectedTime) }}
                      </span>
                    </div>
                    <div class="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                      <div class="flex justify-between text-lg">
                        <span class="font-bold text-gray-900 dark:text-white">Total:</span>
                        <span class="font-bold text-primary-600 dark:text-primary-400">${{ calculateTotal() }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="flex gap-4">
                  <button
                    type="button"
                    @click="closeModal"
                    :disabled="submitting"
                    class="flex-1 btn-secondary text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="!canSubmit || submitting"
                    class="flex-1 bg-primary-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    <span v-if="!submitting">Confirm Booking</span>
                    <span v-else class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Loading Overlay with Progress Bar -->
            <Transition name="fade">
              <div v-if="submitting" class="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
                <div class="text-center px-8">
                  <!-- Spinner -->
                  <div class="mb-6">
                    <svg class="animate-spin h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="w-64 mb-4 mx-auto">
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-300 ease-out"
                        :style="{ width: progressPercent + '%' }"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Status Text -->
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ progressStatus }}</h3>
                  <p class="text-gray-600 dark:text-gray-300 text-sm">{{ progressMessage }}</p>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBookings } from '~/composables/useBookings'
import { useGraphQL } from '~/composables/useGraphQL'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialDate: {
    type: String,
    default: null
  },
  initialTime: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'booking-created'])

const { createBooking, getAvailableTimeSlots, isDateAvailable } = useBookings()
const router = useRouter()

const services = ref([])
const pricing = ref([])
const selectedServiceType = ref(null) // 'dropoff', 'delivery', or 'onsite'
const itemCounts = ref({}) // { pricingId: count }

// Fetch pricing from GraphQL
const fetchServices = async () => {
  try {
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
          serviceCategory
          order
        }
      }
    `
    const data = await executeQuery(query)
    console.log('Fetched pricing data:', data.pricing)
    pricing.value = data.pricing.sort((a, b) => (a.order || 0) - (b.order || 0))
    services.value = data.pricing.map(pricing => {
      const service = {
        id: pricing.id,
        name: pricing.name,
        price: pricing.price,
        description: pricing.description || '',
        priceType: pricing.priceType || 'per-item',
        serviceCategory: pricing.serviceCategory || null
      }
      console.log('Mapped service:', service.name, 'serviceCategory:', service.serviceCategory)
      return service
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    // Fallback to default pricing
    pricing.value = [
      { id: 'basic', name: 'Basic', price: 8, description: 'Small gifts', priceType: 'per-item', serviceCategory: 'dropoff' },
      { id: 'premium', name: 'Premium', price: 12, description: 'Medium gifts', priceType: 'per-item', serviceCategory: 'dropoff' },
      { id: 'unlimited', name: 'Unlimited', price: 50, description: 'Per hour', priceType: 'per-hour', serviceCategory: 'onsite' }
    ]
    services.value = pricing.value
  }
}

const filteredPricing = computed(() => {
  if (!selectedServiceType.value) return []
  return pricing.value.filter(p => p.serviceCategory === selectedServiceType.value)
})

const totalItemCount = computed(() => {
  return Object.values(itemCounts.value).reduce((sum, count) => sum + (count || 0), 0)
})

const filteredItemCounts = computed(() => {
  return Object.entries(itemCounts.value).filter(([pricingId, count]) => count > 0)
})

const incrementItemCount = (pricingId) => {
  if (!itemCounts.value[pricingId]) {
    itemCounts.value[pricingId] = 0
  }
  itemCounts.value[pricingId]++
  // Update form.numberOfGifts to total
  form.value.numberOfGifts = totalItemCount.value
}

const decrementItemCount = (pricingId) => {
  if (itemCounts.value[pricingId] && itemCounts.value[pricingId] > 0) {
    itemCounts.value[pricingId]--
    // Update form.numberOfGifts to total
    form.value.numberOfGifts = totalItemCount.value
  }
}

const form = ref({
  service: '',
  date: '',
  time: '',
  numberOfGifts: 1,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  message: ''
})

const selectedDate = ref('')
const selectedTime = ref('')
const dateInput = ref(null)
const submitting = ref(false)
const progressPercent = ref(0)
const progressStatus = ref('Submitting booking...')
const progressMessage = ref('Please wait while we process your request')

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const dateAvailable = ref(true)
const checkingAvailability = ref(false)

const availableTimeSlots = ref([])
const loadingSlots = ref(false)

// Filter out past time slots if the selected date is today
const filteredTimeSlots = computed(() => {
  if (!selectedDate.value || availableTimeSlots.value.length === 0) {
    return []
  }
  
  // Parse selected date as local date
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  const selectedDateObj = new Date(year, month - 1, day)
  selectedDateObj.setHours(0, 0, 0, 0)
  
  // Get today's date in local timezone
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  today.setHours(0, 0, 0, 0)
  
  // Check if selected date is today
  const isToday = selectedDateObj.getTime() === today.getTime()
  
  if (!isToday) {
    // For future dates, return all slots
    return availableTimeSlots.value
  }
  
  // For today, filter out past time slots
  const currentTime = now.getHours() * 60 + now.getMinutes() // Current time in minutes
  
  return availableTimeSlots.value.filter(slot => {
    const [hours, minutes] = slot.split(':').map(Number)
    const slotTime = hours * 60 + (minutes || 0) // Slot time in minutes
    return slotTime > currentTime // Only include slots that are in the future
  })
})

const maxGifts = ref(null)
const maxGiftsReached = ref(false)
const checkingMaxGifts = ref(false)

// Watch selectedDate and fetch time slots
watch(selectedDate, async (newDate) => {
  if (newDate && dateAvailable.value) {
    loadingSlots.value = true
    try {
      availableTimeSlots.value = await getAvailableTimeSlots(newDate)
    } catch (error) {
      console.error('Error fetching time slots:', error)
      availableTimeSlots.value = []
    } finally {
      loadingSlots.value = false
    }
  } else {
    availableTimeSlots.value = []
  }
  // Reset max gifts when date changes
  maxGifts.value = null
  maxGiftsReached.value = false
}, { immediate: false })

// Watch for time and total item count to calculate max gifts
watch([selectedTime, totalItemCount], async ([newTime, newCount]) => {
  if (newTime && selectedDate.value && selectedServiceType.value) {
    checkingMaxGifts.value = true
    try {
      const { executeQuery } = useGraphQL()
      // Use the first pricing item's name as service identifier, or use service type
      const serviceName = filteredPricing.value[0]?.name || selectedServiceType.value
      const query = `
        query {
          maxGiftsForTimeSlot(date: "${selectedDate.value}", time: "${newTime}", service: "${serviceName}")
        }
      `
      const data = await executeQuery(query)
      maxGifts.value = data.maxGiftsForTimeSlot || null
      
      // If current quantity exceeds max, cap it
      if (maxGifts.value && newCount > maxGifts.value) {
        // Reduce item counts proportionally
        const ratio = maxGifts.value / newCount
        for (const pricingId in itemCounts.value) {
          itemCounts.value[pricingId] = Math.floor(itemCounts.value[pricingId] * ratio)
        }
        form.value.numberOfGifts = totalItemCount.value
        maxGiftsReached.value = true
      } else if (maxGifts.value && newCount === maxGifts.value) {
        maxGiftsReached.value = true
      } else {
        maxGiftsReached.value = false
      }
    } catch (error) {
      console.error('Error fetching max gifts:', error)
      maxGifts.value = null
      maxGiftsReached.value = false
    } finally {
      checkingMaxGifts.value = false
    }
  } else {
    maxGifts.value = null
    maxGiftsReached.value = false
  }
})

const canSubmit = computed(() => {
  return selectedServiceType.value &&
         totalItemCount.value > 0 &&
         selectedDate.value &&
         selectedTime.value &&
         form.value.firstName &&
         form.value.lastName &&
         form.value.email &&
         form.value.phone &&
         form.value.address
})

watch(selectedDate, async (newDate) => {
  form.value.date = newDate
  selectedTime.value = ''
  form.value.time = ''
  availableTimeSlots.value = [] // Clear time slots when date changes
  
  // Check availability when date changes
  if (newDate) {
    checkingAvailability.value = true
    try {
      dateAvailable.value = await isDateAvailable(newDate)
      console.log(`Date ${newDate} availability:`, dateAvailable.value)
    } catch (error) {
      console.error('Error checking availability:', error)
      dateAvailable.value = false
    } finally {
      checkingAvailability.value = false
    }
  } else {
    dateAvailable.value = true
  }
})

watch(selectedTime, (newTime) => {
  form.value.time = newTime
})

const getServiceName = (serviceId) => {
  const service = services.value.find(s => s.id === serviceId)
  if (!service) return ''
  const priceSuffix = service.priceType === 'per-hour' ? '/hr' : ''
  return `${service.name} ($${service.price}${priceSuffix})`
}

const calculateTotal = () => {
  let total = 0
  
  // Calculate total from item counts
  for (const [pricingId, count] of Object.entries(itemCounts.value)) {
    if (count > 0) {
      const pricingItem = pricing.value.find(p => p.id === pricingId)
      if (pricingItem) {
        if (pricingItem.priceType === 'per-hour') {
          total += pricingItem.price * Math.max(1, Math.ceil(count / 5)) // Assume 5 items per hour
        } else {
          total += pricingItem.price * count
        }
      }
    }
  }
  
  // Only add delivery fee if serviceCategory is "delivery" and total < 50
  if (selectedServiceType.value === 'delivery' && total < 50) {
    total += 15
  }
  
  return total.toFixed(2)
}

const openDatePicker = () => {
  // Focus the input and trigger the native date picker
  if (dateInput.value) {
    dateInput.value.focus()
    // For some browsers, we need to trigger a click on the input to open the picker
    // The focus should be enough, but we can also try showPicker() if available
    if (dateInput.value.showPicker) {
      try {
        dateInput.value.showPicker()
      } catch (error) {
        // showPicker() might not be supported in all browsers
        // Fall back to just focusing
      }
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed
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

const closeModal = () => {
  emit('close')
  // Reset form when closing
  form.value = {
    service: '',
    date: '',
    time: '',
    numberOfGifts: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  }
  selectedDate.value = ''
  selectedTime.value = ''
  selectedServiceType.value = null
  itemCounts.value = {}
  maxGifts.value = null
  maxGiftsReached.value = false
  // Reset submission state
  submitting.value = false
  progressPercent.value = 0
  progressStatus.value = 'Submitting booking...'
  progressMessage.value = 'Please wait while we process your request'
  // Restore body scroll
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  progressPercent.value = 0
  progressStatus.value = 'Submitting booking...'
  progressMessage.value = 'Please wait while we process your request'
  
  try {
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (progressPercent.value < 70) {
        progressPercent.value += 10
      }
    }, 200)
    
    // Update status messages
    setTimeout(() => {
      progressStatus.value = 'Saving to database...'
      progressMessage.value = 'Storing your booking information'
    }, 500)
    
    setTimeout(() => {
      progressStatus.value = 'Finalizing...'
      progressMessage.value = 'Almost done!'
    }, 1000)
    
    // Use the first pricing item's ID as the service identifier
    // This ensures PaymentModal can fetch the pricing details correctly
    const primaryPricing = filteredPricing.value[0]
    const serviceId = primaryPricing?.id || selectedServiceType.value
    
    // Prepare booking data but DON'T create it yet - wait for payment
    const bookingData = {
      ...form.value,
      service: serviceId, // Store pricing ID instead of name for consistency
      date: selectedDate.value,
      numberOfGifts: totalItemCount.value,
      time: selectedTime.value
    }
    
    clearInterval(progressInterval)
    progressPercent.value = 100
    progressStatus.value = 'Ready for Payment'
    progressMessage.value = 'Preparing payment...'
    
    // Wait to show success state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Calculate total for payment
    const total = parseFloat(calculateTotal())
    
    // Emit event with booking DATA (not created booking) and total - parent will show payment modal
    // The booking will be created AFTER payment is successful
    emit('booking-created', {
      bookingData, // Changed from 'booking' to 'bookingData' - not yet created
      total,
      itemCounts: { ...itemCounts.value } // Include item counts for work order creation
    })
    
    // Close booking modal - payment modal will open next
    closeModal()
  } catch (error) {
    console.error('Booking error:', error)
    progressStatus.value = 'Error'
    progressMessage.value = 'There was an error processing your booking'
    
    setTimeout(() => {
      alert('There was an error processing your booking. Please try again.')
      submitting.value = false
      progressPercent.value = 0
    }, 1500)
  }
}

// Close on Escape key and manage body scroll
watch(() => props.isOpen, async (isOpen) => {
  if (typeof window !== 'undefined') {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      
      // Set initial date and time if provided
      if (props.initialDate) {
        selectedDate.value = props.initialDate
        form.value.date = props.initialDate
        // Check availability for the initial date
        checkingAvailability.value = true
        try {
          dateAvailable.value = await isDateAvailable(props.initialDate)
          if (dateAvailable.value) {
            // Fetch time slots for the initial date
            loadingSlots.value = true
            try {
              availableTimeSlots.value = await getAvailableTimeSlots(props.initialDate)
            } catch (error) {
              console.error('Error fetching time slots:', error)
              availableTimeSlots.value = []
            } finally {
              loadingSlots.value = false
            }
          }
        } catch (error) {
          console.error('Error checking availability:', error)
          dateAvailable.value = false
        } finally {
          checkingAvailability.value = false
        }
      }
      
      if (props.initialTime && props.initialDate && dateAvailable.value) {
        selectedTime.value = props.initialTime
        form.value.time = props.initialTime
      }
      
      // Reset state when opening modal
      submitting.value = false
      progressPercent.value = 0
      progressStatus.value = 'Submitting booking...'
      progressMessage.value = 'Please wait while we process your request'
      
      // Fetch services if not already loaded
      if (services.value.length === 0) {
        fetchServices()
      }
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeModal()
        }
      }
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    } else {
      // Reset state when closing modal
      submitting.value = false
      progressPercent.value = 0
      progressStatus.value = 'Submitting booking...'
      progressMessage.value = 'Please wait while we process your request'
      document.body.style.overflow = ''
    }
  }
})

onMounted(() => {
  fetchServices()
})
</script>

<style scoped>
/* Date input styling with custom calendar color */
.date-input {
  --calendar-color: #5D8FB0;
}

.date-input:focus {
  outline: none;
  border-color: var(--calendar-color);
  box-shadow: 0 0 0 2px var(--calendar-color);
}

/* Style the calendar icon */
.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: brightness(0) saturate(100%) invert(48%) sepia(15%) saturate(1200%) hue-rotate(170deg) brightness(95%) contrast(85%);
}

.date-input::-webkit-calendar-picker-indicator:hover {
  filter: brightness(0) saturate(100%) invert(48%) sepia(15%) saturate(1200%) hue-rotate(170deg) brightness(110%) contrast(85%);
}

/* For Firefox */
.date-input::-moz-calendar-picker-indicator {
  cursor: pointer;
  filter: brightness(0) saturate(100%) invert(48%) sepia(15%) saturate(1200%) hue-rotate(170deg) brightness(95%) contrast(85%);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

