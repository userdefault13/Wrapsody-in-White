<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cancel Order</h2>
            
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <div class="flex gap-4">
              <button
                @click="closeModal"
                class="flex-1 btn-secondary"
              >
                Keep Order
              </button>
              <button
                @click="handleCancel"
                :disabled="cancelling"
                class="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!cancelling">Cancel Order</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'cancelled'])

const cancelling = ref(false)

const closeModal = () => {
  emit('close')
}

const handleCancel = async () => {
  cancelling.value = true
  
  try {
    const response = await $fetch(`/api/bookings/${props.bookingId}`, {
      method: 'PATCH',
      body: { status: 'cancelled' }
    })
    
    if (response.success) {
      // Show success message
      alert('Your order has been cancelled successfully.')
      emit('cancelled')
      closeModal()
    } else {
      throw new Error('Failed to cancel order')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    const errorMessage = error?.data?.message || error?.message || 'There was an error cancelling your order. Please try again.'
    alert(errorMessage)
  } finally {
    cancelling.value = false
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

