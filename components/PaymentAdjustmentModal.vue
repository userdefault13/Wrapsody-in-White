<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-90" @click="closeModal"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Payment Adjustment Required
                </h2>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Adjustment Summary -->
              <div class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-200">
                    Size Discrepancy Detected
                  </h3>
                </div>
                <p class="text-sm text-amber-800 dark:text-amber-300">
                  Some items differ from the original booking size. Please review and process the payment adjustment.
                </p>
              </div>

              <!-- Adjustment Details -->
              <div class="mb-6 space-y-3">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
                  Adjustment Details ({{ adjustment.adjustment.details.length }} item{{ adjustment.adjustment.details.length !== 1 ? 's' : '' }}):
                </h4>
                <div v-for="(detail, index) in adjustment.adjustment.details" :key="index" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-medium text-gray-900 dark:text-white">
                      Item {{ detail.itemNumber }}: {{ detail.description || `Item ${detail.itemNumber}` }}
                    </span>
                    <span
                      :class="detail.type === 'larger' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'"
                      class="font-semibold text-lg"
                    >
                      {{ detail.type === 'larger' ? '+' : '-' }}${{ Math.abs(detail.difference).toFixed(2) }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <span class="line-through">{{ detail.originalSize }}</span>
                    <span class="mx-2">→</span>
                    <span class="font-medium">{{ detail.newSize }}</span>
                    <span class="ml-2">
                      (${{ detail.originalPrice.toFixed(2) }} → ${{ detail.newPrice.toFixed(2) }})
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Per item adjustment: ${{ Math.abs(detail.difference).toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Price Summary -->
              <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-700 dark:text-gray-300">Original Total ({{ adjustment.items?.length || adjustment.adjustment.details.length }} items):</span>
                  <span class="text-gray-900 dark:text-white">${{ adjustment.adjustment.originalTotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between mb-2">
                  <span class="text-gray-700 dark:text-gray-300">
                    {{ adjustment.adjustment.amount > 0 ? 'Additional Charge' : 'Refund' }}:
                  </span>
                  <span
                    :class="adjustment.adjustment.amount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'"
                    class="font-semibold text-lg"
                  >
                    {{ adjustment.adjustment.amount > 0 ? '+' : '' }}${{ Math.abs(adjustment.adjustment.amount).toFixed(2) }}
                  </span>
                </div>
                <div class="flex justify-between pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                  <span class="text-xl font-bold text-gray-900 dark:text-white">New Total:</span>
                  <span class="text-xl font-bold text-gray-900 dark:text-white">
                    ${{ adjustment.adjustment.adjustedTotal.toFixed(2) }}
                  </span>
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
                        <span class="font-semibold text-gray-900 dark:text-white text-sm">Credit Card</span>
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
                          <span class="font-semibold text-gray-900 dark:text-white block text-sm">USDC</span>
                          <span class="text-xs text-green-600 dark:text-green-400">Save {{ cryptoDiscountPercent }}%</span>
                        </div>
                      </div>
                    </button>

                    <!-- Cash App -->
                    <button
                      type="button"
                      @click="paymentMethod = 'cashapp'"
                      :class="[
                        'p-4 border-2 rounded-lg transition-all text-left',
                        paymentMethod === 'cashapp'
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                      ]"
                    >
                      <div class="flex items-center gap-2">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.59 3.683c-.363-.363-.863-.58-1.4-.58H1.81c-.537 0-1.037.217-1.4.58-.363.363-.58.863-.58 1.4v14.234c0 .537.217 1.037.58 1.4.363.363.863.58 1.4.58h20.38c.537 0 1.037-.217 1.4-.58.363-.363.58-.863.58-1.4V5.083c0-.537-.217-1.037-.58-1.4zM12.855 16.14l-2.673-2.673 1.4-1.4 1.273 1.273 3.773-3.773 1.4 1.4-5.173 5.173z"/>
                        </svg>
                        <span class="font-semibold text-gray-900 dark:text-white text-sm">Cash App</span>
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

                <!-- Cash App Payment Instructions -->
                <div v-if="paymentMethod === 'cashapp'" class="space-y-4">
                  <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p class="text-green-800 dark:text-green-300 text-sm mb-3">
                      <strong>Pay with Cash App</strong>
                    </p>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Cash App Tag or Phone Number *
                        </label>
                        <input
                          v-model="cashAppTag"
                          type="text"
                          placeholder="$YourTag or +1234567890"
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <strong>Amount to Request:</strong>
                        </p>
                        <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${{ finalTotal.toFixed(2) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Send a payment request to the customer's Cash App tag. Once they confirm payment, mark as complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Crypto Payment Instructions -->
                <div v-if="paymentMethod === 'usdc'" class="space-y-4">
                  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p class="text-blue-800 dark:text-blue-300 text-sm">
                      <strong>Pay with {{ paymentMethod.toUpperCase() }} and save {{ cryptoDiscountPercent }}%!</strong>
                    </p>
                  </div>
                  
                  <div v-if="!walletConnected" class="space-y-3">
                    <button
                      type="button"
                      @click="connectWallet"
                      class="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Connect Wallet
                    </button>
                    <p class="text-xs text-gray-600 dark:text-gray-400 text-center">
                      Connect your MetaMask wallet to pay with USDC on Base
                    </p>
                  </div>

                  <div v-else class="space-y-3">
                    <div v-if="!isBaseNetwork" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p class="text-amber-800 dark:text-amber-300 text-sm">
                        <strong>Please switch to Base network</strong> to pay with USDC.
                      </p>
                      <button
                        type="button"
                        @click="switchToBaseNetwork"
                        class="mt-2 btn-secondary text-sm"
                      >
                        Switch to Base
                      </button>
                    </div>
                    <div v-else class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p class="text-green-800 dark:text-green-300 text-sm">
                        <strong>Connected:</strong> {{ walletAddress.substring(0, 6) }}...{{ walletAddress.substring(walletAddress.length - 4) }}
                      </p>
                      <p class="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        <strong>Amount to Pay:</strong> {{ cryptoAmount }} USDC
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-4 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="flex-1 btn-secondary"
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

                <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
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

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  adjustment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'payment-complete'])

// Payment method and state
const paymentMethod = ref(null)
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

// Cash App state
const cashAppTag = ref('')

// Discount configuration
const cryptoDiscountPercent = 10 // 10% discount for USDC on Base
const adjustmentAmount = computed(() => Math.abs(props.adjustment.adjustment.amount))
const cryptoDiscount = computed(() => {
  if (paymentMethod.value === 'usdc') {
    return (adjustmentAmount.value * cryptoDiscountPercent) / 100
  }
  return 0
})

const finalTotal = computed(() => {
  // Cash App and Card payments use full amount, USDC gets discount
  if (paymentMethod.value === 'usdc') {
    return adjustmentAmount.value - cryptoDiscount.value
  }
  return adjustmentAmount.value
})

const cryptoAmount = computed(() => {
  if (paymentMethod.value === 'usdc') {
    // USDC has 6 decimals, so we show 6 decimal places
    return (finalTotal.value / exchangeRate.value).toFixed(6)
  }
  return '0'
})

const canSubmit = computed(() => {
  if (paymentMethod.value === 'usdc') {
    return walletConnected.value && isBaseNetwork.value
  }
  if (paymentMethod.value === 'card') {
    return cardElement.value !== null && stripe.value !== null
  }
  if (paymentMethod.value === 'cashapp') {
    return cashAppTag.value && cashAppTag.value.trim().length > 0
  }
  return false
})

const getPaymentButtonText = () => {
  if (paymentMethod.value === 'usdc') {
    return `Pay ${cryptoAmount.value} USDC on Base ($${finalTotal.value.toFixed(2)})`
  }
  if (paymentMethod.value === 'cashapp') {
    const action = props.adjustment.adjustment.amount > 0 ? 'Request' : 'Refund'
    return `${action} $${finalTotal.value.toFixed(2)} via Cash App`
  }
  const action = props.adjustment.adjustment.amount > 0 ? 'Charge' : 'Refund'
  return `${action} $${finalTotal.value.toFixed(2)}`
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
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
              },
            },
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
                displayError.textContent = ''
                displayError.style.display = 'none'
              }
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

// Wallet connection
const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    error.value = 'MetaMask is not installed. Please install MetaMask to continue.'
    return
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    
    if (accounts.length > 0) {
      walletAddress.value = accounts[0]
      walletConnected.value = true
      await checkNetwork()
    }
  } catch (err) {
    console.error('Error connecting wallet:', err)
    if (err.code === 4001) {
      error.value = 'Please connect your wallet to continue.'
    } else {
      error.value = 'Failed to connect wallet. Please try again.'
    }
  }
}

