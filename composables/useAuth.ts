import { ref, computed } from 'vue'

const ADMIN_WHITELIST = [
  '0x2127aa7265d573aa467f1d73554d17890b872e76'.toLowerCase()
]

const isAuthenticated = ref(false)
const walletAddress = ref<string | null>(null)

export const useAuth = () => {
  // Check if already authenticated
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin-auth')
    if (stored) {
      try {
        const auth = JSON.parse(stored)
        if (auth.isAuthenticated && auth.address) {
          isAuthenticated.value = true
          walletAddress.value = auth.address
        }
      } catch (e) {
        console.error('Error loading auth:', e)
      }
    }
  }

  const checkMetaMask = async () => {
    if (typeof window === 'undefined') return false
    
    if (typeof window.ethereum !== 'undefined') {
      return true
    }
    
    // Check for MetaMask
    const { ethereum } = window as any
    return !!ethereum
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      throw new Error('Window is not available')
    }

    const { ethereum } = window as any

    if (!ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
    }

    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]

      if (!address) {
        throw new Error('No account found')
      }

      // Check if address is whitelisted
      const addressLower = address.toLowerCase()
      const isWhitelisted = ADMIN_WHITELIST.includes(addressLower)

      if (!isWhitelisted) {
        throw new Error('This wallet address is not authorized to access the admin panel.')
      }

      // Set authenticated state
      isAuthenticated.value = true
      walletAddress.value = address

      // Save to localStorage
      localStorage.setItem('admin-auth', JSON.stringify({
        isAuthenticated: true,
        address: address,
        timestamp: Date.now()
      }))

      return address
    } catch (error) {
      if (error?.code === 4001) {
        throw new Error('Please connect to MetaMask.')
      }
      throw error
    }
  }

  const disconnect = () => {
    isAuthenticated.value = false
    walletAddress.value = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-auth')
    }
  }

  const checkAuth = () => {
    return isAuthenticated.value && walletAddress.value !== null
  }

  // Listen for account changes
  if (typeof window !== 'undefined') {
    const { ethereum } = window as any
    if (ethereum) {
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          const address = accounts[0]
          const addressLower = address.toLowerCase()
          const isWhitelisted = ADMIN_WHITELIST.includes(addressLower)
          if (!isWhitelisted) {
            disconnect()
          } else {
            walletAddress.value = address
            localStorage.setItem('admin-auth', JSON.stringify({
              isAuthenticated: true,
              address: address,
              timestamp: Date.now()
            }))
          }
        }
      })
    }
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    walletAddress: computed(() => walletAddress.value),
    checkMetaMask,
    connectWallet,
    disconnect,
    checkAuth
  }
}

