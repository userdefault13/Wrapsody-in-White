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
                Check In Items{{ selectedBooking ? ` - ${selectedBooking.name || `${selectedBooking.firstName || ''} ${selectedBooking.lastName || ''}`.trim()}` : '' }}
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
                    class="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900 dark:text-white">{{ result.name || `${result.firstName || ''} ${result.lastName || ''}`.trim() || 'N/A' }}</div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ result.email }} • {{ result.phone }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">Booking ID: {{ result.id }}</div>
                      </div>
                      <div class="flex-shrink-0">
                        <span :class="getStatusClass(result.status)">
                          {{ getStatusLabel(result.status) }}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Booking Info -->
              <div v-if="selectedBooking" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Booking ID:</span>
                    <span class="ml-2 text-gray-900 dark:text-white font-mono text-xs">{{ selectedBooking.id }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Customer:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedBooking.name || `${selectedBooking.firstName || ''} ${selectedBooking.lastName || ''}`.trim() || 'N/A' }}</span>
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
                            Change
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

                      <!-- Box Dimension Selection -->
                      <div v-if="item.size && !item.hasSizeDiscrepancy" class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Select Box Dimension *
                        </label>
                        <div v-if="loadingBoxDimensions[index]" class="text-sm text-gray-500 dark:text-gray-400 py-2">
                          Loading box dimensions...
                        </div>
                        <div v-else-if="itemBoxDimensions[index] && itemBoxDimensions[index].length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <button
                            v-for="dimension in itemBoxDimensions[index]"
                            :key="dimension.id"
                            @click="item.boxDimensionId = dimension.id"
                            :class="[
                              'p-3 rounded-lg border-2 transition-all text-left',
                              item.boxDimensionId === dimension.id
                                ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-700'
                            ]"
                          >
                            <div class="flex items-start justify-between mb-1">
                              <span class="font-semibold text-sm text-gray-900 dark:text-white">
                                {{ getDimensionLabel(dimension) }}
                              </span>
                              <svg
                                v-if="item.boxDimensionId === dimension.id"
                                class="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                              <div>{{ dimension.length }} × {{ dimension.width }} × {{ dimension.height }} in</div>
                              <div class="mt-0.5">Paper: {{ dimension.wrappingPaperNeeded.toFixed(1) }} sq in</div>
                            </div>
                          </button>
                        </div>
                        <div v-else-if="item.size" class="text-sm text-gray-500 dark:text-gray-400 py-2">
                          No box dimensions available for this size
                        </div>
                        <p v-if="!item.boxDimensionId && item.size && !item.hasSizeDiscrepancy" class="text-xs text-red-600 dark:text-red-400 mt-1">
                          Please select a box dimension
                        </p>
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          From
                        </label>
                        <input
                          v-model="item.giftFrom"
                          type="text"
                          placeholder="Who is this gift from?"
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          To
                        </label>
                        <input
                          v-model="item.giftTo"
                          type="text"
                          placeholder="Who is this gift for?"
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
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
import { useAuth } from '~/composables/useAuth'
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

const emit = defineEmits(['close', 'checked-in', 'payment-adjustment', 'show-summary'])

const { executeQuery } = useGraphQL()
const { walletAddress } = useAuth()
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
          firstName
          lastName
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
      const fullName = b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim()
      const matches = 
        (b.id && b.id.toLowerCase().includes(queryLower)) ||
        (fullName && fullName.toLowerCase().includes(queryLower)) ||
        (b.firstName && b.firstName.toLowerCase().includes(queryLower)) ||
        (b.lastName && b.lastName.toLowerCase().includes(queryLower)) ||
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
    // Check if booking has already been checked in
    const checkIfCheckedIn = `
      query CheckIfCheckedIn($bookingId: ID!) {
        workOrders(bookingId: $bookingId) {
          id
          items {
            id
            status
          }
        }
      }
    `
    
    try {
      const checkResult = await executeQuery(checkIfCheckedIn, { bookingId: booking.id })
      const workOrders = checkResult.workOrders || []
      
      // Check if any items have been checked in (status != 'pending_checkin')
      const hasCheckedInItems = workOrders.some(wo => 
        wo.items && wo.items.some(item => 
          item.status && item.status !== 'pending_checkin'
        )
      )
      
      if (hasCheckedInItems) {
        // Show read-only summary modal instead
        emit('show-summary', booking)
        return
      }
    } catch (error) {
      console.warn('Could not check if booking is already checked in:', error)
      // Continue with normal flow if check fails
    }
    
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
         items.value.every(item => {
           const hasDescription = item.description && item.description.trim()
           // Box dimension is required if size is set and there's no size discrepancy
           const hasBoxDimension = item.hasSizeDiscrepancy || item.boxDimensionId || !item.size
           return hasDescription && hasBoxDimension
         })
})

