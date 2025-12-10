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
            class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Complete Payment</h2>
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
              <!-- Booking Summary -->
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Service:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ bookingSummary.service }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Number of Gifts:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ bookingSummary.numberOfGifts }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Date & Time:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ bookingSummary.date }} at {{ bookingSummary.time }}
                    </span>
                  </div>
                  <div v-if="bookingSummary.deliveryFee > 0" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Delivery Fee:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">${{ bookingSummary.deliveryFee.toFixed(2) }}</span>
                  </div>
                  <div v-if="cryptoDiscount > 0 && paymentMethod === 'usdc'" class="flex justify-between text-green-600 dark:text-green-400">
                    <span>USDC Discount ({{ cryptoDiscountPercent }}%):</span>
                    <span class="font-semibold">-${{ cryptoDiscount.toFixed(2) }}</span>
                  </div>
                  <div class="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <div class="flex justify-between text-lg">
                      <span class="font-bold text-gray-900 dark:text-white">Total:</span>
                      <span class="font-bold text-primary-600 dark:text-primary-400">${{ finalTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Crypto Discount Banner -->
              <div v-if="paymentMethod === 'card' || paymentMethod === 'cash'" class="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p class="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Save {{ cryptoDiscountPercent }}% with Crypto!</p>
                    <p class="text-sm text-yellow-800 dark:text-yellow-400">Pay with USDC on Base and save ${{ cryptoDiscount.toFixed(2) }} on your order.</p>
                  </div>
                </div>
              </div>

              <!-- Payment Form -->
              <form @submit.prevent="handlePayment" class="space-y-6">
                <!-- Payment Method Selection -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method *
                  </label>
                  <p v-if="!paymentMethod" class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Please select a payment method to continue
                  </p>
                  <div class="grid grid-cols-3 gap-4">
                    <!-- Credit Card -->
                    <button
                      type="button"
                      @click="paymentMethod = 'card'"
                      :class="[
                        'p-4 border-2 rounded-lg transition-all text-left',
                        paymentMethod === 'card'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                      ]"
                    >
                      <div class="flex items-center gap-2">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                        <span class="font-semibold text-gray-900 dark:text-white">Credit Card</span>
                      </div>
                    </button>

                    <!-- USDC on Base -->
                    <button
                      type="button"
                      @click="paymentMethod = 'usdc'"
                      :class="[
                        'p-4 border-2 rounded-lg transition-all text-left',
                        paymentMethod === 'usdc'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      ]"
                    >
                      <div class="flex items-center gap-2">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#2775CA"/>
                        </svg>
                        <div class="flex-1">
                          <span class="font-semibold text-gray-900 dark:text-white block">USDC on Base</span>
                          <span class="text-xs text-green-600 dark:text-green-400">Save {{ cryptoDiscountPercent }}%</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Stripe Card Payment Form -->
                <div v-if="paymentMethod === 'card'" id="stripe-card-element" class="space-y-4">
                  <div v-if="!stripe" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p class="text-yellow-800 dark:text-yellow-300 text-sm">
                      Stripe is not configured. Please add STRIPE_PUBLISHABLE_KEY to your environment variables.
                    </p>
                  </div>
                  <div v-else class="space-y-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Card Information *
                      </label>
                      <!-- Stripe Elements will be mounted here - using v-show to keep in DOM -->
                      <div 
                        id="card-element" 
                        class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[50px]"
                        style="display: block;"
                      ></div>
                      <div id="card-errors" role="alert" class="text-red-600 dark:text-red-400 text-sm mt-2 min-h-[20px]"></div>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Your card information is securely processed by Stripe. We never store your card details.
                    </p>
                  </div>
                </div>

                <!-- Crypto Payment Instructions -->
                <div v-if="paymentMethod === 'usdc'" class="space-y-4">
                  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p class="text-blue-800 dark:text-blue-300 text-sm mb-3">
                      <strong>Pay with {{ paymentMethod.toUpperCase() }} and save {{ cryptoDiscountPercent }}%!</strong>
                    </p>
                    <p class="text-blue-800 dark:text-blue-300 text-sm mb-4">
                      Connect your wallet to complete payment. You'll pay <strong>${{ finalTotal.toFixed(2) }}</strong> instead of <strong>${{ bookingSummary.total.toFixed(2) }}</strong>.
                    </p>
                    <div v-if="!walletConnected" class="space-y-3">
                      <button
                        type="button"
                        @click="connectWallet"
                        class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        </svg>
                        Connect Wallet & Switch to Base & Switch to Base
                      </button>
                    </div>
                    <div v-else-if="!isBaseNetwork" class="space-y-3">
                      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p class="text-yellow-800 dark:text-yellow-300 text-sm mb-3">
                          <strong>Please switch to Base network</strong> to pay with USDC.
                        </p>
                        <button
                          type="button"
                          @click="switchToBaseNetwork"
                          class="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                        >
                          Switch to Base Network
                        </button>
                      </div>
                    </div>
                    <div v-else class="space-y-3">
                      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Connected:</strong> {{ walletAddress.slice(0, 6) }}...{{ walletAddress.slice(-4) }}
                        </p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Amount to Pay:</strong> {{ cryptoAmount }} USDC
                        </p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Network:</strong> <span class="text-green-600 dark:text-green-400">Base (Chain ID: {{ BASE_CHAIN_ID }})</span>
                        </p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Recipient:</strong> {{ recipientWalletAddress.slice(0, 6) }}...{{ recipientWalletAddress.slice(-4) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          USDC is a stablecoin: 1 USDC = $1.00
                        </p>
                        <p class="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                          ⚠️ You will be asked to confirm the transaction in MetaMask
                        </p>
                      </div>
                    </div>
                  </div>
                </div>


                <!-- Error Message -->
                <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p class="text-red-800 dark:text-red-300 text-sm">{{ error }}</p>
                </div>

                <!-- Actions -->
                <div class="flex gap-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="flex-1 btn-secondary text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="!canSubmit || processing"
                    class="flex-1 bg-primary-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span v-if="!processing">
                      {{ getPaymentButtonText() }}
                    </span>
                    <span v-else class="flex items-center gap-2">
                      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { ethers } from 'ethers'
import { useBookings } from '~/composables/useBookings'
import { useGraphQL } from '~/composables/useGraphQL'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    required: false // Now optional - can be bookingData instead
  },
  bookingData: {
    type: Object,
    required: false // New prop for booking data before creation
  },
  itemCounts: {
    type: Object,
    required: false // Item counts for work order creation
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'payment-complete'])

