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
                Receive Inventory
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
              <!-- Item Selection -->
              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Inventory Item
                </label>
                <select
                  v-model="selectedItemId"
                  @change="onItemSelected"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Select an item --</option>
                  <option
                    v-for="item in inventoryItems"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }} ({{ getTypeLabel(item.type) }}) - Qty: {{ item.quantity }} {{ item.type === 'wrapping_paper' ? `| On-hand: ${item.remainingArea?.toFixed(2) || 0} sqft` : '' }}
                  </option>
                </select>
              </div>

              <!-- Selected Item Details -->
              <div v-if="selectedItem" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ selectedItem.name }}
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Type:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ getTypeLabel(selectedItem.type) }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Current Qty:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedItem.quantity }}</span>
                  </div>
                  <div v-if="selectedItem.type === 'wrapping_paper'">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">On-hand Area:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedItem.remainingArea?.toFixed(2) || 0 }} sqft</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Size:</span>
                    <span class="ml-2 text-gray-900 dark:text-white">{{ selectedItem.size || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Receiving Form -->
              <div v-if="selectedItem">
                <!-- For wrapping paper: packs input -->
                <div v-if="selectedItem.type === 'wrapping_paper' && selectedItem.rolls && selectedItem.rolls.length > 0" class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Number of Packs Received
                  </label>
                  <div class="mb-2">
                    <input
                      v-model.number="packsToReceive"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Enter number of packs"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <div><strong>Pack Information:</strong></div>
                      <div>• Each pack contains 4 rolls</div>
                      <div v-if="packsToReceive > 0">
                        • Receiving <strong>{{ packsToReceive }}</strong> pack(s) = <strong>{{ packsToReceive * 4 }}</strong> rolls worth of area
                      </div>
                      <div v-if="packsToReceive > 0 && sqftPerRoll > 0">
                        • Each roll: <strong>{{ sqftPerRoll.toFixed(2) }} sqft</strong>
                      </div>
                      <div v-if="packsToReceive > 0 && sqftPerRoll > 0" class="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <strong>Total area to add: {{ (packsToReceive * 4 * sqftPerRoll).toFixed(2) }} sqft</strong>
                      </div>
                      <div v-if="packsToReceive > 0 && sqftPerRoll > 0" class="text-xs text-gray-600 dark:text-gray-400">
                        This will be automatically distributed across existing rolls. Quantity will not change.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- For other item types or wrapping paper without rolls: quantity input -->
                <div v-else class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity to Receive
                  </label>
                  <input
                    v-model.number="quantityToReceive"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter quantity"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Current quantity: {{ selectedItem.quantity }} → New quantity: {{ (selectedItem.quantity || 0) + (quantityToReceive || 0) }}
                  </div>
                </div>

                <!-- Receiving Date -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Receiving Date
                  </label>
                  <input
                    v-model="receivingDate"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Notes -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    v-model="notes"
                    rows="3"
                    placeholder="Receiving notes, PO number, etc."
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="close"
                :disabled="saving"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                @click="saveReceiving"
                :disabled="!canSave || saving"
                class="px-6 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg
                  v-if="saving"
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Processing...' : 'Receive Stock' }}
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

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  inventoryItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'received'])

const selectedItemId = ref('')
const selectedItem = ref(null)
const quantityToReceive = ref(0)
const packsToReceive = ref(0)
const rollReceiving = ref({})
const receivingDate = ref(new Date().toISOString().split('T')[0])
const notes = ref('')
const saving = ref(false)

// Reset form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

const resetForm = () => {
  selectedItemId.value = ''
  selectedItem.value = null
  quantityToReceive.value = 0
  packsToReceive.value = 0
  rollReceiving.value = {}
  receivingDate.value = new Date().toISOString().split('T')[0]
  notes.value = ''
}

const onItemSelected = () => {
  const item = props.inventoryItems.find(i => i.id === selectedItemId.value)
  selectedItem.value = item ? { ...item } : null
  quantityToReceive.value = 0
  packsToReceive.value = 0
  rollReceiving.value = {}
}

// Calculate sqft per roll for wrapping paper
const sqftPerRoll = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'wrapping_paper') return 0
  
  // Try to get from maxArea of first roll
  if (selectedItem.value.rolls && selectedItem.value.rolls.length > 0 && selectedItem.value.rolls[0].maxArea) {
    return selectedItem.value.rolls[0].maxArea
  }
  
  // Fallback: calculate from size and quantity
  if (selectedItem.value.size && selectedItem.value.quantity > 0) {
    const totalSize = parseFloat(selectedItem.value.size)
    if (!isNaN(totalSize) && totalSize > 0) {
      return totalSize / selectedItem.value.quantity
    }
  }
  
  return 0
})

