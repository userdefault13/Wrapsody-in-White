<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Service Management</h1>
            <p class="text-gray-600 dark:text-gray-300">Manage your service types (drop off, delivery, onsite) and display order</p>
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
              <NuxtLink to="/admin/pricing" class="btn-secondary">
                Price Manager
              </NuxtLink>
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
                + Add Service
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
          <strong>Note:</strong> Services define how customers can access your wrapping (drop off, delivery, onsite). These are separate from pricing tiers. Reorder services using the up/down arrows.
        </p>
      </div>

      <!-- Services List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subtitle</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tag</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="(service, index) in services"
                :key="service.id"
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  index < 3 ? 'bg-green-50 dark:bg-green-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ service.order }}</span>
                    <div class="flex flex-col gap-1">
                      <button
                        @click="moveService(service.id, 'up')"
                        :disabled="index === 0"
                        class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      </button>
                      <button
                        @click="moveService(service.id, 'down')"
                        :disabled="index === services.length - 1"
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
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ service.title }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ service.subtitle || '-' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ service.description || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                    {{ service.tag || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {{ service.category || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      service.active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    ]"
                  >
                    {{ service.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      @click="editService(service)"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteService(service.id)"
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
        <div v-if="services.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No services found. Click "Add Service" to create one.</p>
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
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Import Services from JSON</h2>
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
                    <li>Upload a JSON file containing an array of services</li>
                    <li>Each service must have: title</li>
                    <li>Optional fields: subtitle, description, tag, category, active</li>
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

    <!-- Add/Edit Service Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddModal || editingService"
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
                  {{ editingService ? 'Edit Service' : 'Add Service' }}
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

              <form @submit.prevent="saveService" class="p-6 space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Service Title *
                  </label>
                  <input
                    v-model="serviceForm.title"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subtitle
                  </label>
                  <input
                    v-model="serviceForm.subtitle"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    v-model="serviceForm.description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tag
                    </label>
                    <input
                      v-model="serviceForm.tag"
                      type="text"
                      placeholder="e.g., Convenient, Quick"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      v-model="serviceForm.category"
                      type="text"
                      placeholder="e.g., dropoff, delivery, onsite"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="serviceForm.active"
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
                    {{ saving ? 'Saving...' : 'Save Service' }}
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

const services = ref([])
const showAddModal = ref(false)
const showImportModal = ref(false)
const editingService = ref(null)
const saving = ref(false)
const importing = ref(false)
const importError = ref('')
const importSuccess = ref('')

const serviceForm = ref({
  title: '',
  subtitle: '',
  description: '',
  tag: '',
  category: '',
  active: true
})

const fetchServices = async () => {
  try {
    const query = `
      query {
        services {
          id
          title
          subtitle
          description
          tag
          category
          active
          order
          createdAt
          updatedAt
        }
      }
    `
    const data = await executeQuery(query)
    services.value = data.services.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

const moveService = async (serviceId, direction) => {
  const currentIndex = services.value.findIndex(s => s.id === serviceId)
  if (currentIndex === -1) return

  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (newIndex < 0 || newIndex >= services.value.length) return

  // Swap orders
  const currentService = services.value[currentIndex]
  const targetService = services.value[newIndex]
  const tempOrder = currentService.order
  currentService.order = targetService.order
  targetService.order = tempOrder

    // Update in database using GraphQL
    try {
      const mutation = `
        mutation ReorderServices($input: ReorderServicesInput!) {
          reorderServices(input: $input)
        }
      `
      await executeQuery(mutation, {
        input: {
          services: [
            { id: currentService.id, order: currentService.order },
            { id: targetService.id, order: targetService.order }
          ]
        }
      })
    
    // Re-sort services
    services.value.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error reordering services:', error)
    // Revert on error
    await fetchServices()
  }
}

const editService = (service) => {
  editingService.value = service
  serviceForm.value = {
    title: service.title,
    subtitle: service.subtitle || '',
    description: service.description || '',
    tag: service.tag || '',
    category: service.category || '',
    active: service.active !== false
  }
}

const deleteService = async (serviceId) => {
  if (!confirm('Are you sure you want to delete this service?')) return

  try {
    const mutation = `
      mutation DeleteService($id: ID!) {
        deleteService(id: $id)
      }
    `
    await executeQuery(mutation, { id: serviceId })
    await fetchServices()
  } catch (error) {
    console.error('Error deleting service:', error)
    alert('Failed to delete service')
  }
}

const saveService = async () => {
  saving.value = true
  try {
    if (editingService.value) {
      // Update existing service
      const mutation = `
        mutation UpdateService($input: UpdateServiceInput!) {
          updateService(input: $input) {
            id
            title
            subtitle
            description
            tag
            category
            active
            order
          }
        }
      `
      await executeQuery(mutation, {
        input: {
          id: editingService.value.id,
          title: serviceForm.value.title,
          subtitle: serviceForm.value.subtitle,
          description: serviceForm.value.description,
          tag: serviceForm.value.tag,
          category: serviceForm.value.category,
          active: serviceForm.value.active
        }
      })
    } else {
      // Create new service
      const mutation = `
        mutation CreateService($input: CreateServiceInput!) {
          createService(input: $input) {
            id
            title
            subtitle
            description
            tag
            category
            active
            order
          }
        }
      `
      await executeQuery(mutation, {
        input: {
          title: serviceForm.value.title,
          subtitle: serviceForm.value.subtitle,
          description: serviceForm.value.description,
          tag: serviceForm.value.tag,
          category: serviceForm.value.category,
          active: serviceForm.value.active
        }
      })
    }

    await fetchServices()
    closeModal()
  } catch (error) {
    console.error('Error saving service:', error)
    const errorMessage = error?.message || error?.data?.message || 'Failed to save service'
    alert(`Error: ${errorMessage}`)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingService.value = null
  serviceForm.value = {
    title: '',
    subtitle: '',
    description: '',
    tag: '',
    category: '',
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
      throw new Error('JSON must be an array of services')
    }

    if (jsonData.length === 0) {
      throw new Error('JSON array is empty')
    }

    // Validate each service
    const errors = []
    jsonData.forEach((service, index) => {
      if (!service.title) {
        errors.push(`Service at index ${index}: missing "title"`)
      }
    })

    if (errors.length > 0) {
      throw new Error(`Validation errors:\n${errors.join('\n')}`)
    }

    // Import services one by one
    let successCount = 0
    let failCount = 0
    const failMessages = []

    for (const serviceData of jsonData) {
      try {
        const mutation = `
          mutation CreateService($input: CreateServiceInput!) {
            createService(input: $input) {
              id
              title
              subtitle
              description
              tag
              category
              active
              order
            }
          }
        `
        await executeQuery(mutation, {
          input: {
            title: serviceData.title,
            subtitle: serviceData.subtitle || '',
            description: serviceData.description || '',
            tag: serviceData.tag || '',
            category: serviceData.category || '',
            active: serviceData.active !== false
          }
        })
        successCount++
      } catch (error) {
        failCount++
        failMessages.push(`${serviceData.title || 'Unknown'}: ${error.message || 'Failed to import'}`)
      }
    }

    // Refresh services list
    await fetchServices()

    // Show results
    if (successCount > 0) {
      importSuccess.value = `Successfully imported ${successCount} service(s)`
      if (failCount > 0) {
        importError.value = `${failCount} service(s) failed:\n${failMessages.join('\n')}`
      }
    } else {
      importError.value = `Failed to import all services:\n${failMessages.join('\n')}`
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
    console.error('Error importing services:', error)
    importError.value = error.message || 'Failed to import services. Please check the JSON format.'
  } finally {
    importing.value = false
    // Reset file input
    event.target.value = ''
  }
}

const downloadTemplate = () => {
  const template = [
    {
      name: 'Example Service 1',
      description: 'This is an example service',
      price: 10,
      priceType: 'per-item',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      group: 'default',
      active: true
    },
    {
      name: 'Example Service 2',
      description: 'Another example service',
      price: 25,
      priceType: 'per-hour',
      features: ['Premium feature'],
      group: 'premium',
      active: true
    }
  ]

  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'services-template.json'
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
  await fetchServices()
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