// Payment method and state
const paymentMethod = ref(null) // Start with no selection - user must choose
const processing = ref(false)
const error = ref('')
const stripe = ref(null)
const cardElement = ref(null)
const stripeElements = ref(null)

// Crypto state
const walletConnected = ref(false)
const walletAddress = ref('')
const currentChainId = ref(null)
const isBaseNetwork = ref(false)
const exchangeRate = ref(1) // USDC is a stablecoin, always ~$1
const recipientWalletAddress = '0x04C873241fe90e09CEaa93CDab3cC5C55ab863Cd' // Payment recipient address
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base chain
const BASE_CHAIN_ID = 8453 // Base mainnet chain ID
const cryptoAmount = computed(() => {
  if (paymentMethod.value === 'usdc') {
    // USDC has 6 decimals, so we show 6 decimal places
    return (finalTotal.value / exchangeRate.value).toFixed(6)
  }
  return '0'
})

// Discount configuration
const cryptoDiscountPercent = 10 // 10% discount for USDC on Base
const cryptoDiscount = computed(() => {
  if (paymentMethod.value === 'usdc') {
    return (props.total * cryptoDiscountPercent) / 100
  }
  return 0
})

const finalTotal = computed(() => {
  return props.total - cryptoDiscount.value
})

const bookingPricing = ref(null)

// Get booking or bookingData
const currentBooking = computed(() => {
  return props.booking || props.bookingData
})

