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
            class="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 class="text-2xl font-bold text-gray-900">Book Your Wrapping Service</h2>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 transition-colors"
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
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label for="date" class="block text-sm font-semibold text-gray-700 mb-2">
                    Select Date *
                  </label>
                  <input
                    id="date"
                    v-model="selectedDate"
                    type="date"
                    :min="minDate"
                    required
                    @change="selectedTime = ''"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p v-if="selectedDate && !isDateAvailable(selectedDate)" class="mt-2 text-sm text-red-600">
                    This date is fully booked. Please select another date.
                  </p>
                </div>

                <!-- Time Selection -->
                <div v-if="selectedDate && isDateAvailable(selectedDate)">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Select Time *
                  </label>
                  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2">
                    <button
                      v-for="slot in availableTimeSlots"
                      :key="slot"
                      type="button"
                      :class="[
                        'px-3 py-2 rounded-lg border-2 transition-all text-sm',
                        selectedTime === slot
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      ]"
                      @click="form.time = slot; selectedTime = slot"
                    >
                      {{ formatTime(slot) }}
                    </button>
                  </div>
                  <p v-if="availableTimeSlots.length === 0" class="mt-2 text-sm text-gray-500">
                    No available time slots for this date.
                  </p>
                </div>

                <!-- Number of Gifts -->
                <div>
                  <label for="gifts" class="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Gifts *
                  </label>
                  <input
                    id="gifts"
                    v-model.number="form.numberOfGifts"
                    type="number"
                    min="1"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <!-- Contact Information -->
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      type="tel"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label for="address" class="block text-sm font-semibold text-gray-700 mb-2">
                      Service Address *
                    </label>
                    <input
                      id="address"
                      v-model="form.address"
                      type="text"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="123 Main St, Long Beach, CA"
                    />
                  </div>
                </div>

                <!-- Special Instructions -->
                <div>
                  <label for="message" class="block text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions or Requests
                  </label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any specific wrapping preferences, themes, or special requests..."
                  ></textarea>
                </div>

                <!-- Price Summary -->
                <div v-if="form.service" class="bg-gray-50 rounded-lg p-6">
                  <h3 class="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Service:</span>
                      <span class="font-semibold">{{ getServiceName(form.service) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Number of Gifts:</span>
                      <span class="font-semibold">{{ form.numberOfGifts || 0 }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Date & Time:</span>
                      <span class="font-semibold">
                        {{ formatDate(selectedDate) }} {{ formatTime(selectedTime) }}
                      </span>
                    </div>
                    <div class="border-t border-gray-300 pt-2 mt-2">
                      <div class="flex justify-between text-lg">
                        <span class="font-bold text-gray-900">Total:</span>
                        <span class="font-bold text-primary-600">${{ calculateTotal() }}</span>
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
              <div v-if="submitting" class="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
                <div class="text-center px-8">
                  <!-- Spinner -->
                  <div class="mb-6">
                    <svg class="animate-spin h-16 w-16 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="w-64 mb-4 mx-auto">
                    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
                        :style="{ width: progressPercent + '%' }"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Status Text -->
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ progressStatus }}</h3>
                  <p class="text-gray-600 text-sm">{{ progressMessage }}</p>
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
import { ref, computed, watch } from 'vue'
import { useBookings } from '~/composables/useBookings'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'booking-created'])

const { createBooking, getAvailableTimeSlots, isDateAvailable } = useBookings()
const router = useRouter()

const services = [
  { id: 'basic', name: 'Basic', price: 8, description: 'Small gifts' },
  { id: 'premium', name: 'Premium', price: 12, description: 'Medium gifts' },
  { id: 'unlimited', name: 'Unlimited', price: 50, description: 'Per hour' }
]

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

const availableTimeSlots = computed(() => {
  if (!selectedDate.value) return []
  return getAvailableTimeSlots(selectedDate.value)
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

watch(selectedDate, (newDate) => {
  form.value.date = newDate
  selectedTime.value = ''
  form.value.time = ''
})

watch(selectedTime, (newTime) => {
  form.value.time = newTime
})

const getServiceName = (serviceId) => {
  const service = services.find(s => s.id === serviceId)
  return service ? `${service.name} ($${service.price}${service.id === 'unlimited' ? '/hr' : ''})` : ''
}

const calculateTotal = () => {
  if (!form.value.service) return '0.00'
  const service = services.find(s => s.id === form.value.service)
  if (!service) return '0.00'
  
  let total = 0
  if (service.id === 'unlimited') {
    total = service.price
  } else {
    total = service.price * form.value.numberOfGifts
  }
  
  if (total < 50) {
    total += 15
  }
  
  return total.toFixed(2)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
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
    
    // Wait longer to show success state - give users time to see the confirmation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Booking created, emitting event:', booking)
    console.log('Booking ID:', booking?.id)
    
    // Emit event with booking data - parent will handle navigation
    emit('booking-created', booking)
    
    // Close modal - parent will navigate after modal closes
    closeModal()
    
    console.log('Modal closed, waiting for parent navigation')
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

