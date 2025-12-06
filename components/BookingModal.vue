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
                <!-- Service Selection -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Service Type *
                  </label>
                  <div class="grid md:grid-cols-3 gap-4">
                    <ServiceOption
                      v-for="service in services"
                      :key="service.id"
                      :service="service"
                      :selected="form.service === service.id"
                      @select="form.service = service.id"
                    />
                  </div>
                </div>

                <!-- Date Selection -->
                <div>
                  <label for="date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Date *
                  </label>
                  <input
                    id="date"
                    v-model="selectedDate"
                    type="date"
                    :min="minDate"
                    required
                    @change="selectedTime = ''"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p v-if="selectedDate" class="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                    {{ formatDate(selectedDate) }}
                  </p>
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

                <!-- Time Selection -->
                <div v-if="selectedDate && dateAvailable && !checkingAvailability">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Time *
                  </label>
                  <div v-if="loadingSlots" class="text-sm text-gray-500 dark:text-gray-400">
                    Loading available time slots...
                  </div>
                  <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <button
                      v-for="slot in availableTimeSlots"
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
                  <p v-if="!loadingSlots && availableTimeSlots.length === 0" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No available time slots for this date.
                  </p>
                </div>

                <!-- Number of Gifts -->
                <div>
                  <label for="gifts" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Gifts *
                  </label>
                  <input
                    id="gifts"
                    v-model.number="form.numberOfGifts"
                    type="number"
                    :min="1"
                    :max="maxGifts"
                    required
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p v-if="maxGiftsReached" class="mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Sorry, that's the max for the day at this time slot.
                  </p>
                </div>

                <!-- Contact Information -->
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="John Doe"
                    />
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

                <div class="grid md:grid-cols-2 gap-6">
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

                <!-- Special Instructions -->
                <div>
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

                <!-- Price Summary -->
                <div v-if="form.service" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-300">Service:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">{{ getServiceName(form.service) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-300">Number of Gifts:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">{{ form.numberOfGifts || 0 }}</span>
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
  }
})

const emit = defineEmits(['close', 'booking-created'])

const { createBooking, getAvailableTimeSlots, isDateAvailable } = useBookings()
const router = useRouter()

const services = ref([])

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
        }
      }
    `
    const data = await executeQuery(query)
    console.log('Fetched pricing data:', data.pricing)
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
    services.value = [
      { id: 'basic', name: 'Basic', price: 8, description: 'Small gifts', priceType: 'per-item' },
      { id: 'premium', name: 'Premium', price: 12, description: 'Medium gifts', priceType: 'per-item' },
      { id: 'unlimited', name: 'Unlimited', price: 50, description: 'Per hour', priceType: 'per-hour' }
    ]
  }
}

const form = ref({
  service: '',
  date: '',
  time: '',
  numberOfGifts: 1,
  name: '',
  email: '',
  phone: '',
  address: '',
  message: ''
})

const selectedDate = ref('')
const selectedTime = ref('')
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

// Watch for time and service selection to calculate max gifts
watch([selectedTime, () => form.value.service], async ([newTime, newServiceId]) => {
  if (newTime && newServiceId && selectedDate.value) {
    // Get service name from service ID
    const service = services.value.find(s => s.id === newServiceId)
    if (!service) {
      maxGifts.value = null
      maxGiftsReached.value = false
      return
    }
    
    checkingMaxGifts.value = true
    try {
      const { executeQuery } = useGraphQL()
      const query = `
        query {
          maxGiftsForTimeSlot(date: "${selectedDate.value}", time: "${newTime}", service: "${service.name}")
        }
      `
      const data = await executeQuery(query)
      maxGifts.value = data.maxGiftsForTimeSlot || null
      
      // If current quantity exceeds max, cap it
      if (maxGifts.value && form.value.numberOfGifts > maxGifts.value) {
        form.value.numberOfGifts = maxGifts.value
        maxGiftsReached.value = true
      } else if (maxGifts.value && form.value.numberOfGifts === maxGifts.value) {
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

// Watch numberOfGifts to check if it exceeds max
watch(() => form.value.numberOfGifts, (newQuantity) => {
  if (maxGifts.value && newQuantity > maxGifts.value) {
    form.value.numberOfGifts = maxGifts.value
    maxGiftsReached.value = true
  } else if (maxGifts.value && newQuantity === maxGifts.value) {
    maxGiftsReached.value = true
  } else {
    maxGiftsReached.value = false
  }
})

const canSubmit = computed(() => {
  return form.value.service &&
         selectedDate.value &&
         selectedTime.value &&
         form.value.name &&
         form.value.email &&
         form.value.phone &&
         form.value.address &&
         form.value.numberOfGifts > 0
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
  if (!form.value.service) return '0.00'
  const service = services.value.find(s => s.id === form.value.service)
  if (!service) return '0.00'
  
  let total = 0
  if (service.priceType === 'per-hour') {
    total = service.price
  } else if (service.priceType === 'fixed') {
    total = service.price
  } else {
    total = service.price * form.value.numberOfGifts
  }
  
  // Only add delivery fee if serviceCategory is "delivery"
  if (service.serviceCategory === 'delivery' && total < 50) {
    total += 15
  }
  
  return total.toFixed(2)
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
    name: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  }
  selectedDate.value = ''
  selectedTime.value = ''
  maxGifts.value = null
  maxGiftsReached.value = false
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
    
    const booking = await createBooking({
      ...form.value,
      date: selectedDate.value,
      time: selectedTime.value
    })
    
    clearInterval(progressInterval)
    progressPercent.value = 100
    progressStatus.value = 'Success!'
    progressMessage.value = 'Your booking has been confirmed'
    
    // Wait to show success state
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Calculate total for payment
    const total = parseFloat(calculateTotal())
    
    // Emit event with booking data and total - parent will show payment modal
    emit('booking-created', {
      booking,
      total
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
watch(() => props.isOpen, (isOpen) => {
  if (typeof window !== 'undefined') {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      
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
      document.body.style.overflow = ''
    }
  }
})

onMounted(() => {
  fetchServices()
})
</script>

<style scoped>
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