// Fetch the pricing item to get serviceCategory
const fetchBookingPricing = async () => {
  if (!currentBooking.value?.service) return
  try {
    const { executeQuery } = useGraphQL()
    
    // First try to fetch by ID (new format)
    try {
    const query = `
      query {
          pricingItem(id: "${currentBooking.value.service}") {
          id
          name
          price
          priceType
          serviceCategory
        }
      }
    `
    const data = await executeQuery(query)
      if (data.pricingItem) {
    bookingPricing.value = data.pricingItem
        return
      }
    } catch (idError) {
      // If ID lookup fails, try fetching all pricing and finding by name (legacy format)
      console.log('Pricing lookup by ID failed, trying by name:', idError)
    }
    
    // Fallback: fetch all pricing and find by name (for legacy bookings)
    const allPricingQuery = `
      query {
        pricing(active: true) {
          id
          name
          price
          priceType
          serviceCategory
        }
      }
    `
    const allPricingData = await executeQuery(allPricingQuery)
    const foundPricing = allPricingData.pricing?.find(
      (p) => p.id === currentBooking.value.service || p.name === currentBooking.value.service
    )
    
    if (foundPricing) {
      bookingPricing.value = foundPricing
    } else {
      console.warn('Pricing not found for service:', currentBooking.value.service)
      bookingPricing.value = null
    }
  } catch (error) {
    console.error('Error fetching booking pricing:', error)
    bookingPricing.value = null
  }
}

const bookingSummary = computed(() => {
  if (!currentBooking.value) {
    return {
      service: '',
      numberOfGifts: 0,
      date: '',
      time: '',
      total: 0,
      deliveryFee: 0
    }
  }
  
  // Try to get service name from pricing item, fallback to old format
  let service = ''
  let baseTotal = 0
  let serviceCategory = ''
  
  if (bookingPricing.value) {
    const priceSuffix = bookingPricing.value.priceType === 'per-hour' ? '/hr' : ''
    service = `${bookingPricing.value.name} ($${bookingPricing.value.price}${priceSuffix})`
    serviceCategory = bookingPricing.value.serviceCategory || ''
    
    if (bookingPricing.value.priceType === 'per-hour') {
      baseTotal = bookingPricing.value.price
    } else {
      baseTotal = bookingPricing.value.price * (currentBooking.value.numberOfGifts || 0)
    }
  } else {
    // Fallback to old format
    service = currentBooking.value.service === 'basic' ? 'Basic ($8 per gift)' :
               currentBooking.value.service === 'premium' ? 'Premium ($12 per gift)' :
               'Unlimited ($50/hour)'
    
    baseTotal = currentBooking.value.service === 'unlimited' ? 50 :
                 currentBooking.value.service === 'basic' ? 8 * (currentBooking.value.numberOfGifts || 0) :
                 12 * (currentBooking.value.numberOfGifts || 0)
  }
  
  // Only add delivery fee if serviceCategory is "delivery" and total is less than $50
  const deliveryFee = (serviceCategory === 'delivery' && baseTotal < 50) ? 15 : 0
  
  return {
    service,
    numberOfGifts: currentBooking.value.numberOfGifts || 0,
    date: formatDate(currentBooking.value.date),
    time: formatTime(currentBooking.value.time),
    deliveryFee,
    total: props.total
  }
})

const canSubmit = computed(() => {
  if (paymentMethod.value === 'usdc') {
    return walletConnected.value && isBaseNetwork.value
  }
  if (paymentMethod.value === 'card') {
    return cardElement.value !== null && stripe.value !== null
  }
  if (paymentMethod.value === 'cash') {
    return true // Cash payment can always be submitted
  }
  return false
})

const getPaymentButtonText = () => {
  if (paymentMethod.value === 'usdc') {
    return `Pay ${cryptoAmount.value} USDC on Base ($${finalTotal.value.toFixed(2)})`
  }
  return `Pay $${finalTotal.value.toFixed(2)}`
}

