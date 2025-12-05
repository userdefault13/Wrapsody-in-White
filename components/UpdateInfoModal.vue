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
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Update Contact Information</h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleUpdate" class="space-y-6">
              <!-- Name -->
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
                />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Phone -->
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
                />
              </div>

              <!-- Address -->
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
                />
              </div>

              <!-- Actions -->
              <div class="flex gap-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!canSubmit || updating"
                  class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="!updating">Update Information</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const updating = ref(false)

const canSubmit = computed(() => {
  return form.value.name && form.value.email && form.value.phone && form.value.address &&
         (form.value.name !== props.booking?.name ||
          form.value.email !== props.booking?.email ||
          form.value.phone !== props.booking?.phone ||
          form.value.address !== props.booking?.address)
})

const handleUpdate = async () => {
  if (!canSubmit.value) return

  // Basic validation
  if (!form.value.email.includes('@')) {
    alert('Please enter a valid email address.')
    return
  }

  if (form.value.phone.length < 10) {
    alert('Please enter a valid phone number.')
    return
  }

  updating.value = true

  try {
    const response = await $fetch(`/api/bookings/${props.booking.id}`, {
      method: 'PATCH',
      body: {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        address: form.value.address
      }
    })

    if (response.success) {
      // Show success message
      alert('Your contact information has been updated successfully!')
      emit('updated')
      closeModal()
    } else {
      throw new Error('Failed to update information')
    }
  } catch (error) {
    console.error('Error updating information:', error)
    const errorMessage = error?.data?.message || error?.message || 'There was an error updating your information. Please try again.'
    alert(errorMessage)
  } finally {
    updating.value = false
  }
}

const closeModal = () => {
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.booking) {
    form.value = {
      name: props.booking.name || '',
      email: props.booking.email || '',
      phone: props.booking.phone || '',
      address: props.booking.address || ''
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
</style>

