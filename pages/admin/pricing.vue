<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Price Manager</h1>
            <p class="text-gray-600 dark:text-gray-300">Manage your pricing tiers and display order</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-4">
            <button
              @click="handleLogout"
              class="btn-secondary"
            >
              Logout
            </button>
            <div class="flex gap-4">
              <button
                @click="showImportModal = true"
                class="btn-secondary"
              >
                📥 Import JSON
              </button>
              <button
                @click="showAddModal = true"
                class="btn-primary"
              >
                + Add Pricing Tier
              </button>
              <NuxtLink to="/admin/bookings" class="btn-secondary">
                Back to Bookings
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p class="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> The first 3 pricing tiers (by order) will be displayed on the homepage. Reorder pricing tiers using the up/down arrows.
        </p>
      </div>

      <!-- Pricing List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Features</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="(pricing, index) in pricingTiers"
                :key="pricing.id"
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  index < 3 ? 'bg-green-50 dark:bg-green-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ pricing.order }}</span>
                    <div class="flex flex-col gap-1">
                      <button
                        @click="movePricing(pricing.id, 'up')"
                        :disabled="index === 0"
                        class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      </button>
                      <button
                        @click="movePricing(pricing.id, 'down')"
                        :disabled="index === pricingTiers.length - 1"
                        class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                    <span v-if="index < 3" class="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Homepage</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ pricing.name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ pricing.description || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    ${{ pricing.price }}{{ pricing.priceType === 'per-hour' ? '/hr' : '' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {{ pricing.priceType || 'per-item' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    <span v-if="pricing.features && pricing.features.length > 0">
                      {{ pricing.features.length }} feature(s)
                    </span>
                    <span v-else>-</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {{ pricing.group || 'default' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      pricing.active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    ]"
                  >
                    {{ pricing.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      @click="editPricing(pricing)"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      Edit
                    </button>
                    <button
                      @click="deletePricing(pricing.id)"
                      class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="pricingTiers.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No pricing tiers found. Click "Add Pricing Tier" to create one.</p>
        </div>
      </div>
    </div>

    <!-- Import JSON Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showImportModal"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="showImportModal = false"
        >
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div class="flex min-h-full items-center justify-center p-4">
            <div
              class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              @click.stop
            >
              <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Import Pricing from JSON</h2>
                <button
                  @click="showImportModal = false; importError = ''; importSuccess = ''"
                  class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="p-6 space-y-6">
                <!-- Instructions -->
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Import Instructions</h3>
                  <ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Upload a JSON file containing an array of pricing tiers</li>
                    <li>Each pricing tier must have: name, price</li>
                    <li>Optional fields: description, priceType, features, group, active</li>
                    <li>Download the template below to see the correct format</li>
                  </ul>
                </div>

                <!-- Success Message -->
                <div v-if="importSuccess" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p class="text-green-800 dark:text-green-300 font-semibold">{{ importSuccess }}</p>
                </div>

                <!-- Error Message -->
                <div v-if="importError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p class="text-red-800 dark:text-red-300 whitespace-pre-line">{{ importError }}</p>
                </div>

                <!-- File Input -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select JSON File
                  </label>
                  <input
                    type="file"
                    accept=".json,application/json"
                    @change="handleFileImport"
                    :disabled="importing"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <!-- Template Download -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    @click="downloadTemplate"
                    class="w-full btn-secondary"
                  >
                    📥 Download JSON Template
                  </button>
                </div>

                <!-- Actions -->
                <div class="flex gap-4">
                  <button
                    type="button"
                    @click="showImportModal = false; importError = ''; importSuccess = ''"
                    class="flex-1 btn-secondary"
                    :disabled="importing"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add/Edit Pricing Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddModal || editingPricing"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="closeModal"
        >
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div class="flex min-h-full items-center justify-center p-4">
            <div
              class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              @click.stop
            >
              <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ editingPricing ? 'Edit Pricing Tier' : 'Add Pricing Tier' }}
                </h2>
                <button
                  @click="closeModal"
                  class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form @submit.prevent="savePricing" class="p-6 space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pricing Tier Name *
                  </label>
                  <input
                    v-model="pricingForm.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    v-model="pricingForm.description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      v-model.number="pricingForm.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Price Type *
                    </label>
                    <select
                      v-model="pricingForm.priceType"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="per-item">Per Item</option>
                      <option value="per-hour">Per Hour</option>
                      <option value="fixed">Fixed Price</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Features (comma-separated)
                  </label>
                  <input
                    v-model="pricingForm.featuresText"
                    type="text"
                    placeholder="Feature 1, Feature 2, Feature 3"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Group
                    </label>
                    <input
                      v-model="pricingForm.group"
                      type="text"
                      placeholder="default"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Service Category
                    </label>
                    <select
                      v-model="pricingForm.serviceCategory"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">None</option>
                      <option value="dropoff">Drop-Off</option>
                      <option value="delivery">Delivery</option>
                      <option value="onsite">On-Site</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="pricingForm.active"
                    type="checkbox"
                    id="active"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label for="active" class="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Active (visible to customers)
                  </label>
                </div>

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
                    :disabled="saving"
                    class="flex-1 btn-primary disabled:opacity-50"
                  >
                    {{ saving ? 'Saving...' : 'Save Pricing Tier' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useGraphQL } from '~/composables/useGraphQL'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'admin'
})