// Initialize Stripe
const initializeStripe = async () => {
  try {
    const config = useRuntimeConfig()
    const publishableKey = config.public?.stripePublishableKey
    if (publishableKey && !stripe.value) {
      stripe.value = await loadStripe(publishableKey)
      if (stripe.value) {
        stripeElements.value = stripe.value.elements()
      }
    } else if (!publishableKey) {
      console.warn('Stripe publishable key not configured. Card payments will not be available.')
    }
  } catch (err) {
    console.error('Error loading Stripe:', err)
  }
}

onMounted(() => {
  initializeStripe()
  fetchBookingPricing()
})

// Watch for booking changes
watch(() => currentBooking.value, () => {
  if (currentBooking.value?.service) {
    fetchBookingPricing()
  }
}, { immediate: true })

// Watch for modal open/close
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    // Initialize Stripe if not already done (but don't mount yet)
    await initializeStripe()
  } else if (cardElement.value) {
    // Clean up when modal closes
    try {
      cardElement.value.unmount()
    } catch (e) {
      // Ignore unmount errors
    }
    cardElement.value = null
  }
})

// Watch for payment method changes
watch(paymentMethod, async (method) => {
  if (!props.isOpen) return
  
  if (method === 'card') {
    // Ensure Stripe is initialized
    await initializeStripe()
    
    if (stripe.value && stripeElements.value && !cardElement.value) {
      await nextTick()
      await mountCardElement()
    }
  } else if (cardElement.value) {
    // Unmount when switching away from card
    try {
      cardElement.value.unmount()
    } catch (e) {
      // Ignore unmount errors
    }
    cardElement.value = null
  }
  
  // For USDC, rate is always 1 (stablecoin)
  if (method === 'usdc') {
    exchangeRate.value = 1.0
    if (!walletConnected.value) {
      // Auto-connect wallet when USDC is selected
      await connectWallet()
    } else {
      // Check network if wallet is already connected
      await checkNetwork()
      if (!isBaseNetwork.value) {
        try {
          await switchToBaseNetwork()
        } catch (err) {
          error.value = 'Please switch to Base network to pay with USDC'
        }
      }
    }
  }
})

// Function to mount Stripe card element
const mountCardElement = async () => {
  // Don't mount if already mounted
  if (cardElement.value) {
    return
  }
  
  // Ensure Stripe is initialized
  if (!stripe.value || !stripeElements.value) {
    await initializeStripe()
    if (!stripe.value || !stripeElements.value) {
      return
    }
  }
  
  await nextTick()
  
  // Wait for DOM element to exist with retry logic
  let attempts = 0
  const maxAttempts = 20
  
  while (attempts < maxAttempts) {
    const cardEl = document.getElementById('card-element')
    if (cardEl && stripe.value && stripeElements.value) {
      try {
        // Check if element is empty or already has Stripe content
        const hasStripeContent = cardEl.querySelector('.StripeElement') !== null
        if (!hasStripeContent && cardEl.children.length === 0) {
          // Check if dark mode is active
          const isDarkMode = document.documentElement.classList.contains('dark')
          
          // Create and mount the card element
          cardElement.value = stripeElements.value.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: isDarkMode ? '#ffffff' : '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                '::placeholder': {
                  color: isDarkMode ? '#9ca3af' : '#aab7c4',
                },
                iconColor: '#5D8FB0', // Set icon color to #5D8FB0
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
              },
            },
            // Don't require billing details - we'll use the address from booking
            hidePostalCode: false,
          })
          
          cardElement.value.mount('#card-element')
          
          // Set up error handling
          cardElement.value.on('change', (event) => {
            const displayError = document.getElementById('card-errors')
            if (displayError) {
              if (event.error) {
                displayError.textContent = event.error.message
                displayError.style.display = 'block'
              } else {
                // Clear error when card is valid
                displayError.textContent = ''
                displayError.style.display = 'none'
              }
            }
          })
          
          // Also listen for ready event to clear any initial errors
          cardElement.value.on('ready', () => {
            const displayError = document.getElementById('card-errors')
            if (displayError) {
              displayError.textContent = ''
              displayError.style.display = 'none'
            }
          })
          
          return // Successfully mounted
        } else if (hasStripeContent) {
          // Already mounted, find the existing element
          return
        }
      } catch (err) {
        console.error('Error mounting Stripe card element:', err)
        return
      }
    }
    attempts++
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  console.warn('Could not mount Stripe card element: element not found after retries')
}