const itemBoxDimensions = ref({}) // { index: [dimensions] }
const loadingBoxDimensions = ref({}) // { index: boolean }

const getDimensionLabel = (dimension) => {
  // Extract the number from the ID (e.g., "boxdim-xsmall-1" -> "xsmall-1")
  const match = dimension.id.match(/boxdim-(\w+)-(\d+)/)
  if (match) {
    const sizeName = match[1]
    const number = match[2]
    return `${sizeName}-${number}`
  }
  return dimension.id
}

const loadBoxDimensionsForItem = async (itemIndex, sizeString) => {
  if (!sizeString) {
    itemBoxDimensions.value[itemIndex] = []
    return
  }

  loadingBoxDimensions.value[itemIndex] = true
  
  try {
    // First, get the sizeId from the size string
    const sizesQuery = `
      query {
        sizes(active: true) {
          id
          name
          displayName
        }
      }
    `
    const sizesData = await executeQuery(sizesQuery)
    const sizes = sizesData.sizes || []
    
    // Map size string to sizeId
    const sizeMap = {
      'XSmall': ['xsmall', 'x-small', 'extra-small'],
      'Small': ['small'],
      'Medium': ['medium'],
      'Large': ['large'],
      'XLarge': ['xl', 'x-large', 'extra-large']
    }
    
    const sizeKey = Object.keys(sizeMap).find(key => 
      sizeString.toLowerCase().includes(key.toLowerCase())
    )
    
    let sizeId = null
    if (sizeKey) {
      const matchingSizeNames = sizeMap[sizeKey]
      const matchingSize = sizes.find(s => 
        matchingSizeNames.some(name => 
          s.name.toLowerCase() === name.toLowerCase() || 
          s.displayName.toLowerCase().includes(name.toLowerCase())
        )
      )
      if (matchingSize) {
        sizeId = matchingSize.id
      }
    }
    
    // Fallback: try direct match
    if (!sizeId) {
      const directMatch = sizes.find(s => 
        s.displayName.toLowerCase() === sizeString.toLowerCase() ||
        s.name.toLowerCase() === sizeString.toLowerCase()
      )
      if (directMatch) {
        sizeId = directMatch.id
      }
    }
    
    if (!sizeId) {
      console.warn(`Could not find sizeId for size: ${sizeString}`)
      itemBoxDimensions.value[itemIndex] = []
      return
    }
    
    // Fetch box dimensions for this size
    const boxDimensionsQuery = `
      query GetBoxDimensions($sizeId: ID!) {
        boxDimensions(sizeId: $sizeId, active: true) {
          id
          sizeId
          length
          width
          height
          surfaceArea
          wrappingPaperNeeded
          wasteFactor
        }
      }
    `
    
    const boxDimensionsData = await executeQuery(boxDimensionsQuery, { sizeId })
    itemBoxDimensions.value[itemIndex] = boxDimensionsData.boxDimensions || []
  } catch (error) {
    console.error(`Error loading box dimensions for item ${itemIndex}:`, error)
    itemBoxDimensions.value[itemIndex] = []
  } finally {
    loadingBoxDimensions.value[itemIndex] = false
  }
}