const router = useRouter()
const { walletAddress, disconnect } = useAuth()
const { executeQuery } = useGraphQL()

const pricingTiers = ref([])
const showAddModal = ref(false)
const showImportModal = ref(false)
const editingPricing = ref(null)
const saving = ref(false)
const importing = ref(false)
const importError = ref('')
const importSuccess = ref('')

const pricingForm = ref({
  name: '',
  description: '',
  price: 0,
  priceType: 'per-item',
  featuresText: '',
  group: 'default',
  serviceCategory: '',
  active: true
})

const fetchPricing = async () => {
  try {
    const query = `
      query {
        pricing {
          id
          name
          description
          price
          priceType
          features
          group
          active
          order
          createdAt
          updatedAt
        }
      }
    `
    const data = await executeQuery(query)
    pricingTiers.value = data.pricing.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching pricing:', error)
  }
}

const movePricing = async (pricingId, direction) => {
  const currentIndex = pricingTiers.value.findIndex(p => p.id === pricingId)
  if (currentIndex === -1) return

  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (newIndex < 0 || newIndex >= pricingTiers.value.length) return

  // Swap orders
  const currentPricing = pricingTiers.value[currentIndex]
  const targetPricing = pricingTiers.value[newIndex]
  const tempOrder = currentPricing.order
  currentPricing.order = targetPricing.order
  targetPricing.order = tempOrder

  // Update in database using GraphQL
  try {
    const mutation = `
      mutation ReorderPricing($input: ReorderPricingInput!) {
        reorderPricing(input: $input)
      }
    `
    await executeQuery(mutation, {
      input: {
        pricing: [
          { id: currentPricing.id, order: currentPricing.order },
          { id: targetPricing.id, order: targetPricing.order }
        ]
      }
    })
    
    // Re-sort pricing
    pricingTiers.value.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error reordering pricing:', error)
    // Revert on error
    await fetchPricing()
  }
}

const editPricing = (pricing) => {
  editingPricing.value = pricing
  pricingForm.value = {
    name: pricing.name,
    description: pricing.description || '',
    price: pricing.price,
    priceType: pricing.priceType || 'per-item',
    featuresText: Array.isArray(pricing.features) ? pricing.features.join(', ') : '',
    group: pricing.group || 'default',
    serviceCategory: pricing.serviceCategory || '',
    active: pricing.active !== false
  }
}

const deletePricing = async (pricingId) => {
  if (!confirm('Are you sure you want to delete this pricing tier?')) return

  try {
    const mutation = `
      mutation DeletePricing($id: ID!) {
        deletePricing(id: $id)
      }
    `
    await executeQuery(mutation, { id: pricingId })
    await fetchPricing()
  } catch (error) {
    console.error('Error deleting pricing:', error)
    alert('Failed to delete pricing tier')
  }
}

