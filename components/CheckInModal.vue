<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Check In Items{{ selectedBooking ? ` - ${selectedBooking.name}` : '' }}
              </h2>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Booking Search (if no booking provided) -->
              <div v-if="!booking" class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search for Booking
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Booking ID, name, email, or phone"
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    @keyup.enter="searchBooking"
                    :disabled="searching"
                  />
                  <button 
                    @click="searchBooking" 
                    class="btn-primary"
                    :disabled="searching || !searchQuery.trim()"
                  >
                    {{ searching ? 'Searching...' : 'Search' }}
                  </button>
                </div>
                <p v-if="searchError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                  {{ searchError }}
                </p>
                <div v-if="searchResults.length > 0" class="mt-2 space-y-2">
                  <button
                    v-for="result in searchResults"
                    :key="result.id"
                    @click="selectBooking(result)"
                    class="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div class="font-semibold text-gray-900 dark:text-white">{{ result.name }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">{{ result.email }} • {{ result.phone }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-500">Booking ID: {{ result.id }}</div>
                  </button>
                </div>
              </div>

              <!-- Booking Info -->
              <div v-if="selectedBooking" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Customer:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedBooking.name }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedBooking.email }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Phone:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedBooking.phone }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Service:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedBooking.service }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Expected Items:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedBooking.numberOfGifts }}</span>
                  </div>
                </div>
              </div>

              <!-- Items List -->
              <div v-if="selectedBooking" class="mb-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Items ({{ items.length }}/{{ selectedBooking?.numberOfGifts || 0 }})
                  </h3>
                  <button
                    @click="addItem"
                    class="btn-primary flex items-center gap-2"
                    :disabled="items.length >= (selectedBooking?.numberOfGifts || 0)"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div class="space-y-4">
                  <div
                    v-for="(item, index) in items"
                    :key="index"
                    class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <h4 class="font-semibold text-gray-900 dark:text-white">
                        Item {{ index + 1 }}
                      </h4>
                      <button
                        @click="removeItem(index)"
                        class="text-red-600 hover:text-red-800"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Description *
                        </label>
                        <input
                          v-model="item.description"
                          type="text"
                          placeholder="e.g., iPhone 15 Pro"
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Size
                        </label>
                        <div class="flex gap-2">
                          <select
                            v-model="item.size"
                            :disabled="!item.hasSizeDiscrepancy"
                            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                          >
                            <option value="">Select size</option>
                            <option value="XSmall">XSmall</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                            <option value="XLarge">XLarge</option>
                          </select>
                          <button
                            v-if="!item.hasSizeDiscrepancy"
                            @click="item.hasSizeDiscrepancy = true"
                            type="button"
                            class="px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                          >
                            Wrong Size
                          </button>
                          <button
                            v-else
                            @click="item.hasSizeDiscrepancy = false; item.isLargerThanPaidSize = false; item.isSmallerThanPaidSize = false"
                            type="button"
                            class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Correct Size
                          </button>
                        </div>
                      </div>

                      <div class="md:col-span-2">
                        <label class="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            v-model="item.isExpensiveElectronics"
                            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Expensive Electronics (requires serial number)
                          </span>
                        </label>
                      </div>

                      <div v-if="item.isExpensiveElectronics" class="md:col-span-2">
                        <SerialNumberScanner
                          @serial-scanned="(serial) => item.serialNumber = serial"
                          @photo-captured="(photo) => item.serialNumberPhoto = photo"
                        />
                      </div>

                      <!-- Size Adjustment Checkboxes (only shown when Wrong Size is clicked) -->
                      <div v-if="item.hasSizeDiscrepancy" class="md:col-span-2 space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <label class="flex items-center gap-2">
                          <input
                            type="checkbox"
                            v-model="item.isLargerThanPaidSize"
                            :disabled="item.isSmallerThanPaidSize"
                            @change="handleLargerThanPaidSizeChange(item)"
                            class="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 disabled:opacity-50"
                          />
                          <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">
                            Item is larger than paid size (charge more)
                          </span>
                        </label>
                        <label class="flex items-center gap-2">
                          <input
                            type="checkbox"
                            v-model="item.isSmallerThanPaidSize"
                            :disabled="item.isLargerThanPaidSize"
                            @change="handleSmallerThanPaidSizeChange(item)"
                            class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                          />
                          <span class="text-sm font-semibold text-green-700 dark:text-green-400">
                            Item is smaller than paid size (charge less)
                          </span>
                        </label>
                      </div>

                      <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Special Instructions
                        </label>
                        <textarea
                          v-model="item.specialInstructions"
                          rows="2"
                          placeholder="Any special wrapping instructions..."
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        ></textarea>
                      </div>

                      <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Wrapping Style
                        </label>
                        <select
                          v-model="item.wrappingStyle"
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select style</option>
                          <option value="Elegant">Elegant</option>
                          <option value="Festive">Festive</option>
                          <option value="Minimal">Minimal</option>
                          <option value="Luxury">Luxury</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button @click="close" class="btn-secondary">
                Cancel
              </button>
              <button
                @click="handleCheckIn"
                class="btn-primary"
                :disabled="saving || !canCheckIn"
              >
                {{ saving ? 'Checking In...' : 'Check In Items' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGraphQL } from '~/composables/useGraphQL'
import SerialNumberScanner from './SerialNumberScanner.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'checked-in', 'payment-adjustment'])

const { executeQuery } = useGraphQL()
const saving = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const searchError = ref('')
const selectedBooking = ref(props.booking)
const pricingCache = ref(null)

const items = ref([])

watch(() => props.booking, async (newBooking) => {
  selectedBooking.value = newBooking
  if (newBooking && newBooking.numberOfGifts) {
    items.value = []
    const defaultSize = await getSizeFromService(newBooking.service)
    for (let i = 0; i < newBooking.numberOfGifts; i++) {
      addItem(defaultSize)
    }
  }
}, { immediate: true })

const searchBooking = async () => {
  if (!searchQuery.value.trim()) {
    searchError.value = 'Please enter a search term'
    return
  }
  
  searching.value = true
  searchError.value = ''
  searchResults.value = []
  
  try {
    const query = `
      query {
        bookings {
          id
          name
          email
          phone
          service
          date
          time
          numberOfGifts
          status
        }
      }
    `
    
    console.log('Searching for booking:', searchQuery.value)
    const data = await executeQuery(query)
    console.log('Search response:', data)
    
    const allBookings = data.bookings || []
    console.log('All bookings:', allBookings.length)
    
    const queryLower = searchQuery.value.toLowerCase().trim()
    const filtered = allBookings.filter((b) => {
      const matches = 
        (b.id && b.id.toLowerCase().includes(queryLower)) ||
        (b.name && b.name.toLowerCase().includes(queryLower)) ||
        (b.email && b.email.toLowerCase().includes(queryLower)) ||
        (b.phone && b.phone.includes(queryLower))
      return matches
    })
    
    console.log('Filtered results:', filtered.length)
    searchResults.value = filtered.slice(0, 5) // Limit to 5 results
    
    if (searchResults.value.length === 0) {
      searchError.value = 'No bookings found matching your search'
    }
  } catch (error) {
    console.error('Search error:', error)
    searchError.value = error.message || 'Failed to search bookings. Please try again.'
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

  // Fetch pricing cache if not already loaded
  const loadPricingCache = async () => {
    if (pricingCache.value) return pricingCache.value
    
    try {
      const query = `
        query {
          pricing(active: true) {
            id
            name
          }
        }
      `
      const data = await executeQuery(query)
      pricingCache.value = data.pricing || []
      return pricingCache.value
    } catch (error) {
      console.error('Error fetching pricing for size mapping:', error)
      return []
    }
  }

  // Map service name/ID to size
  const getSizeFromService = async (serviceValue) => {
    if (!serviceValue) return ''
    
    // Load pricing cache
    const pricing = await loadPricingCache()
    
    // Try to find by ID first
    let pricingItem = pricing.find(p => p.id === serviceValue)
    
    // If not found by ID, try by name
    if (!pricingItem) {
      pricingItem = pricing.find(p => p.name === serviceValue)
    }
    
    // If found, use the name
    if (pricingItem) {
      serviceValue = pricingItem.name
    }
    
    // Service names match pricing tier names: XSmall, Small, Medium, Large / Odd, Extra-Large / Fragile
    const serviceLower = serviceValue.toLowerCase()
    
    if (serviceLower.includes('xsmall') || serviceLower.includes('extra-small')) {
      return 'XSmall'
    } else if (serviceLower.includes('small') && !serviceLower.includes('extra')) {
      return 'Small'
    } else if (serviceLower.includes('medium')) {
      return 'Medium'
    } else if (serviceLower.includes('large') || serviceLower.includes('odd')) {
      return 'Large'
    } else if (serviceLower.includes('extra-large') || serviceLower.includes('fragile')) {
      return 'XLarge'
    }
    
    // Default fallback - try to extract from service name
    if (serviceValue.includes('XSmall')) return 'XSmall'
    if (serviceValue.includes('Small')) return 'Small'
    if (serviceValue.includes('Medium')) return 'Medium'
    if (serviceValue.includes('Large')) return 'Large'
    if (serviceValue.includes('Extra-Large') || serviceValue.includes('Fragile')) return 'XLarge'
    
    return ''
  }

  const selectBooking = async (booking) => {
    selectedBooking.value = booking
    searchQuery.value = ''
    searchResults.value = []
    items.value = []
    
    // Get the default size from the booking service
    const defaultSize = await getSizeFromService(booking.service)
    
    if (booking.numberOfGifts) {
      for (let i = 0; i < booking.numberOfGifts; i++) {
        addItem(defaultSize)
      }
    }
  }

const canCheckIn = computed(() => {
  return items.value.length > 0 && 
         items.value.every(item => item.description && item.description.trim())
})

const addItem = (defaultSize = '') => {
  items.value.push({
    description: '',
    size: defaultSize,
    photos: [],
    serialNumber: '',
    serialNumberPhoto: '',
    specialInstructions: '',
    wrappingStyle: '',
    isExpensiveElectronics: false,
    hasSizeDiscrepancy: false,
    isLargerThanPaidSize: false,
    isSmallerThanPaidSize: false
  })
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

const handleLargerThanPaidSizeChange = (item) => {
  if (item.isLargerThanPaidSize) {
    item.isSmallerThanPaidSize = false
  }
}

const handleSmallerThanPaidSizeChange = (item) => {
  if (item.isSmallerThanPaidSize) {
    item.isLargerThanPaidSize = false
  }
}

// Calculate price adjustment based on size discrepancies
const calculatePriceAdjustment = async () => {
  if (!selectedBooking.value) {
    return { amount: 0, details: [] }
  }

  try {
    // Fetch pricing data
    const pricingQuery = `
      query {
        pricing(active: true) {
          id
          name
          price
        }
      }
    `
    const pricingData = await executeQuery(pricingQuery)
    const pricing = pricingData.pricing || []
    
    // Get the original service pricing
    const originalService = pricing.find(p => p.id === selectedBooking.value.service || p.name === selectedBooking.value.service)
    const originalPrice = originalService?.price || 0
    
    let totalAdjustment = 0
    const adjustmentDetails = []
    
    // Calculate adjustment for each item
    for (const item of items.value) {
      if (item.isLargerThanPaidSize && item.size) {
        // Item is larger - charge the difference
        const newSizePricing = pricing.find(p => p.name === item.size)
        if (newSizePricing) {
          const difference = newSizePricing.price - originalPrice
          totalAdjustment += difference
          adjustmentDetails.push({
            itemNumber: items.value.indexOf(item) + 1,
            description: item.description,
            originalSize: originalService?.name || selectedBooking.value.service,
            newSize: item.size,
            originalPrice,
            newPrice: newSizePricing.price,
            difference,
            type: 'larger'
          })
        }
      } else if (item.isSmallerThanPaidSize && item.size) {
        // Item is smaller - refund the difference
        const newSizePricing = pricing.find(p => p.name === item.size)
        if (newSizePricing) {
          const difference = originalPrice - newSizePricing.price
          totalAdjustment -= difference // Negative for refund
          adjustmentDetails.push({
            itemNumber: items.value.indexOf(item) + 1,
            description: item.description,
            originalSize: originalService?.name || selectedBooking.value.service,
            newSize: item.size,
            originalPrice,
            newPrice: newSizePricing.price,
            difference: -difference, // Negative for display
            type: 'smaller'
          })
        }
      }
    }
    
    return {
      amount: totalAdjustment,
      details: adjustmentDetails,
      originalTotal: originalPrice * items.value.length,
      adjustedTotal: (originalPrice * items.value.length) + totalAdjustment
    }
  } catch (error) {
    console.error('Error calculating price adjustment:', error)
    return { amount: 0, details: [] }
  }
}

const handleCheckIn = async () => {
  if (!canCheckIn.value || !selectedBooking.value) return

  saving.value = true
  try {
    // First, check in the booking
    const checkInMutation = `
      mutation CheckInBooking($input: CheckInBookingInput!) {
        checkInBooking(input: $input) {
          id
          currentStage
          checkedInAt
        }
      }
    `
    
    await executeQuery(checkInMutation, {
      input: {
        bookingId: selectedBooking.value.id,
        checkedInBy: 'current-worker-id' // TODO: Get from auth
      }
    })

    // Then, add each item
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]
      const addItemMutation = `
        mutation AddBookingItem($input: AddBookingItemInput!) {
          addBookingItem(input: $input) {
            id
            itemNumber
            description
            serialNumber
          }
        }
      `
      
      await executeQuery(addItemMutation, {
        input: {
          bookingId: selectedBooking.value.id,
          itemNumber: i + 1,
          description: item.description,
          size: item.size,
          photos: item.photos,
          serialNumber: item.serialNumber || null,
          serialNumberPhoto: item.serialNumberPhoto || null,
          specialInstructions: item.specialInstructions || null,
          wrappingStyle: item.wrappingStyle || null,
          isExpensiveElectronics: item.isExpensiveElectronics || false,
          isLargerThanPaidSize: item.isLargerThanPaidSize || false,
          isSmallerThanPaidSize: item.isSmallerThanPaidSize || false
        }
      })
    }

    // Calculate price adjustments for size discrepancies
    const priceAdjustment = await calculatePriceAdjustment()
    
    console.log('Price adjustment calculated:', priceAdjustment)
    console.log('Adjustment amount:', priceAdjustment.amount)
    
    if (priceAdjustment.amount !== 0) {
      // Emit payment adjustment event with details
      const adjustmentData = {
        booking: selectedBooking.value,
        adjustment: priceAdjustment,
        items: items.value
      }
      console.log('Emitting payment-adjustment event:', adjustmentData)
      emit('payment-adjustment', adjustmentData)
      // Don't close yet - wait for payment adjustment to be handled
    } else {
      // No adjustment needed, proceed normally
      console.log('No price adjustment needed, closing normally')
      emit('checked-in')
      close()
    }
  } catch (error) {
    console.error('Check-in error:', error)
    alert('Failed to check in items. Please try again.')
  } finally {
    saving.value = false
  }
}

const close = () => {
  items.value = []
  selectedBooking.value = null
  searchQuery.value = ''
  searchResults.value = []
  emit('close')
}
</script>