const checkNetwork = async () => {
  if (typeof window.ethereum === 'undefined') return false

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

const switchToBaseNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    error.value = 'MetaMask is not installed.'
    return
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }]
    })
    await checkNetwork()
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Chain doesn't exist, add it
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]
        })
        await checkNetwork()
      } catch (addError) {
        error.value = 'Failed to add Base network. Please add it manually in MetaMask.'
      }
    } else {
      error.value = 'Failed to switch to Base network. Please switch manually in MetaMask.'
    }
  }
}

// Send USDC payment via MetaMask on Base chain
const sendUSDCPayment = async () => {
  if (!walletConnected.value || !walletAddress.value) {
    throw new Error('Wallet not connected')
  }

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

const closeModal = () => {
  // Reset form
  paymentMethod.value = null
  walletConnected.value = false
  walletAddress.value = ''
  cashAppTag.value = ''
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

onMounted(() => {
  initializeStripe()
})

const createPaymentIntent = async () => {
  try {
    const response = await $fetch('/api/payments/create-intent', {
      method: 'POST',
      body: {
        amount: Math.round(finalTotal.value * 100),
        currency: 'usd',
        bookingId: props.adjustment.booking.id
      }
    })
    if (!response || !response.clientSecret) {
      throw new Error('Failed to create payment intent')
    }
    return response.clientSecret
  } catch (err) {
    console.error('Error creating payment intent:', err)
    throw new Error(err?.data?.message || err?.message || 'Failed to initialize payment. Please check your Stripe configuration.')
  }
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

      // Get client secret
      const clientSecret = await createPaymentIntent()
      
      // Stripe payment
      const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement.value,
          }
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Create transaction record
      const response = await $fetch('/api/payments', {
        method: 'POST',
        body: {
          bookingId: props.adjustment.booking.id,
          amount: Math.round(finalTotal.value * 100),
          currency: 'USD',
          paymentMethod: 'card',
          status: 'completed',
          paymentIntentId: paymentIntent.id,
          isAdjustment: true,
          adjustmentAmount: props.adjustment.adjustment.amount,
          metadata: {
            originalTotal: props.adjustment.adjustment.originalTotal,
            adjustedTotal: props.adjustment.adjustment.adjustedTotal,
            adjustmentDetails: props.adjustment.adjustment.details,
            cryptoDiscount: cryptoDiscount.value
          }
        }
      })
      
      if (response.success) {
        emit('payment-complete', {
          transaction: response.data,
          adjustment: props.adjustment,
          paymentMethod: 'card'
        })
      }
    } else if (paymentMethod.value === 'usdc') {
      // Crypto payment - send transaction via MetaMask first
      let txResult = null
      
      try {
        txResult = await sendUSDCPayment()
        
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
      
      // Record transaction in database
      const response = await $fetch('/api/payments/crypto', {
        method: 'POST',
        body: {
          bookingId: props.adjustment.booking.id,
          amount: finalTotal.value,
          currency: 'USD',
          cryptoAmount: cryptoAmount.value,
          exchangeRate: exchangeRate.value,
          walletAddress: walletAddress.value,
          recipientAddress: recipientWalletAddress,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          discount: cryptoDiscount.value,
          originalAmount: adjustmentAmount.value,
          isAdjustment: true,
          adjustmentAmount: props.adjustment.adjustment.amount,
          metadata: {
            originalTotal: props.adjustment.adjustment.originalTotal,
            adjustedTotal: props.adjustment.adjustment.adjustedTotal,
            adjustmentDetails: props.adjustment.adjustment.details
          }
        }
      })

      if (response.success) {
        emit('payment-complete', {
          transaction: response.data,
          adjustment: props.adjustment,
          paymentMethod: paymentMethod.value,
          transactionHash: txResult.transactionHash
        })
      }
    } else if (paymentMethod.value === 'cashapp') {
      // Cash App payment - create transaction record
      const response = await $fetch('/api/payments', {
        method: 'POST',
        body: {
          bookingId: props.adjustment.booking.id,
          amount: Math.round(finalTotal.value * 100),
          currency: 'USD',
          paymentMethod: 'cashapp',
          status: 'pending', // Cash App payments are pending until confirmed
          isAdjustment: true,
          adjustmentAmount: props.adjustment.adjustment.amount,
          cashAppTag: cashAppTag.value.trim(),
          metadata: {
            originalTotal: props.adjustment.adjustment.originalTotal,
            adjustedTotal: props.adjustment.adjustment.adjustedTotal,
            adjustmentDetails: props.adjustment.adjustment.details
          }
        }
      })

      if (response.success) {
        emit('payment-complete', {
          transaction: response.data,
          adjustment: props.adjustment,
          paymentMethod: 'cashapp',
          cashAppTag: cashAppTag.value.trim()
        })
      }
    }
  } catch (err) {
    console.error('Payment adjustment error:', err)
    error.value = err?.data?.message || err?.message || 'There was an error processing your payment. Please try again.'
  } finally {
    processing.value = false
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
</style>