const savePricing = async () => {
  saving.value = true
  try {
    const features = pricingForm.value.featuresText
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    if (editingPricing.value) {
      // Update existing pricing
      const mutation = `
          mutation UpdatePricing($input: UpdatePricingInput!) {
            updatePricing(input: $input) {
              id
              name
              description
              price
              priceType
              features
              group
              serviceCategory
              active
              order
            }
          }
      `
      await executeQuery(mutation, {
        input: {
          id: editingPricing.value.id,
          name: pricingForm.value.name,
          description: pricingForm.value.description,
          price: pricingForm.value.price,
          priceType: pricingForm.value.priceType,
          features,
          group: pricingForm.value.group,
          serviceCategory: pricingForm.value.serviceCategory || '',
          active: pricingForm.value.active
        }
      })
    } else {
      // Create new pricing
      const mutation = `
          mutation CreatePricing($input: CreatePricingInput!) {
            createPricing(input: $input) {
              id
              name
              description
              price
              priceType
              features
              group
              serviceCategory
              active
              order
            }
          }
      `
      await executeQuery(mutation, {
        input: {
          name: pricingForm.value.name,
          description: pricingForm.value.description,
          price: parseFloat(pricingForm.value.price),
          priceType: pricingForm.value.priceType,
          features,
          group: pricingForm.value.group,
          serviceCategory: pricingForm.value.serviceCategory || '',
          active: pricingForm.value.active
        }
      })
    }

    await fetchPricing()
    closeModal()
  } catch (error) {
    console.error('Error saving pricing:', error)
    const errorMessage = error?.message || error?.data?.message || 'Failed to save pricing tier'
    alert(`Error: ${errorMessage}`)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingPricing.value = null
  pricingForm.value = {
    name: '',
    description: '',
    price: 0,
    priceType: 'per-item',
    featuresText: '',
    group: 'default',
    active: true
  }
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  importing.value = true
  importError.value = ''
  importSuccess.value = ''

  try {
    const text = await file.text()
    const jsonData = JSON.parse(text)

    // Validate JSON structure
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON must be an array of pricing tiers')
    }

    if (jsonData.length === 0) {
      throw new Error('JSON array is empty')
    }

    // Validate each pricing tier
    const errors = []
    jsonData.forEach((pricing, index) => {
      if (!pricing.name) {
        errors.push(`Pricing tier at index ${index}: missing "name"`)
      }
      if (pricing.price === undefined || pricing.price === null) {
        errors.push(`Pricing tier at index ${index}: missing "price"`)
      }
    })

    if (errors.length > 0) {
      throw new Error(`Validation errors:\n${errors.join('\n')}`)
    }

    // Import pricing tiers one by one
    let successCount = 0
    let failCount = 0
    const failMessages = []

    for (const pricingData of jsonData) {
      try {
        const mutation = `
          mutation CreatePricing($input: CreatePricingInput!) {
            createPricing(input: $input) {
              id
              name
              description
              price
              priceType
              features
              group
              serviceCategory
              active
              order
            }
          }
        `
        await executeQuery(mutation, {
          input: {
            name: pricingData.name,
            description: pricingData.description || '',
            price: parseFloat(pricingData.price),
            priceType: pricingData.priceType || 'per-item',
            features: Array.isArray(pricingData.features) ? pricingData.features : (pricingData.features ? [pricingData.features] : []),
            group: pricingData.group || 'default',
            serviceCategory: pricingData.serviceCategory || '',
            active: pricingData.active !== false
          }
        })
        successCount++
      } catch (error) {
        failCount++
        failMessages.push(`${pricingData.name}: ${error.message || 'Failed to import'}`)
      }
    }

    // Refresh pricing list
    await fetchPricing()

    // Show results
    if (successCount > 0) {
      importSuccess.value = `Successfully imported ${successCount} pricing tier(s)`
      if (failCount > 0) {
        importError.value = `${failCount} pricing tier(s) failed:\n${failMessages.join('\n')}`
      }
    } else {
      importError.value = `Failed to import all pricing tiers:\n${failMessages.join('\n')}`
    }

    // Close modal after a delay if all succeeded
    if (failCount === 0) {
      setTimeout(() => {
        showImportModal.value = false
        importSuccess.value = ''
        importError.value = ''
      }, 2000)
    }
  } catch (error) {
    console.error('Error importing pricing:', error)
    importError.value = error.message || 'Failed to import pricing tiers. Please check the JSON format.'
  } finally {
    importing.value = false
    // Reset file input
    event.target.value = ''
  }
}

const downloadTemplate = () => {
  const template = [
    {
      name: 'Small',
      description: 'Perfect for small items',
      price: 9,
      priceType: 'per-item',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      group: 'pricing',
      active: true
    },
    {
      name: 'Medium',
      description: 'Ideal for medium items',
      price: 14,
      priceType: 'per-item',
      features: ['Premium feature'],
      group: 'pricing',
      active: true
    }
  ]

  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pricing-template.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

onMounted(async () => {
  await fetchPricing()
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