const checkNetwork = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      currentChainId.value = Number(network.chainId)
      isBaseNetwork.value = currentChainId.value === BASE_CHAIN_ID
      return isBaseNetwork.value
    } catch (err) {
      console.error('Error checking network:', err)
      return false
    }
  }
  return false
}

const switchToBaseNetwork = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }], // Convert to hex
      })
      await checkNetwork()
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          })
          await checkNetwork()
        } catch (addError) {
          console.error('Error adding Base network:', addError)
          throw new Error('Failed to add Base network to MetaMask')
        }
      } else {
        throw switchError
      }
    }
  } else {
    throw new Error('MetaMask is not installed')
  }
}

const connectWallet = async () => {
  try {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      walletAddress.value = accounts[0]
      walletConnected.value = true
      
      // Check if we're on Base network
      await checkNetwork()
      
      // If not on Base, prompt to switch
      if (!isBaseNetwork.value) {
        try {
          await switchToBaseNetwork()
        } catch (switchErr) {
          error.value = 'Please switch to Base network to pay with USDC'
          throw switchErr
        }
      }
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length === 0) {
          walletConnected.value = false
          walletAddress.value = ''
          isBaseNetwork.value = false
        } else {
          walletAddress.value = newAccounts[0]
          checkNetwork()
        }
      })
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        checkNetwork()
      })
    } else {
      error.value = 'Please install MetaMask or another Web3 wallet'
    }
  } catch (err) {
    console.error('Error connecting wallet:', err)
    if (err.code === 4001) {
      error.value = 'Please connect to MetaMask to continue.'
    } else {
      error.value = err.message || 'Failed to connect wallet. Please try again.'
    }
  }
}

// Send USDC payment via MetaMask on Base chain
const sendUSDCPayment = async () => {
  if (!walletConnected.value || !walletAddress.value) {
    throw new Error('Wallet not connected')
  }

  // Ensure we're on Base network
  const isOnBase = await checkNetwork()
  if (!isOnBase) {
    try {
      await switchToBaseNetwork()
    } catch (switchErr) {
      throw new Error('Please switch to Base network to pay with USDC')
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  
  // USDC has 6 decimals on Base
  const amountInUSDC = ethers.parseUnits(finalTotal.value.toFixed(6), 6)
  
  // USDC ERC20 ABI (minimal - just transfer function)
  const usdcAbi = [
    'function transfer(address to, uint256 amount) returns (bool)'
  ]
  
  const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, usdcAbi, signer)
  
  // Send transaction
  const tx = await usdcContract.transfer(recipientWalletAddress, amountInUSDC)
  
  // Wait for transaction confirmation
  const receipt = await tx.wait()
  
  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 1 ? 'success' : 'failed',
    chainId: BASE_CHAIN_ID,
    network: 'base'
  }
}

// Send crypto payment (USDC on Base)
const sendCryptoPayment = async () => {
  if (paymentMethod.value === 'usdc') {
    return await sendUSDCPayment()
  }
  throw new Error('Invalid payment method')
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
  // Reset form
  paymentMethod.value = null // Reset to no selection
  walletConnected.value = false
  walletAddress.value = ''
  error.value = ''
  if (cardElement.value) {
    try {
      cardElement.value.unmount()
    } catch (e) {
      // Ignore unmount errors
    }
    cardElement.value = null
  }
  emit('close')
}