const canSave = computed(() => {
  if (!selectedItem.value) return false
  
  if (selectedItem.value.type === 'wrapping_paper' && selectedItem.value.rolls && selectedItem.value.rolls.length > 0) {
    // Check if packs to receive > 0
    return packsToReceive.value > 0
  }
  
  return quantityToReceive.value > 0
})

const getTypeLabel = (type) => {
  const labels = {
    wrapping_paper: 'Wrapping Paper',
    ribbon: 'Ribbon',
    bow: 'Bow',
    box: 'Box',
    tag: 'Tag'
  }
  return labels[type] || type
}

const close = () => {
  emit('close')
}

const saveReceiving = async () => {
  if (!canSave.value || !selectedItem.value) return
  
  saving.value = true
  
  try {
    // Build update payload (don't include id - it's handled separately in the mutation)
    const updateData = {}
    
    if (selectedItem.value.type === 'wrapping_paper' && selectedItem.value.rolls && selectedItem.value.rolls.length > 0) {
      // Calculate total area to add: packs * 4 rolls * sqft per roll
      const totalAreaToAdd = packsToReceive.value * 4 * sqftPerRoll.value
      
      // Distribute area across existing rolls
      // Strategy: fill each roll to maxArea first, then distribute remaining area using quantity field
      let remainingAreaToAdd = totalAreaToAdd
      const updatedRolls = selectedItem.value.rolls.map(roll => {
        const currentOnHand = roll.onHand || 0
        const maxArea = roll.maxArea || 0
        const currentQuantity = roll.quantity || 1 // Default to 1 if not set
        const spaceAvailable = Math.max(0, maxArea - currentOnHand)
        
        let areaToAddToThisRoll = 0
        let newQuantity = currentQuantity
        
        // First, fill up to maxArea
        if (remainingAreaToAdd > 0 && spaceAvailable > 0) {
          areaToAddToThisRoll = Math.min(remainingAreaToAdd, spaceAvailable)
          remainingAreaToAdd -= areaToAddToThisRoll
        }
        
        // If there's still area remaining, add it using quantity (allowing onHand to exceed maxArea)
        if (remainingAreaToAdd > 0) {
          // Calculate how much more we can add to this roll
          const additionalArea = Math.min(remainingAreaToAdd, maxArea)
          areaToAddToThisRoll += additionalArea
          remainingAreaToAdd -= additionalArea
          
          // Increase quantity to represent the additional stock
          // If we're adding a full roll's worth, increase quantity by 1
          if (additionalArea >= maxArea * 0.9) { // 90% threshold to account for rounding
            newQuantity = currentQuantity + 1
          } else {
            // For partial rolls, calculate the fractional quantity increase
            newQuantity = currentQuantity + (additionalArea / maxArea)
          }
        }
        
        return {
          ...roll,
          onHand: currentOnHand + areaToAddToThisRoll,
          quantity: newQuantity
        }
      })
      
      // If there's still area remaining after distributing to all rolls,
      // distribute it evenly across all rolls using quantity
      if (remainingAreaToAdd > 0) {
        const numRolls = updatedRolls.length
        const areaPerRoll = remainingAreaToAdd / numRolls
        
        updatedRolls.forEach(roll => {
          roll.onHand += areaPerRoll
          // Increase quantity proportionally
          const quantityIncrease = areaPerRoll / roll.maxArea
          roll.quantity = (roll.quantity || 1) + quantityIncrease
        })
      }
      
      updateData.rolls = updatedRolls
      
      // Calculate new remainingArea from updated rolls (for display purposes)
      const newRemainingArea = updatedRolls.reduce((sum, roll) => sum + (roll.onHand || 0), 0)
      updateData.remainingArea = newRemainingArea
      
      // Don't update quantity - keep it the same
    } else {
      // Update quantity for non-roll items
      updateData.quantity = (selectedItem.value.quantity || 0) + quantityToReceive.value
    }
    
    // Add notes if provided (append to existing notes)
    if (notes.value.trim()) {
      const dateStr = receivingDate.value || new Date().toISOString().split('T')[0]
      const receivingNote = `\n\n[Received on ${dateStr}]: ${notes.value.trim()}`
      updateData.notes = (selectedItem.value.notes || '') + receivingNote
    }
    
    // Emit the receiving data for parent to handle
    emit('received', {
      item: selectedItem.value,
      updateData,
      receivingDate: receivingDate.value,
      notes: notes.value
    })
    
    resetForm()
  } catch (error) {
    console.error('Error saving receiving:', error)
    alert('Failed to save receiving. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>