const addItem = (defaultSize = '') => {
  // Auto-populate giftFrom with booking's firstName if available
  const firstName = selectedBooking.value?.firstName || ''
  
  const newItem = {
    description: '',
    size: defaultSize,
    sizeId: null, // Will be set based on size string
    boxDimensionId: null,
    photos: [],
    serialNumber: '',
    serialNumberPhoto: '',
    specialInstructions: '',
    wrappingStyle: '',
    giftFrom: firstName, // Auto-populate with client's first name
    giftTo: '',
    isExpensiveElectronics: false,
    hasSizeDiscrepancy: false,
    isLargerThanPaidSize: false,
    isSmallerThanPaidSize: false
  }
  
  const itemIndex = items.value.length
  items.value.push(newItem)
  
  // Load box dimensions if size is provided
  if (defaultSize) {
    loadBoxDimensionsForItem(itemIndex, defaultSize)
  }
}

// Watch for size changes to load box dimensions
watch(() => items.value.map((item, index) => ({ index, size: item.size, hasDiscrepancy: item.hasSizeDiscrepancy })), 
  async (newValues) => {
    for (const { index, size, hasDiscrepancy } of newValues) {
      if (size && !hasDiscrepancy) {
        await loadBoxDimensionsForItem(index, size)
      } else {
        // Clear box dimensions if size is cleared or has discrepancy
        itemBoxDimensions.value[index] = []
        items.value[index].boxDimensionId = null
      }
    }
  },
  { deep: true }
)

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
    // Validate item count matches numberOfGifts before proceeding
    if (items.value.length !== selectedBooking.value.numberOfGifts) {
      alert(
        `Item count mismatch: Expected ${selectedBooking.value.numberOfGifts} item(s) but you have ${items.value.length} item(s). ` +
        `Please add or remove items to match the expected count.`
      )
      saving.value = false
      return
    }

    // First, check in the booking (this creates a work order)
    const checkInMutation = `
      mutation CheckInBooking($input: CheckInBookingInput!) {
        checkInBooking(input: $input) {
          id
          currentStage
          checkedInAt
          workOrders {
            id
            workOrderNumber
          }
        }
      }
    `
    
    const checkInResult = await executeQuery(checkInMutation, {
      input: {
        bookingId: selectedBooking.value.id,
        checkedInBy: walletAddress.value || 'unknown'
      }
    })
    
    // Get the work order ID from the check-in result
    const workOrderId = checkInResult.checkInBooking.workOrders?.[0]?.id
    if (!workOrderId) {
      throw new Error('Failed to create work order during check-in')
    }

    // Check if items already exist in the work order
    const checkItemsQuery = `
      query GetWorkItems($workOrderId: ID!) {
        workOrder(id: $workOrderId) {
          id
          items {
            id
            itemNumber
          }
        }
      }
    `
    
    let existingItems = []
    try {
      const existingItemsResult = await executeQuery(checkItemsQuery, {
        workOrderId: workOrderId
      })
      existingItems = existingItemsResult.workOrder?.items || []
    } catch (error) {
      console.warn('Could not check for existing items:', error)
    }
    
    // Get the highest item number to continue from
    const maxItemNumber = existingItems.length > 0 
      ? Math.max(...existingItems.map(item => item.itemNumber || 0))
      : 0
    
    // Then, add all items to the work order (starting from the next item number)
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]
      const itemNumber = maxItemNumber + i + 1
      
      // Check if this item number already exists
      const itemExists = existingItems.some(existing => existing.itemNumber === itemNumber)
      if (itemExists) {
        console.warn(`Item number ${itemNumber} already exists, skipping`)
        continue
      }
      
      const addItemMutation = `
        mutation AddWorkItem($input: AddWorkItemInput!) {
          addWorkItem(input: $input) {
            id
            itemNumber
            description
            serialNumber
          }
        }
      `
      
      // Map size string to sizeId by fetching actual sizes from GraphQL
      let sizeId = null
      if (item.size) {
        try {
          // Fetch sizes to get the correct ID
          const sizesQuery = `
            query {
              sizes(active: true) {
                id
                name
                displayName
              }
            }
          `
          const sizesData = await executeQuery(sizesQuery)
          const sizes = sizesData.sizes || []
          
          // Map size string to sizeId
          // Try to match by displayName first, then by name
          const sizeMap = {
            'XSmall': ['xsmall', 'x-small', 'extra-small'],
            'Small': ['small'],
            'Medium': ['medium'],
            'Large': ['large'],
            'XLarge': ['xl', 'x-large', 'extra-large']
          }
          
          const sizeKey = Object.keys(sizeMap).find(key => 
            item.size.toLowerCase().includes(key.toLowerCase())
          )
          
          if (sizeKey) {
            const matchingSizeNames = sizeMap[sizeKey]
            const matchingSize = sizes.find(s => 
              matchingSizeNames.some(name => 
                s.name.toLowerCase() === name.toLowerCase() || 
                s.displayName.toLowerCase().includes(name.toLowerCase())
              )
            )
            if (matchingSize) {
              sizeId = matchingSize.id
            }
          }
          
          // Fallback: try direct match on displayName or name
          if (!sizeId) {
            const directMatch = sizes.find(s => 
              s.displayName.toLowerCase() === item.size.toLowerCase() ||
              s.name.toLowerCase() === item.size.toLowerCase()
            )
            if (directMatch) {
              sizeId = directMatch.id
            }
          }
        } catch (error) {
          console.error('Error fetching sizes for sizeId mapping:', error)
          // Fallback to hardcoded mapping if GraphQL fails
          const sizeMap = {
            'XSmall': 'size-xsmall',
            'Small': 'size-small',
            'Medium': 'size-medium',
            'Large': 'size-large',
            'XLarge': 'size-xl'
          }
          sizeId = sizeMap[item.size] || null
        }
      }
      
      const addItemResult = await executeQuery(addItemMutation, {
        input: {
          workOrderId: workOrderId,
          itemNumber: itemNumber,
          description: item.description,
          sizeId: sizeId,
          photos: item.photos,
          serialNumber: item.serialNumber || null,
          serialNumberPhoto: item.serialNumberPhoto || null,
          specialInstructions: item.specialInstructions || null,
          wrappingStyle: item.wrappingStyle || null,
          giftFrom: item.giftFrom || null,
          giftTo: item.giftTo || null,
          isExpensiveElectronics: item.isExpensiveElectronics || false,
          isLargerThanPaidSize: item.isLargerThanPaidSize || false,
          isSmallerThanPaidSize: item.isSmallerThanPaidSize || false
        }
      })
      
      // Update the work item with boxDimensionId if selected
      if (item.boxDimensionId && addItemResult?.addWorkItem?.id) {
        const updateItemMutation = `
          mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
            updateWorkItem(input: $input) {
              id
              boxDimensionId
            }
          }
        `
        
        await executeQuery(updateItemMutation, {
          input: {
            id: addItemResult.addWorkItem.id,
            boxDimensionId: item.boxDimensionId
          }
        })
      }
    }

    // Update all items in the work order to checked_in status
    const updateItemsToCheckedIn = `
      mutation UpdateWorkItem($input: UpdateWorkItemInput!) {
        updateWorkItem(input: $input) {
          id
          status
          checkedInAt
        }
      }
    `

    // Get all items in the work order that need to be updated
    const allWorkItemsQuery = `
      query GetWorkItems($workOrderId: ID!) {
        workOrder(id: $workOrderId) {
          items {
            id
            status
          }
        }
      }
    `

    const allWorkItemsResult = await executeQuery(allWorkItemsQuery, {
      workOrderId: workOrderId
    })

    // Update all items that are still pending_checkin to checked_in
    if (allWorkItemsResult.workOrder?.items) {
      const itemsToUpdate = allWorkItemsResult.workOrder.items.filter(
        item => item.status === 'pending_checkin'
      )
      
      if (itemsToUpdate.length > 0) {
        const updatePromises = itemsToUpdate.map(item => {
          return executeQuery(updateItemsToCheckedIn, {
            input: {
              id: item.id,
              status: 'checked_in'
            }
          })
        })
        
        await Promise.all(updatePromises)
        console.log(`✅ Updated ${itemsToUpdate.length} items to checked_in status`)
      }
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

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    in_progress: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    ready: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    picked_up: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    delivered: 'px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return classes[status] || classes.pending
}

const close = () => {
  items.value = []
  selectedBooking.value = null
  searchQuery.value = ''
  searchResults.value = []
  emit('close')
}
</script>