const handlePayment = async () => {
  if (!canSubmit.value) return

  processing.value = true
  error.value = ''

  try {
    if (paymentMethod.value === 'card') {
      if (!stripe.value || !cardElement.value) {
        throw new Error('Stripe not initialized. Please check your configuration.')
      }

      // Clear any previous errors
      const displayError = document.getElementById('card-errors')
      if (displayError) {
        displayError.textContent = ''
        displayError.style.display = 'none'
      }

      // Get client secret
      const clientSecret = await createPaymentIntent()
      
      // Stripe payment - provide billing details from booking if available
      const billingDetails = currentBooking.value ? {
        name: currentBooking.value.name || '',
        email: currentBooking.value.email || '',
        address: {
          line1: currentBooking.value.address || '',
        }
      } : {}
      
      const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement.value,
            billing_details: billingDetails
          }
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Payment successful! Now create the booking
      console.log('Payment successful, creating booking...')
      const { createBooking } = useBookings()
      
      let createdBooking
      if (props.booking?.id) {
        // Booking already exists (legacy flow)
        createdBooking = props.booking
      } else if (props.bookingData) {
        // Create booking after payment
        createdBooking = await createBooking(props.bookingData)
        console.log('Booking created after payment:', createdBooking.id)
      } else {
        throw new Error('No booking data available to create booking')
      }

      // Create transaction record with the booking ID
      console.log('Creating Stripe transaction:', {
        bookingId: createdBooking.id,
        amount: Math.round(finalTotal.value * 100),
        paymentIntentId: paymentIntent.id
      })
      
      const response = await $fetch('/api/payments', {
        method: 'POST',
        body: {
          bookingId: createdBooking.id,
          amount: Math.round(finalTotal.value * 100),
          currency: 'USD',
          paymentMethod: 'card',
          status: 'completed',
          paymentIntentId: paymentIntent.id,
          metadata: {
            discount: 0,
            originalAmount: props.total
          }
        }
      })
      
      console.log('Stripe transaction response:', response)

      if (response.success) {
        // Emit payment complete event - parent will handle navigation and close modal
        emit('payment-complete', {
          transaction: response.data,
          paymentMethod: 'stripe',
          bookingId: createdBooking.id,
          booking: createdBooking
        })
        // Parent will close modal and navigate
      }
    } else if (paymentMethod.value === 'usdc') {
      // Crypto payment - send transaction via MetaMask first
      let txResult = null
      
      try {
        // Send the actual crypto transaction
        txResult = await sendCryptoPayment()
        
        if (txResult.status !== 'success') {
          throw new Error('Transaction failed on blockchain')
        }
      } catch (txError) {
        console.error('Crypto transaction error:', txError)
        if (txError.code === 4001) {
          throw new Error('Transaction was rejected. Please try again.')
        } else if (txError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient funds in your wallet. Please check your balance.')
        } else {
          throw new Error(txError.message || 'Failed to send crypto payment. Please try again.')
        }
      }
      
      // Payment successful! Now create the booking
      console.log('Crypto payment successful, creating booking...')
      const { createBooking } = useBookings()
      
      let createdBooking
      if (props.booking?.id) {
        // Booking already exists (legacy flow)
        createdBooking = props.booking
      } else if (props.bookingData) {
        // Create booking after payment
        createdBooking = await createBooking(props.bookingData)
        console.log('Booking created after payment:', createdBooking.id)
      } else {
        throw new Error('No booking data available to create booking')
      }
      
      // Record transaction in database
      console.log('Creating USDC transaction:', {
        bookingId: createdBooking.id,
        amount: finalTotal.value,
        transactionHash: txResult.transactionHash
      })
      
      const response = await $fetch('/api/payments/crypto', {
        method: 'POST',
        body: {
          bookingId: createdBooking.id,
          amount: finalTotal.value,
          currency: 'USD',
          cryptoAmount: cryptoAmount.value,
          exchangeRate: exchangeRate.value,
          walletAddress: walletAddress.value,
          recipientAddress: recipientWalletAddress,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          discount: cryptoDiscount.value,
          originalAmount: props.total
        }
      })
      
      console.log('USDC transaction response:', response)

      if (response.success) {
        // Emit payment complete event - parent will handle navigation and close modal
        emit('payment-complete', {
          transaction: response.data,
          paymentMethod: paymentMethod.value,
          bookingId: createdBooking.id,
          booking: createdBooking,
          transactionHash: txResult.transactionHash
        })
        // Parent will close modal and navigate
      }
    } else if (paymentMethod.value === 'cash') {
      // Cash payment - create booking immediately (payment on delivery)
      console.log('Cash payment selected, creating booking...')
      const { createBooking } = useBookings()
      
      let createdBooking
      if (props.booking?.id) {
        // Booking already exists (legacy flow)
        createdBooking = props.booking
      } else if (props.bookingData) {
        // Create booking for cash payment
        createdBooking = await createBooking(props.bookingData)
        console.log('Booking created for cash payment:', createdBooking.id)
      } else {
        throw new Error('No booking data available to create booking')
      }

      // Create transaction record with status 'pending' for cash
      console.log('Creating cash transaction:', {
        bookingId: createdBooking.id,
        amount: Math.round(finalTotal.value * 100)
      })
      
      const response = await $fetch('/api/payments', {
        method: 'POST',
        body: {
          bookingId: createdBooking.id,
          amount: Math.round(finalTotal.value * 100),
          currency: 'USD',
          paymentMethod: 'cash',
          status: 'pending', // Cash payment is pending until delivery
          metadata: {
            discount: 0,
            originalAmount: props.total
          }
        }
      })
      
      console.log('Cash transaction response:', response)

      if (response.success) {
        // Emit payment complete event - parent will handle navigation and close modal
        emit('payment-complete', {
          transaction: response.data,
          paymentMethod: 'cash',
          bookingId: createdBooking.id,
          booking: createdBooking
        })
        // Parent will close modal and navigate
      }
    }
  } catch (err) {
    console.error('Payment error:', err)
    error.value = err?.data?.message || err?.message || 'There was an error processing your payment. Please try again.'
    // IMPORTANT: If payment fails, booking is NOT created - this is the correct behavior
  } finally {
    processing.value = false
  }
}

const createPaymentIntent = async () => {
  try {
    // For payment intent, we need a booking ID
    // If booking doesn't exist yet, use a temporary ID or create booking first
    // Actually, let's use a temporary ID since we'll create the booking after payment
    const tempBookingId = props.booking?.id || 'temp-' + Date.now()
    
    const response = await $fetch('/api/payments/create-intent', {
      method: 'POST',
      body: {
        amount: Math.round(finalTotal.value * 100),
        currency: 'usd',
        bookingId: tempBookingId // Use temp ID if booking doesn't exist yet
      }
    })
    if (!response || !response.clientSecret) {
      throw new Error('Failed to create payment intent')
    }
    return response.clientSecret
  } catch (err: any) {
    console.error('Error creating payment intent:', err)
    console.error('Error details:', {
      status: err?.status,
      statusCode: err?.statusCode,
      data: err?.data,
      message: err?.message,
      response: err?.response
    })
    // Extract the actual error message from the response
    const errorMessage = err?.data?.message || err?.response?._data?.message || err?.message || 'Failed to initialize payment. Please check your Stripe configuration.'
    throw new Error(errorMessage)
  }
}
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
</style>

<style>
/* Stripe Elements icon color override */
#card-element .StripeElement .InputElement,
#card-element .StripeElement .Icon,
#card-element .StripeElement svg,
#card-element .StripeElement .Icon svg,
#card-element .StripeElement .Icon--card,
#card-element .StripeElement .Icon--card svg {
  color: #5D8FB0 !important;
  fill: #5D8FB0 !important;
}

/* Target Stripe icon specifically */
#card-element .StripeElement .Icon--card {
  color: #5D8FB0 !important;
}

#card-element .StripeElement .Icon--card svg {
  fill: #5D8FB0 !important;
  color: #5D8FB0 !important;
}

/* Dark mode support for Stripe icons */
.dark #card-element .StripeElement .Icon--card,
.dark #card-element .StripeElement .Icon--card svg {
  color: #5D8FB0 !important;
  fill: #5D8FB0 !important;
}
</style>
