<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Inventory Manager</h1>
            <p class="text-gray-600 dark:text-gray-300">Manage wrapping paper, bows, ribbons, and boxes</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-2">
            <DarkModeToggle />
            <button
              @click="showReceivingModal = true"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Receive Stock
              </span>
            </button>
            <button
              @click="handleLogout"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Logout
              </span>
            </button>
            <button
              @click="showAddModal = true"
              class="relative group btn-primary flex items-center justify-center w-10 h-10 p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Add Inventory Item
              </span>
            </button>
            <NuxtLink to="/admin" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Dashboard
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Type</label>
            <select
              v-model="typeFilter"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="wrapping_paper">Wrapping Paper</option>
              <option value="bow">Bows</option>
              <option value="ribbon">Ribbons</option>
              <option value="box">Boxes</option>
              <option value="tag">Tags</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search by Name</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Item name..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Items"
          :value="inventory.length"
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Low Stock"
          :value="lowStockCount"
          icon="⚠️"
          color="yellow"
        />
        <StatCard
          title="Total Value"
          :value="formatCurrency(totalValue)"
          icon="💰"
          color="green"
        />
        <StatCard
          title="Out of Stock"
          :value="outOfStockCount"
          icon="❌"
          color="red"
        />
      </div>

      <!-- Inventory List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amazon</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Loading Spinner -->
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-12">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">Loading inventory...</p>
                  </div>
                </td>
              </tr>
              <!-- Inventory Items -->
              <tr
                v-for="item in filteredInventory"
                :key="item.id"
                v-if="!loading"
                @click="editItem(item)"
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors',
                  item.quantity === 0 ? 'bg-red-50 dark:bg-red-900/10' : item.quantity < 10 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="item.thumbnail"
                      :src="item.thumbnail"
                      :alt="item.name"
                      class="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
                      @error="handleImageError"
                    />
                    <div
                      v-else
                      class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium text-gray-900 dark:text-white" :title="item.name">
                        {{ item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeClass(item.type)">
                    {{ getTypeLabel(item.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="item.type === 'bow'" class="text-sm text-gray-400 dark:text-gray-600 italic">
                    N/A
                  </div>
                  <div v-else class="text-sm text-gray-900 dark:text-white">
                    {{ item.size || '-' }}
                    <span v-if="item.size && item.type === 'wrapping_paper'" class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      sqft
                    </span>
                    <span v-else-if="item.size && item.type === 'ribbon'" class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ft
                    </span>
                    <span v-else-if="item.size && item.type === 'tag'" class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      in
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getQuantityClass(item.quantity)">
                    {{ item.quantity }}
                  </span>
                  <div v-if="item.type === 'wrapping_paper' && item.remainingArea !== null && item.remainingArea !== undefined" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    On-hand: {{ item.remainingArea.toFixed(2) }} sqft
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    ${{ item.cost.toFixed(2) }}
                  </div>
                  <div v-if="item.quantity > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${{ (item.cost / item.quantity).toFixed(2) }} each
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.supplier || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                  <a
                    v-if="getAmazonUrl(item)"
                    :href="getAmazonUrl(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.27 13.73L15.54 5.99l-1.26 1.26 7.73 7.73-7.73 7.73 1.26 1.26 7.73-7.73zm-7.27 7.27l-1.26 1.26L2 13.73 14.74 1l1.26 1.26L4.52 13.73l11.48 11.27z"/>
                    </svg>
                    View on Amazon
                  </a>
                  <span v-else class="text-sm text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && filteredInventory.length === 0" class="p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 text-lg">No inventory items found.</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters or add a new item.</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddModal || editingItem"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="closeModal"
        >
          <div class="fixed inset-0 bg-black bg-opacity-50"></div>
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ editingItem ? 'Edit Inventory Item' : 'Add Inventory Item' }}
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

              <form @submit.prevent="saveItem" class="space-y-4">
                <!-- Amazon URL Import -->
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📦 Import from Amazon URL
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="amazonImportUrl"
                      type="url"
                      placeholder="Paste Amazon product URL here (e.g., https://amazon.com/dp/B08XYZ1234)"
                      class="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      @keyup.enter="parseAmazonUrl"
                    />
                    <button
                      type="button"
                      @click="parseAmazonUrl"
                      :disabled="!amazonImportUrl || !amazonImportUrl.trim() || fetchingAmazon"
                      class="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                    >
                      <svg v-if="fetchingAmazon" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ fetchingAmazon ? 'Processing...' : 'Import' }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Paste an Amazon product URL and click "Import" or press Enter to extract ASIN and auto-fill fields
                  </p>
                  <div v-if="formData.amazonAsin" class="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-300">
                    ✓ ASIN extracted: <strong>{{ formData.amazonAsin }}</strong>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      v-model="formData.name"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      v-model="formData.type"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Type</option>
                      <option value="wrapping_paper">Wrapping Paper</option>
                      <option value="bow">Bow</option>
                      <option value="ribbon">Ribbon</option>
                      <option value="box">Box</option>
                      <option value="tag">Tag</option>
                    </select>
                  </div>
                </div>
                
                <!-- Tag Subtype Selector (only shown when type is tag) -->
                <div v-if="formData.type === 'tag'" class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tag Type *
                    </label>
                    <select
                      v-model="formData.unit"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Tag Type</option>
                      <option value="sticker">Sticker</option>
                      <option value="hanging_tag">Hanging Tag</option>
                    </select>
                  </div>
                </div>

                <!-- Size field for non-tag types -->
                <div v-if="formData.type !== 'tag'" class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Size
                      <span v-if="formData.type === 'wrapping_paper'" class="text-xs text-gray-500 dark:text-gray-400">
                        (Size per roll in sqft)
                      </span>
                      <span v-else-if="formData.type === 'ribbon'" class="text-xs text-gray-500 dark:text-gray-400">
                        (Length per ribbon in ft)
                      </span>
                      <span v-else-if="formData.type === 'box'" class="text-xs text-gray-500 dark:text-gray-400">
                        (Dimensions: W x L x H)
                      </span>
                    </label>
                    <input
                      v-model="formData.size"
                      type="text"
                      :placeholder="getSizePlaceholder()"
                      :disabled="formData.type === 'bow'"
                      :class="[
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        formData.type === 'bow' 
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      ]"
                    />
                    <p v-if="formData.type === 'bow'" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Size not applicable for bows
                    </p>
                    <div v-if="(formData.type === 'wrapping_paper' || formData.type === 'ribbon') && formData.size && formData.cost > 0 && formData.quantity > 0" class="mt-2 space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span class="font-semibold">Size per {{ formData.type === 'wrapping_paper' ? 'roll' : 'ribbon' }}:</span> {{ formData.size }} {{ formData.type === 'wrapping_paper' ? 'sqft' : 'ft' }}
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span class="font-semibold">Total cost:</span> ${{ formData.cost.toFixed(2) }}
                      </p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        📊 Cost per {{ formData.type === 'wrapping_paper' ? 'roll' : 'ribbon' }}: ${{ calculateCostPerRoll().toFixed(4) }}
                      </p>
                      <p v-if="formData.type === 'wrapping_paper'" class="text-xs text-green-600 dark:text-green-400 font-semibold">
                        💰 Cost per sqft: ${{ calculateCostPerSqft().toFixed(4) }}
                      </p>
                      <p v-else-if="formData.type === 'ribbon'" class="text-xs text-green-600 dark:text-green-400 font-semibold">
                        💰 Cost per ft: ${{ calculateCostPerSqft().toFixed(4) }}
                      </p>
                    </div>
                    <div v-if="formData.type === 'box' && formData.cost > 0 && formData.quantity > 0" class="mt-2 space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span class="font-semibold">Total cost:</span> ${{ formData.cost.toFixed(2) }}
                      </p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        📊 Cost per box: ${{ calculateCostPerBox().toFixed(4) }}
                      </p>
                    </div>
                    <div v-if="formData.type === 'tag' && formData.cost > 0 && formData.quantity > 0" class="mt-2 space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span class="font-semibold">Total cost:</span> ${{ formData.cost.toFixed(2) }}
                      </p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        📊 Cost per tag: ${{ calculateCostPerTag().toFixed(4) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Width and Length fields for tags -->
                <div v-if="formData.type === 'tag'" class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Width (inches) *
                    </label>
                    <input
                      v-model.number="formData.tagWidth"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g., 2"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Length (inches) *
                    </label>
                    <input
                      v-model.number="formData.tagLength"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g., 3"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      v-model.number="formData.quantity"
                      type="number"
                      min="0"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <!-- Roll Dimensions (for wrapping paper) -->
                <div v-if="formData.type === 'wrapping_paper'" class="space-y-4">
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Roll Width (inches)
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          (Width of each roll)
                        </span>
                      </label>
                      <input
                        v-model.number="formData.rollWidth"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g., 30"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-filled from Amazon import
                      </p>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Roll Length (feet)
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          (Length of each roll)
                        </span>
                      </label>
                      <input
                        v-model.number="formData.rollLength"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g., 8.8"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-filled from Amazon import
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Roll/Ribbon Tracking (for wrapping paper and ribbons) -->
                <div v-if="(formData.type === 'wrapping_paper' || formData.type === 'ribbon') && formData.quantity > 0" class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div class="flex items-center justify-between mb-3">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <span v-if="formData.type === 'wrapping_paper'">On-Hand per Roll (sqft)</span>
                      <span v-else-if="formData.type === 'ribbon'">On-Hand per Ribbon (ft)</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        <span v-if="formData.type === 'wrapping_paper'">(remaining area for each roll)</span>
                        <span v-else-if="formData.type === 'ribbon'">(remaining length for each ribbon)</span>
                      </span>
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        @click="addRoll"
                        class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1"
                        title="Add a new roll"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        <span v-if="formData.type === 'wrapping_paper'">Add Roll</span>
                        <span v-else-if="formData.type === 'ribbon'">Add Ribbon</span>
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <template v-for="(roll, index) in groupedRolls" :key="index">
                      <!-- Paired rolls (grouped together - Image 2 format, takes full width) -->
                      <div v-if="roll.isPaired" class="col-span-full border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                            </svg>
                            <span class="text-xs font-semibold text-blue-700 dark:text-blue-300">Paired Rolls (Share Inventory)</span>
                          </div>
                          <!-- Remove paired rolls button -->
                          <button
                            type="button"
                            @click="removePairedRolls(roll)"
                            class="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            :disabled="!formData.rolls || formData.rolls.length <= 2"
                            :title="(!formData.rolls || formData.rolls.length <= 2) ? 'Cannot remove - need at least 2 rolls' : 'Remove paired rolls'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div v-for="(pairedRoll, pairIndex) in roll.rolls" :key="pairIndex" class="space-y-2">
                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                              <span v-if="formData.type === 'wrapping_paper'">Roll {{ pairedRoll.rollNumber }}</span>
                              <span v-else-if="formData.type === 'ribbon'">Ribbon {{ pairedRoll.rollNumber }}</span>
                              <span v-if="pairedRoll.printName" class="block mt-1 text-xs text-gray-500 dark:text-gray-500">
                                {{ pairedRoll.printName }}
                              </span>
                            </label>
                            
                            <!-- Image upload for wrapping paper rolls -->
                            <div v-if="formData.type === 'wrapping_paper'" class="relative">
                              <div v-if="pairedRoll.image" class="relative group">
                                <img
                                  :src="pairedRoll.image"
                                  :alt="`Roll ${pairedRoll.rollNumber}`"
                                  class="w-full h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                  @error="pairedRoll.image = null"
                                />
                                <button
                                  type="button"
                                  @click.stop="removeRollImage(pairedRoll.rollNumber - 1)"
                                  class="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove image"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                </button>
                              </div>
                              <label
                                v-else
                                class="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-gray-50 dark:bg-gray-800/50"
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  class="hidden"
                                  @change="handleRollImageUpload($event, pairedRoll.rollNumber - 1)"
                                />
                                <div class="flex flex-col items-center gap-1">
                                  <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                  </svg>
                                  <span class="text-xs text-gray-500 dark:text-gray-400">Add Image</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                        <!-- Name input for paired rolls -->
                        <div class="mt-3 relative print-name-dropdown-container">
                          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Name
                          </label>
                          <div class="relative">
                            <input
                              :value="roll.rolls[0]?.printName || ''"
                              @input="updatePairedRollsName(roll, $event.target.value)"
                              @focus="showPrintNameDropdown = `paired-${roll.rolls[0]?.rollNumber}`"
                              @click="showPrintNameDropdown = `paired-${roll.rolls[0]?.rollNumber}`"
                              type="text"
                              class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter roll name"
                            />
                            <button
                              v-if="formData.printNames && formData.printNames.length > 0"
                              @click.stop="showPrintNameDropdown = showPrintNameDropdown === `paired-${roll.rolls[0]?.rollNumber}` ? null : `paired-${roll.rolls[0]?.rollNumber}`"
                              type="button"
                              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                              </svg>
                            </button>
                          </div>
                          <!-- Dropdown for print names -->
                          <div
                            v-if="showPrintNameDropdown === `paired-${roll.rolls[0]?.rollNumber}` && formData.printNames && formData.printNames.length > 0"
                            class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                          >
                            <div
                              v-for="(printName, index) in formData.printNames"
                              :key="index"
                              @click="updatePairedRollsName(roll, printName); showPrintNameDropdown = null"
                              class="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              {{ printName }}
                            </div>
                          </div>
                        </div>
                        <!-- Shared onHand input for paired rolls -->
                        <div class="mt-3">
                          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Shared On-Hand (sqft)
                          </label>
                          <input
                            :value="roll.sharedOnHand || roll.rolls[0]?.onHand || 0"
                            @input="updatePairedRollsOnHand(roll, $event.target.value)"
                            type="number"
                            step="0.01"
                            min="0"
                            :max="roll.maxArea"
                            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0.00"
                          />
                          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Max: {{ roll.maxArea.toFixed(2) }} <span v-if="formData.type === 'wrapping_paper'">sqft</span><span v-else-if="formData.type === 'ribbon'">ft</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Unpaired roll (normal display - Image 1 format) -->
                      <!-- When reversible is checked, card is half-width (2 per row). When unchecked, full width -->
                      <div v-else class="space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3" :class="shouldShowHalfWidth(roll) ? 'md:col-span-1' : 'md:col-span-full'">
                        <div class="flex items-center justify-between">
                          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            <span v-if="formData.type === 'wrapping_paper'">Roll {{ roll.rollNumber }}</span>
                            <span v-else-if="formData.type === 'ribbon'">Ribbon {{ roll.rollNumber }}</span>
                          </label>
                          <div class="flex items-center gap-2">
                            <!-- Remove roll button -->
                            <button
                              type="button"
                              @click="removeRoll(roll.rollNumber)"
                              class="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  :disabled="!formData.rolls || formData.rolls.length <= 1"
                  :title="(!formData.rolls || formData.rolls.length <= 1) ? 'Cannot remove the last roll' : 'Remove this roll'"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                            <!-- Make reversible toggle -->
                            <div v-if="formData.type === 'wrapping_paper'" class="flex items-center gap-1">
                              <input
                                :checked="getRollHasReverseSide(roll.rollNumber)"
                                type="checkbox"
                                @change="handleRollReversibleToggle(roll)"
                                class="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <label class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">Reversible</label>
                            </div>
                          </div>
                        </div>
                      
                      <!-- Image upload for wrapping paper rolls -->
                      <div v-if="formData.type === 'wrapping_paper'" class="relative">
                        <div v-if="roll.image" class="relative group">
                          <img
                            :src="roll.image"
                            :alt="`Roll ${roll.rollNumber}`"
                            class="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            @error="roll.image = null"
                          />
                          <button
                            type="button"
                            @click.stop="removeRollImage(roll.rollNumber - 1)"
                            class="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                        <label
                          v-else
                          class="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-gray-50 dark:bg-gray-800/50"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="handleRollImageUpload($event, roll.rollNumber - 1)"
                          />
                          <div class="flex flex-col items-center gap-1">
                            <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            <span class="text-xs text-gray-500 dark:text-gray-400">Add Image</span>
                          </div>
                        </label>
                      </div>
                      
                      <!-- Name input for roll -->
                      <div class="mt-2 relative print-name-dropdown-container">
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Name
                        </label>
                        <div class="relative">
                          <input
                            v-model="roll.printName"
                            @focus="showPrintNameDropdown = roll.rollNumber"
                            @click="showPrintNameDropdown = roll.rollNumber"
                            type="text"
                            class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter roll name"
                          />
                          <button
                            v-if="formData.printNames && formData.printNames.length > 0"
                            @click.stop="showPrintNameDropdown = showPrintNameDropdown === roll.rollNumber ? null : roll.rollNumber"
                            type="button"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </button>
                        </div>
                        <!-- Dropdown for print names -->
                        <div
                          v-if="showPrintNameDropdown === roll.rollNumber && formData.printNames && formData.printNames.length > 0"
                          class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                        >
                          <div
                            v-for="(printName, index) in formData.printNames"
                            :key="index"
                            @click="roll.printName = printName; showPrintNameDropdown = null"
                            class="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            {{ printName }}
                          </div>
                        </div>
                      </div>
                      
                      <input
                        v-model.number="roll.onHand"
                        type="number"
                        step="0.01"
                        min="0"
                        :max="roll.maxArea"
                        class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-2"
                        placeholder="0.00"
                      />
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Max: {{ roll.maxArea.toFixed(2) }} <span v-if="formData.type === 'wrapping_paper'">sqft</span><span v-else-if="formData.type === 'ribbon'">ft</span>
                      </div>
                      </div>
                    </template>
                  </div>
                  <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-600 dark:text-gray-400">Total On-Hand:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">
                        {{ totalRollOnHand.toFixed(2) }} <span v-if="formData.type === 'wrapping_paper'">sqft</span><span v-else-if="formData.type === 'ribbon'">ft</span>
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-sm mt-1">
                      <span class="text-gray-600 dark:text-gray-400">Total {{ formData.type === 'wrapping_paper' ? 'Area' : 'Length' }}:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">
                        {{ totalRollArea.toFixed(2) }} <span v-if="formData.type === 'wrapping_paper'">sqft</span><span v-else-if="formData.type === 'ribbon'">ft</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Total Cost *
                      <span v-if="formData.type === 'wrapping_paper' || formData.type === 'ribbon'" class="text-xs text-gray-500 dark:text-gray-400">
                        (Cost for entire pack)
                      </span>
                    </label>
                    <input
                      v-model.number="formData.cost"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p v-if="(formData.type === 'wrapping_paper' || formData.type === 'ribbon') && formData.cost > 0 && formData.quantity > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Total cost for {{ formData.quantity }} roll{{ formData.quantity !== 1 ? 's' : '' }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Unit
                    </label>
                    <input
                      v-model="formData.unit"
                      type="text"
                      placeholder="e.g., each, roll, pack"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Supplier
                  </label>
                  <input
                    v-model="formData.supplier"
                    type="text"
                    placeholder="Supplier name"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail Image URL
                  </label>
                  <input
                    v-model="formData.thumbnail"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Product image URL (will be auto-filled from Amazon if available)
                  </p>
                  <div v-if="formData.thumbnail" class="mt-2">
                    <img
                      :src="formData.thumbnail"
                      alt="Thumbnail preview"
                      class="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      @error="handleImageError"
                    />
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Amazon ASIN
                    </label>
                    <input
                      v-model="formData.amazonAsin"
                      type="text"
                      placeholder="B08XYZ1234"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      @blur="generateAmazonUrl"
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter ASIN to auto-generate Amazon URL
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Amazon Product URL
                    </label>
                    <input
                      v-model="formData.amazonUrl"
                      type="url"
                      placeholder="https://amazon.com/dp/..."
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Or paste full Amazon product URL
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    v-model="formData.notes"
                    rows="3"
                    placeholder="Additional notes..."
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <div class="flex gap-4 pt-4">
                  <button
                    v-if="editingItem"
                    type="button"
                    @click.stop="handleDeleteFromModal"
                    :disabled="saving"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete
                  </button>
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
                    class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ saving ? 'Saving...' : (editingItem ? 'Update' : 'Create') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Receiving Modal -->
    <ReceivingModal
      :is-open="showReceivingModal"
      :inventory-items="inventory"
      @close="showReceivingModal = false"
      @received="handleReceiving"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useGraphQL } from '~/composables/useGraphQL'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'admin'
})

const { disconnect, walletAddress } = useAuth()
const router = useRouter()
const { executeQuery } = useGraphQL()

const inventory = ref([])
const loading = ref(true)
const showAddModal = ref(false)
const showReceivingModal = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const typeFilter = ref('')
const searchQuery = ref('')
const amazonImportUrl = ref('')
const fetchingAmazon = ref(false)
const showPrintNameDropdown = ref(null) // Track which roll's name field is open

const formData = ref({
  name: '',
  type: '',
  size: '',
  cost: 0,
  quantity: 0,
  unit: 'each',
  rollLength: null,
  rollWidth: null,
  tagWidth: null, // Width in inches for tags
  tagLength: null, // Length in inches for tags
  remainingArea: null,
  totalArea: null,
    rolls: [], // Array of { rollNumber, onHand, maxArea }
    printNames: [], // Array of available print names from Amazon
    supplier: '',
    thumbnail: '',
    amazonAsin: '',
    amazonUrl: '',
    notes: ''
})

// Watch for type changes and set default values for tags
watch(() => formData.value.type, (newType) => {
  if (newType === 'tag') {
    // Set default width and length to 2x3 if not already set
    if (formData.value.tagWidth == null) {
      formData.value.tagWidth = 2
    }
    if (formData.value.tagLength == null) {
      formData.value.tagLength = 3
    }
  } else {
    // Clear tag dimensions when switching away from tag type
    formData.value.tagWidth = null
    formData.value.tagLength = null
  }
})

const filteredInventory = computed(() => {
  let filtered = inventory.value

  if (typeFilter.value) {
    filtered = filtered.filter(item => item.type === typeFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.size && item.size.toLowerCase().includes(query)) ||
      (item.supplier && item.supplier.toLowerCase().includes(query))
    )
  }

  return filtered.sort((a, b) => {
    // Sort by type first, then by name
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type)
    }
    return a.name.localeCompare(b.name)
  })
})

const lowStockCount = computed(() => {
  return inventory.value.filter(item => item.quantity > 0 && item.quantity < 10).length
})

const outOfStockCount = computed(() => {
  return inventory.value.filter(item => item.quantity === 0).length
})

const totalValue = computed(() => {
  return inventory.value.reduce((sum, item) => sum + item.cost, 0)
})

const getTypeLabel = (type) => {
  const labels = {
    wrapping_paper: 'Wrapping Paper',
    bow: 'Bow',
    ribbon: 'Ribbon',
    box: 'Box',
    tag: 'Tag'
  }
  return labels[type] || type
}

const getTypeClass = (type) => {
  const classes = {
    wrapping_paper: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    bow: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    ribbon: 'px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
    box: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    tag: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  }
  return classes[type] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

const getQuantityClass = (quantity) => {
  if (quantity === 0) {
    return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  if (quantity < 10) {
    return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  }
  return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
}

const getSizePlaceholder = () => {
  if (formData.value.type === 'wrapping_paper') {
    return 'e.g., 30, 50, 100 (sqft)'
  }
  if (formData.value.type === 'ribbon') {
    return 'e.g., 6, 10, 15 (ft)'
  }
  if (formData.value.type === 'box') {
    return 'e.g., 12x12x6, 10x8x4 (W x L x H)'
  }
  if (formData.value.type === 'tag') {
    return 'e.g., 2 x 3, 3 x 4 (W x L in inches)'
  }
  if (formData.value.type === 'bow') {
    return 'Size not applicable'
  }
  return 'e.g., Small, Medium, Large'
}

const calculateCostPerRoll = () => {
  // Cost per roll = total cost / quantity
  if (formData.value.cost > 0 && formData.value.quantity > 0) {
    return formData.value.cost / formData.value.quantity
  }
  return 0
}

const calculateCostPerSqft = () => {
  // Cost per sqft = cost per roll / size per roll
  // Or: cost per sqft = total cost / (size per roll * quantity)
  if ((formData.value.type === 'wrapping_paper' || formData.value.type === 'ribbon') && formData.value.size && formData.value.cost > 0 && formData.value.quantity > 0) {
    const sizePerRoll = parseFloat(formData.value.size)
    if (sizePerRoll > 0) {
      const costPerRoll = calculateCostPerRoll()
      return costPerRoll / sizePerRoll
    }
  }
  return 0
}

const calculateCostPerBox = () => {
  // Cost per box = total cost / quantity
  if (formData.value.type === 'box' && formData.value.cost > 0 && formData.value.quantity > 0) {
    return formData.value.cost / formData.value.quantity
  }
  return 0
}

const calculateCostPerTag = () => {
  // Cost per tag = total cost / quantity
  if (formData.value.type === 'tag' && formData.value.cost > 0 && formData.value.quantity > 0) {
    return formData.value.cost / formData.value.quantity
  }
  return 0
}

// Computed property for roll/ribbon on-hand inputs (works for both wrapping paper and ribbons)
const rollOnHandInputs = computed(() => {
  if (formData.value.type !== 'wrapping_paper' && formData.value.type !== 'ribbon') {
    return []
  }
  
  const sizePerItem = parseFloat(formData.value.size) || 0
  const maxArea = sizePerItem // For ribbons, this represents length in sqft (or feet)
  
  // Initialize rolls array if needed (reusing "rolls" structure for both wrapping paper and ribbons)
  // If rolls don't exist or quantity is set and doesn't match rolls length, initialize from quantity
  if (!formData.value.rolls || formData.value.rolls.length === 0) {
    // If quantity is set, initialize rolls from quantity
    if (formData.value.quantity && formData.value.quantity > 0) {
      const rolls = []
      for (let i = 0; i < formData.value.quantity; i++) {
        rolls.push({
          rollNumber: i + 1,
          onHand: maxArea,
          maxArea: maxArea,
          image: null,
          printName: null,
          hasReverseSide: false,
          pairedRollNumber: null
        })
      }
      formData.value.rolls = rolls
      return rolls
    } else {
      // No quantity set and no rolls exist - return empty array (user can add rolls manually)
      return []
    }
  }
  
  // Update maxArea for existing rolls when size changes
  formData.value.rolls.forEach(roll => {
    roll.maxArea = maxArea
  })
  
  return formData.value.rolls
})

// Group rolls by pairing - paired rolls are grouped together
const groupedRolls = computed(() => {
  if (!rollOnHandInputs.value || rollOnHandInputs.value.length === 0) {
    return []
  }
  
  const processed = new Set()
  const groups = []
  
  // Sort rolls by rollNumber to ensure proper ordering
  const sortedRolls = [...rollOnHandInputs.value].sort((a, b) => a.rollNumber - b.rollNumber)
  
  for (const roll of sortedRolls) {
    if (processed.has(roll.rollNumber)) continue
    
    // Check if this roll is paired with another
    if (roll.hasReverseSide && roll.pairedRollNumber) {
      const pairedRoll = sortedRolls.find(r => r.rollNumber === roll.pairedRollNumber)
      if (pairedRoll && !processed.has(pairedRoll.rollNumber)) {
        // Use the first roll's onHand as the shared value
        const sharedOnHand = roll.onHand
        groups.push({
          isPaired: true,
          rolls: [roll, pairedRoll],
          sharedOnHand: sharedOnHand, // They share the same onHand
          maxArea: roll.maxArea
        })
        processed.add(roll.rollNumber)
        processed.add(pairedRoll.rollNumber)
      } else {
        // Paired roll not found or already processed, treat as unpaired
        groups.push({
          isPaired: false,
          rollNumber: roll.rollNumber,
          onHand: roll.onHand,
          maxArea: roll.maxArea,
          image: roll.image,
          printName: roll.printName,
          hasReverseSide: roll.hasReverseSide,
          pairedRollNumber: roll.pairedRollNumber
        })
        processed.add(roll.rollNumber)
      }
    } else {
      // Unpaired roll - show as individual card
      groups.push({
        isPaired: false,
        rollNumber: roll.rollNumber,
        onHand: roll.onHand,
        maxArea: roll.maxArea,
        image: roll.image,
        print1Name: roll.print1Name,
        print2Name: roll.print2Name,
        hasReverseSide: roll.hasReverseSide,
        pairedRollNumber: roll.pairedRollNumber
      })
      processed.add(roll.rollNumber)
    }
  }
  
  return groups
})

const totalRollOnHand = computed(() => {
  if (!rollOnHandInputs.value || rollOnHandInputs.value.length === 0) {
    return formData.value.remainingArea || 0
  }
  return rollOnHandInputs.value.reduce((sum, roll) => sum + (roll.onHand || 0), 0)
})

const totalRollArea = computed(() => {
  if ((formData.value.type !== 'wrapping_paper' && formData.value.type !== 'ribbon') || !formData.value.size || !formData.value.quantity) {
    return formData.value.totalArea || 0
  }
  const sizePerItem = parseFloat(formData.value.size) || 0
  return sizePerItem * formData.value.quantity
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getAmazonUrl = (item) => {
  if (item.amazonUrl) {
    return item.amazonUrl
  }
  if (item.amazonAsin) {
    // Generate Amazon URL from ASIN
    return `https://www.amazon.com/dp/${item.amazonAsin}`
  }
  return null
}

const generateAmazonUrl = () => {
  if (formData.value.amazonAsin && !formData.value.amazonUrl) {
    // Only auto-generate if URL is not already set
    formData.value.amazonUrl = `https://www.amazon.com/dp/${formData.value.amazonAsin}`
  }
}

const parseAmazonUrl = async () => {
  console.log('parseAmazonUrl called, amazonImportUrl.value:', amazonImportUrl.value)
  
  if (!amazonImportUrl.value || !amazonImportUrl.value.trim()) {
    alert('Please enter an Amazon product URL')
    return
  }

  try {
    fetchingAmazon.value = true
    const url = amazonImportUrl.value.trim()
    console.log('Parsing URL:', url)

    // Extract ASIN from various Amazon URL formats
    // Pattern 1: /dp/B07R5CCT37 or /product/B07R5CCT37
    // Pattern 2: /dp/B07R5CCT37/ (with trailing slash)
    // Pattern 3: /gp/product/B07R5CCT37
    let asin = null
    
    // Try multiple regex patterns to match different URL formats
    // Handle URLs like: /Hallmark-Christmas-Wrapping-Reverse-Snowflakes/dp/B07R5CCT37/ref=...
    const patterns = [
      /\/dp\/([A-Z0-9]{10})(?:\/|$|\?|&)/,  // /dp/B07R5CCT37/ or /dp/B07R5CCT37? or /dp/B07R5CCT37&
      /\/product\/([A-Z0-9]{10})(?:\/|$|\?|&)/,  // /product/B07R5CCT37/
      /\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?|&)/,  // /gp/product/B07R5CCT37/
      /\/dp\/([A-Z0-9]{10})/,  // Fallback: /dp/B07R5CCT37
      /\/product\/([A-Z0-9]{10})/,  // Fallback: /product/B07R5CCT37
    ]

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i]
      const match = url.match(pattern)
      console.log(`Pattern ${i + 1} test:`, pattern, 'Match:', match)
      if (match && match[1] && match[1].length === 10) {
        asin = match[1]
        console.log('✓ ASIN found:', asin, 'using pattern', i + 1)
        break
      }
    }

    if (!asin) {
      console.error('❌ Could not extract ASIN from URL:', url)
      alert('Could not extract ASIN from URL. Please ensure the URL is a valid Amazon product URL.\n\nExample: https://www.amazon.com/dp/B07R5CCT37')
      fetchingAmazon.value = false
      return
    }

    console.log('✅ Extracted ASIN:', asin)
    
    // Set ASIN and URL
    formData.value.amazonAsin = asin
    formData.value.amazonUrl = `https://www.amazon.com/dp/${asin}`

    // Extract product name from URL path (format: /Product-Name/dp/ASIN)
    if (!formData.value.name) {
      const nameMatch = url.match(/amazon\.com\/([^\/]+)\/dp\//)
      if (nameMatch && nameMatch[1]) {
        // Clean up the name: replace hyphens with spaces and capitalize
        const rawName = nameMatch[1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
        formData.value.name = rawName
        console.log('Extracted name from URL:', rawName)
      }
    }

    // Auto-detect type from URL/name keywords if not already set
    if (!formData.value.type) {
      const searchText = (formData.value.name || url).toLowerCase()
      
      // Check for tag keywords first (before other types)
      if (searchText.includes('tag') || searchText.includes('gift tag') || searchText.includes('sticker')) {
        formData.value.type = 'tag'
        console.log('Auto-detected type: tag')
      } else if (searchText.includes('box') && !searchText.includes('gift box') && !searchText.includes('wrapping')) {
        // Check for box keywords (before wrapping paper, since "wrapping paper box" exists)
        formData.value.type = 'box'
        console.log('Auto-detected type: box')
      } else if (searchText.includes('ribbon')) {
        // Check ribbon BEFORE wrapping, since "ribbon wrapping" products exist
        formData.value.type = 'ribbon'
        console.log('Auto-detected type: ribbon')
      } else if (searchText.includes('wrapping') || searchText.includes('wrap') || searchText.includes('paper')) {
        formData.value.type = 'wrapping_paper'
        console.log('Auto-detected type: wrapping_paper')
      } else if (searchText.includes('bow')) {
        formData.value.type = 'bow'
        console.log('Auto-detected type: bow')
      }
    }

    // Try to fetch product information from our API
    try {
      const response = await $fetch('/api/amazon/product', {
        method: 'POST',
        body: { url: url, asin: asin }
      })

      console.log('Amazon API response:', response)

      if (response.success && response.data) {
        const product = response.data
        console.log('📦 Product data received:', {
          title: product.title,
          type: product.type,
          price: product.price,
          size: product.size,
          quantity: product.quantity,
          thumbnail: product.thumbnail,
          brand: product.brand,
          includedComponents: product.includedComponents,
          dimensions: product.dimensions,
          rollWidth: product.rollWidth,
          rollLength: product.rollLength,
          description: product.description ? product.description.substring(0, 200) : null
        })
        
        // Use type from product data if available (set by parser)
        if (product.type) {
          formData.value.type = product.type
          console.log('✅ Set type from Amazon parser:', product.type)
        }
        
        // Check if this is a tag product (unit field contains sticker or hanging_tag)
        if (product.unit === 'sticker' || product.unit === 'hanging_tag') {
          if (!formData.value.type) {
            formData.value.type = 'tag'
            console.log('✅ Auto-selected type: tag (from unit field)')
          }
          formData.value.unit = product.unit
          console.log('✅ Set tag subtype:', product.unit)
        }
        
        // Check "Included Components" field - if it contains "Box", auto-select box type
        if (product.includedComponents) {
          const componentsText = product.includedComponents.toLowerCase()
          if (componentsText.includes('box') && !formData.value.type) {
            formData.value.type = 'box'
            console.log('✅ Auto-selected type: box (from Included Components)')
          }
        }
        
        // Handle reverse-side prints for wrapping paper
        if (product.hasReverseSide && formData.value.type === 'wrapping_paper') {
          formData.value.hasReverseSide = true
          if (product.printName) {
            formData.value.printName = product.printName
            console.log('✅ Set print name:', product.printName)
          }
          console.log('🔄 Enabled reverse-side prints for wrapping paper')
        }
        
        // Set printNames array if available
        if (product.printNames && Array.isArray(product.printNames) && product.printNames.length > 0) {
          formData.value.printNames = product.printNames
          console.log('✅ Set print names array:', product.printNames)
        }
        
        // Set rolls array if available (from Ollama parser)
        if (product.rolls && Array.isArray(product.rolls) && product.rolls.length > 0) {
          formData.value.rolls = product.rolls.map((roll) => ({
            rollNumber: roll.rollNumber || 0,
            onHand: roll.onHand || 0,
            maxArea: roll.maxArea || roll.onHand || 0,
            image: roll.image || null,
            printName: roll.printName || null,
            hasReverseSide: roll.hasReverseSide || false,
            pairedRollNumber: roll.pairedRollNumber || null
          }))
          console.log('✅ Set rolls array from Ollama parser:', formData.value.rolls.length, 'rolls')
        }
        
        // Auto-fill fields from Amazon product data (only if fields are empty)
        if (product.title && !formData.value.name) {
          formData.value.name = product.title
        }
        // Set total cost from Amazon price
        if (product.price) {
          const amazonPrice = parseFloat(product.price)
          if (amazonPrice > 0) {
            formData.value.cost = amazonPrice
            console.log('✅ Set total cost from Amazon:', amazonPrice)
          }
        }
        if (product.brand && !formData.value.supplier) {
          formData.value.supplier = product.brand
        }
        // Set thumbnail from Amazon product image
        if (product.thumbnail) {
          // Clean and validate the image URL
          let thumbnailUrl = product.thumbnail.trim()
          
          // Remove any trailing characters that might break the URL
          thumbnailUrl = thumbnailUrl.split(/[,\s\]\}]/)[0]
          
          // Ensure it's a valid URL
          if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
            formData.value.thumbnail = thumbnailUrl
            console.log('✅ Set thumbnail from Amazon:', thumbnailUrl)
          } else {
            console.log('⚠️ Invalid thumbnail URL format:', thumbnailUrl)
          }
        } else {
          console.log('⚠️ No thumbnail found in product data')
        }
        // Set roll dimensions if available (for wrapping paper)
        // Set these values even if type isn't set yet - they'll be used when type is wrapping_paper
        // Set roll dimensions from Amazon parser
        if (product.rollLength != null || product.rollWidth != null) {
          console.log('📏 Roll dimensions from Amazon parser:', {
            rollLength: product.rollLength,
            rollWidth: product.rollWidth,
            rollLengthType: typeof product.rollLength,
            rollWidthType: typeof product.rollWidth
          })
          
          if (product.rollLength != null) {
            formData.value.rollLength = parseFloat(product.rollLength)
            console.log('✅ Set rollLength:', formData.value.rollLength, 'feet')
          } else {
            console.log('⚠️ rollLength is null/undefined, not setting')
          }
          
          if (product.rollWidth != null) {
            formData.value.rollWidth = parseFloat(product.rollWidth)
            console.log('✅ Set rollWidth:', formData.value.rollWidth, 'inches')
          } else {
            console.log('⚠️ rollWidth is null/undefined, not setting')
          }
          
          console.log('📏 Final formData roll dimensions:', {
            rollLength: formData.value.rollLength,
            rollWidth: formData.value.rollWidth
          })
          console.log('📋 FormData roll dimensions after setting:', {
            rollLength: formData.value.rollLength,
            rollWidth: formData.value.rollWidth
          })
        } else {
          console.log('⚠️ Roll dimensions not found in Amazon product:', {
            rollLength: product.rollLength,
            rollWidth: product.rollWidth
          })
        }
        // Handle description/notes - for boxes, this may include material and color
        if (product.description) {
          if (!formData.value.notes) {
            formData.value.notes = product.description.substring(0, 500) // Limit to 500 chars
          } else {
            // Append description if it contains new information
            const existingNotes = formData.value.notes.toLowerCase()
            const newDescription = product.description.substring(0, 200)
            if (!existingNotes.includes(newDescription.toLowerCase().substring(0, 50))) {
              formData.value.notes += `\n\n${newDescription}`
            }
          }
        }
        
        // Handle size based on product type
        if (formData.value.type === 'box') {
          // For boxes, use dimensions field - prioritize dimensions over size
          if (product.dimensions && !formData.value.size) {
            formData.value.size = product.dimensions
            console.log('✅ Extracted box dimensions:', product.dimensions)
          } else if (product.size && !formData.value.size) {
            // Sometimes size might contain dimensions for boxes
            formData.value.size = product.size
            console.log('✅ Using size field for box dimensions:', product.size)
          }
          // If we have dimensions but size is still empty, try to extract from description or other fields
          if (!formData.value.size && product.description) {
            // Look for dimension patterns in description
            const dimensionPattern = /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(?:inches?|in\.?)/i
            const dimMatch = product.description.match(dimensionPattern)
            if (dimMatch) {
              formData.value.size = `${dimMatch[1]}x${dimMatch[2]}x${dimMatch[3]}`
              console.log('✅ Extracted box dimensions from description:', formData.value.size)
            }
          }
        } else if (product.size && !formData.value.size) {
          // For tags, extract width and length separately
          if (formData.value.type === 'tag') {
            // Convert "2x3" or "2 x 3" to separate width and length
            const sizeMatch = product.size.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/i)
            if (sizeMatch && sizeMatch[1] && sizeMatch[2]) {
              formData.value.tagWidth = parseFloat(sizeMatch[1])
              formData.value.tagLength = parseFloat(sizeMatch[2])
              console.log('✅ Extracted tag dimensions - Width:', formData.value.tagWidth, 'Length:', formData.value.tagLength)
            }
          } else {
            // For wrapping paper and ribbons, extract the number and unit
            // Format might be "88 sqft" or "6 ft"
            const sizeMatch = product.size.match(/(\d+\.?\d*)\s*(sqft|ft|sq\.?\s*ft\.?)/i)
            if (sizeMatch) {
              // Keep the full size string (e.g., "6 ft" or "88 sqft")
              formData.value.size = product.size
              console.log('✅ Extracted size:', product.size)
            } else {
              // Fallback: just extract the number
              const numberMatch = product.size.match(/(\d+\.?\d*)/)
              if (numberMatch) {
                // Add appropriate unit based on type
                if (formData.value.type === 'ribbon') {
                  formData.value.size = `${numberMatch[1]} ft`
                } else {
                  formData.value.size = `${numberMatch[1]} sqft`
                }
                console.log('✅ Extracted size:', formData.value.size)
              } else {
                formData.value.size = product.size
              }
            }
          }
        }
        
        // Handle quantity for tags
        if (formData.value.type === 'tag' && product.quantity) {
          formData.value.quantity = product.quantity
          console.log('✅ Set tag quantity from Amazon:', product.quantity)
        } else if (product.dimensions && !formData.value.size && formData.value.type !== 'box') {
          // Only use dimensions for non-box items if size wasn't found
          formData.value.size = product.dimensions
        }
        
        // Set quantity if found
        // For ribbons, the API may have parsed the correct pack count from description
        // which overrides the Unit Count (which might be total length)
        if (product.quantity) {
          if (formData.value.type === 'ribbon' && product.quantity < 1000) {
            // For ribbons, always use the quantity from API (may have been parsed from description)
            formData.value.quantity = product.quantity
            console.log('✅ Set ribbon quantity from Amazon:', product.quantity)
          } else if (formData.value.quantity === 0) {
            // For other types, only set if quantity is currently 0
            formData.value.quantity = product.quantity
            console.log('✅ Extracted quantity:', product.quantity)
          }
        }
        
        // Calculate and store cost breakdown in notes
        if (product.price && product.size && product.quantity && (formData.value.type === 'wrapping_paper' || formData.value.type === 'ribbon')) {
          const sizeMatch = product.size.match(/(\d+)/)
          if (sizeMatch && product.quantity > 0) {
            const sqft = parseFloat(sizeMatch[1])
            const totalCost = parseFloat(product.price)
            const costPerRoll = totalCost / product.quantity
            const costPerSqft = costPerRoll / sqft
            
            console.log('💰 Calculated breakdown:')
            console.log('  Total cost:', totalCost)
            console.log('  Cost per roll:', costPerRoll.toFixed(4))
            console.log('  Cost per sqft:', costPerSqft.toFixed(4))
            
            // Store breakdown in notes
            const breakdown = `Size per roll: ${sqft} sqft\nTotal cost: $${totalCost.toFixed(2)}\nCost per roll: $${costPerRoll.toFixed(4)}\nCost per sqft: $${costPerSqft.toFixed(4)}`
            if (!formData.value.notes) {
              formData.value.notes = breakdown
            } else if (!formData.value.notes.includes('Cost per sqft')) {
              formData.value.notes += `\n\n${breakdown}`
            }
          }
        }
      }
    } catch (apiError) {
      console.log('Could not fetch product details from API, but ASIN was extracted:', apiError)
      // Continue anyway - at least we have the ASIN and URL filled in
      // Show a success message that ASIN was extracted
      alert(`ASIN extracted successfully: ${asin}\n\nAmazon ASIN and URL fields have been filled. Product details fetching requires API configuration.`)
    }

    // Clear the import URL after successful parsing
    amazonImportUrl.value = ''
    
    // Show success feedback
    console.log('Amazon URL parsed successfully. ASIN:', asin)
    alert(`✅ Successfully imported!\n\nASIN: ${asin}\nAmazon URL and ASIN fields have been filled.`)
  } catch (error) {
    console.error('Error parsing Amazon URL:', error)
    alert(`❌ Error parsing Amazon URL: ${error?.message || 'Unknown error'}\n\nPlease check the URL and try again.`)
  } finally {
    fetchingAmazon.value = false
  }
}

const fetchInventory = async () => {
  try {
    loading.value = true
    const query = `
      query {
        inventory {
          id
          name
          type
          size
          cost
          quantity
          unit
          rollLength
          rollWidth
          remainingArea
          totalArea
          rolls {
            rollNumber
            onHand
            maxArea
            image
            printName
            hasReverseSide
            pairedRollNumber
          }
          printNames
          supplier
          thumbnail
          amazonAsin
          amazonUrl
          notes
          createdAt
          updatedAt
        }
      }
    `
    const data = await executeQuery(query)
    inventory.value = data.inventory || []
  } catch (error) {
    console.error('Error fetching inventory:', error)
  } finally {
    loading.value = false
  }
}

// Helper function to escape GraphQL string values
const escapeGraphQLString = (str) => {
  if (!str) return null
  // Escape backslashes first, then quotes, then newlines
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

// Helper function to format rolls/ribbons for GraphQL mutation
const formatRollsForMutation = () => {
  if ((formData.value.type !== 'wrapping_paper' && formData.value.type !== 'ribbon') || !rollOnHandInputs.value || rollOnHandInputs.value.length === 0) {
    return 'null'
  }
  const rollsArray = rollOnHandInputs.value.map(roll => {
    const imagePart = roll.image ? `, image: "${escapeGraphQLString(roll.image)}"` : ''
    const printPart = roll.printName ? `, printName: "${escapeGraphQLString(roll.printName)}"` : ''
    const hasReversePart = roll.hasReverseSide !== undefined ? `, hasReverseSide: ${roll.hasReverseSide}` : ''
    const pairedPart = roll.pairedRollNumber ? `, pairedRollNumber: ${roll.pairedRollNumber}` : ''
    return `{rollNumber: ${roll.rollNumber}, onHand: ${roll.onHand || 0}, maxArea: ${roll.maxArea || 0}${imagePart}${printPart}${hasReversePart}${pairedPart}}`
  })
  return `[${rollsArray.join(', ')}]`
}

// Handle roll image upload
const handleRollImageUpload = (event, index) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB')
    return
  }
  
  // Read file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    if (rollOnHandInputs.value[index]) {
      rollOnHandInputs.value[index].image = e.target.result
    }
  }
  reader.onerror = () => {
    alert('Error reading image file')
  }
  reader.readAsDataURL(file)
}

// Remove roll image
const removeRollImage = (index) => {
  if (rollOnHandInputs.value[index]) {
    rollOnHandInputs.value[index].image = null
  }
}

// Add a new roll
const addRoll = () => {
  if (!formData.value.rolls) {
    formData.value.rolls = []
  }
  
  const sizePerItem = parseFloat(formData.value.size) || 0
  const maxArea = sizePerItem
  const newRollNumber = formData.value.rolls.length + 1
  
  // Create new roll with default values
  const newRoll = {
    rollNumber: newRollNumber,
    onHand: maxArea,
    maxArea: maxArea,
    image: null,
    print1Name: null,
    print2Name: null,
    hasReverseSide: false,
    pairedRollNumber: null
  }
  
  formData.value.rolls.push(newRoll)
  // Note: quantity is not auto-updated - user controls it manually
  
  console.log(`✅ Added new ${formData.value.type === 'wrapping_paper' ? 'Roll' : 'Ribbon'} ${newRollNumber}, total rolls: ${formData.value.rolls.length}`)
}

// Remove a roll by roll number
const removeRoll = (rollNumber) => {
  if (!formData.value.rolls || formData.value.rolls.length <= 1) {
    alert(`Cannot remove the last ${formData.value.type === 'wrapping_paper' ? 'roll' : 'ribbon'}. At least one is required.`)
    return
  }
  
  if (!formData.value.rolls || formData.value.rolls.length === 0) {
    return
  }
  
  // Find the roll to remove
  const rollIndex = formData.value.rolls.findIndex(r => r.rollNumber === rollNumber)
  if (rollIndex === -1) {
    console.warn(`Roll ${rollNumber} not found`)
    return
  }
  
  const rollToRemove = formData.value.rolls[rollIndex]
  
  // If the roll is paired, unpair it first
  if (rollToRemove.hasReverseSide && rollToRemove.pairedRollNumber) {
    const pairedRoll = formData.value.rolls.find(r => r.rollNumber === rollToRemove.pairedRollNumber)
    if (pairedRoll) {
      pairedRoll.hasReverseSide = false
      pairedRoll.pairedRollNumber = null
    }
  }
  
  // If another roll is paired with this one, unpair it
  const rollPairedWithThis = formData.value.rolls.find(r => r.pairedRollNumber === rollNumber)
  if (rollPairedWithThis) {
    rollPairedWithThis.hasReverseSide = false
    rollPairedWithThis.pairedRollNumber = null
  }
  
  // Remove the roll
  formData.value.rolls.splice(rollIndex, 1)
  
  // Renumber remaining rolls to maintain sequential numbering
  formData.value.rolls.forEach((roll, index) => {
    roll.rollNumber = index + 1
  })
  // Note: quantity is not auto-updated - user controls it manually
  
  console.log(`✅ Removed ${formData.value.type === 'wrapping_paper' ? 'Roll' : 'Ribbon'} ${rollNumber}, total rolls: ${formData.value.rolls.length}`)
}

// Remove paired rolls (removes both rolls in the pair)
const removePairedRolls = (group) => {
  if (!group.isPaired || !group.rolls || group.rolls.length === 0) {
    return
  }
  
  // Need at least 2 rolls remaining after removal
  if (!formData.value.rolls || formData.value.rolls.length <= 2) {
    alert(`Cannot remove paired rolls. Need at least 2 ${formData.value.type === 'wrapping_paper' ? 'rolls' : 'ribbons'} remaining.`)
    return
  }
  
  if (!formData.value.rolls || formData.value.rolls.length === 0) {
    return
  }
  
  // Get roll numbers to remove
  const rollNumbersToRemove = group.rolls.map(r => r.rollNumber)
  
  // Remove both rolls from the array
  formData.value.rolls = formData.value.rolls.filter(r => !rollNumbersToRemove.includes(r.rollNumber))
  
  // Renumber remaining rolls to maintain sequential numbering
  formData.value.rolls.forEach((roll, index) => {
    roll.rollNumber = index + 1
    // Clear any pairing references to removed rolls
    if (roll.pairedRollNumber && rollNumbersToRemove.includes(roll.pairedRollNumber)) {
      roll.hasReverseSide = false
      roll.pairedRollNumber = null
    }
  })
  // Note: quantity is not auto-updated - user controls it manually
  
  console.log(`✅ Removed paired ${formData.value.type === 'wrapping_paper' ? 'Rolls' : 'Ribbons'} ${rollNumbersToRemove.join(' & ')}, total rolls: ${formData.value.rolls.length}`)
}

// Get the hasReverseSide value from the actual roll object
const getRollHasReverseSide = (rollNumber) => {
  const actualRoll = rollOnHandInputs.value.find(r => r.rollNumber === rollNumber)
  return actualRoll?.hasReverseSide ?? false
}

// Handle reversible toggle - pair with next roll (even rolls pair with next odd roll)
const handleRollReversibleToggle = (roll) => {
  // Find the actual roll object in the rolls array (not the grouped object)
  const actualRoll = rollOnHandInputs.value.find(r => r.rollNumber === roll.rollNumber)
  if (!actualRoll) return
  
  // Toggle the hasReverseSide value
  actualRoll.hasReverseSide = !actualRoll.hasReverseSide
  
  if (actualRoll.hasReverseSide) {
    // Pairing: For any roll, pair with the next roll (roll 1 -> roll 2, roll 2 -> roll 3, etc.)
    const nextRollNumber = actualRoll.rollNumber + 1
    const nextRoll = rollOnHandInputs.value.find(r => r.rollNumber === nextRollNumber)
    
    if (nextRoll && !nextRoll.hasReverseSide && !nextRoll.pairedRollNumber) {
      actualRoll.pairedRollNumber = nextRoll.rollNumber
      nextRoll.pairedRollNumber = actualRoll.rollNumber
      nextRoll.hasReverseSide = true
      // Sync onHand values
      nextRoll.onHand = actualRoll.onHand
      
      // When pairing, add a new roll card and increase quantity
      // Paired rolls count as 1 effective roll, so we add 1 more physical roll
      const sizePerItem = parseFloat(formData.value.size) || 0
      const maxArea = sizePerItem
      const currentRollCount = formData.value.rolls.length
      const newRollNumber = currentRollCount + 1
      
      // Add new roll to the actual rolls array (not the computed property)
      formData.value.rolls.push({
        rollNumber: newRollNumber,
        onHand: maxArea,
        maxArea: maxArea,
        image: null,
        printName: null,
        hasReverseSide: false,
        pairedRollNumber: null
      })
      
      // Increase quantity by 1
      formData.value.quantity = formData.value.rolls.length
      
      console.log(`✅ Paired Roll ${actualRoll.rollNumber} with Roll ${nextRoll.rollNumber}`)
      console.log(`✅ Added new Roll ${newRollNumber}, quantity now: ${formData.value.quantity}`)
    } else if (nextRoll && (nextRoll.hasReverseSide || nextRoll.pairedRollNumber)) {
      alert(`Roll ${nextRoll.rollNumber} is already paired. Please uncheck reversible on the other roll first.`)
      actualRoll.hasReverseSide = false
    } else {
      alert(`No next roll available to pair with.`)
      actualRoll.hasReverseSide = false
    }
  } else {
    // Unpairing: Clear pairing from both rolls
    if (actualRoll.pairedRollNumber) {
      const pairedRoll = rollOnHandInputs.value.find(r => r.rollNumber === actualRoll.pairedRollNumber)
      if (pairedRoll) {
        pairedRoll.pairedRollNumber = null
        pairedRoll.hasReverseSide = false
        console.log(`✅ Unpaired Roll ${pairedRoll.rollNumber} from Roll ${actualRoll.rollNumber}`)
      }
      actualRoll.pairedRollNumber = null
      
      // When unpairing, remove the last roll card that was added during pairing
      // Find the highest roll number
      const maxRollNumber = Math.max(...formData.value.rolls.map(r => r.rollNumber))
      const lastRoll = formData.value.rolls.find(r => r.rollNumber === maxRollNumber)
      
      // Remove the last roll if it's not paired and was added during pairing
      if (lastRoll && !lastRoll.pairedRollNumber && maxRollNumber > actualRoll.rollNumber && maxRollNumber > pairedRoll.rollNumber) {
        const lastRollIndex = formData.value.rolls.findIndex(r => r.rollNumber === maxRollNumber)
        if (lastRollIndex !== -1) {
          formData.value.rolls.splice(lastRollIndex, 1)
          formData.value.quantity = formData.value.rolls.length
          console.log(`✅ Removed Roll ${maxRollNumber}, quantity now: ${formData.value.quantity}`)
        }
      }
      
      console.log(`✅ Unpaired Roll ${actualRoll.rollNumber}`)
    }
  }
}

// Update shared onHand for paired rolls
const updatePairedRollsName = (group, value) => {
  if (group.isPaired && group.rolls) {
    group.rolls.forEach(pairedRoll => {
      pairedRoll.printName = value
    })
  }
}

const updatePairedRollsOnHand = (group, value) => {
  if (group.isPaired && group.rolls) {
    const newValue = parseFloat(value) || 0
    group.rolls.forEach(pairedRoll => {
      pairedRoll.onHand = newValue
    })
  }
}

// Check if a roll should be displayed at half-width
// A roll should be half-width if:
// 1. It has reversible checked AND is not yet paired (it will pair with the next roll)
// 2. OR the previous roll has reversible checked AND is not yet paired (it will be paired with the previous roll)
const shouldShowHalfWidth = (roll) => {
  // Find the actual roll object in the rolls array to check its current state
  const actualRoll = rollOnHandInputs.value.find(r => r.rollNumber === roll.rollNumber)
  if (!actualRoll) return false
  
  // If this roll has reversible checked but is not yet paired, it should be half-width
  if (actualRoll.hasReverseSide && !actualRoll.pairedRollNumber) {
    return true
  }
  
  // Check if the previous roll has reversible checked and is not yet paired
  // (which means this roll will be paired with it)
  const previousRoll = rollOnHandInputs.value.find(r => r.rollNumber === actualRoll.rollNumber - 1)
  if (previousRoll && previousRoll.hasReverseSide && !previousRoll.pairedRollNumber) {
    return true
  }
  
  return false
}

const saveItem = async () => {
  try {
    saving.value = true

    // For tags, combine width and length into size format "w x l"
    if (formData.value.type === 'tag' && formData.value.tagWidth != null && formData.value.tagLength != null) {
      formData.value.size = `${formData.value.tagWidth} x ${formData.value.tagLength}`
    }

    if (editingItem.value) {
      // Update existing item
      console.log('📝 Updating inventory with roll dimensions:', {
        rollLength: formData.value.rollLength,
        rollWidth: formData.value.rollWidth,
        type: formData.value.type
      })
      const mutation = `
        mutation {
          updateInventory(input: {
            id: "${editingItem.value.id}"
            name: ${formData.value.name ? `"${escapeGraphQLString(formData.value.name)}"` : 'null'}
            type: ${formData.value.type}
            size: ${formData.value.size ? `"${escapeGraphQLString(formData.value.size)}"` : 'null'}
            cost: ${formData.value.cost}
            quantity: ${formData.value.quantity}
            unit: ${formData.value.unit ? `"${escapeGraphQLString(formData.value.unit)}"` : 'null'}
            rollLength: ${formData.value.rollLength != null ? formData.value.rollLength : 'null'}
            rollWidth: ${formData.value.rollWidth != null ? formData.value.rollWidth : 'null'}
            rolls: ${(formData.value.type === 'wrapping_paper' || formData.value.type === 'ribbon') ? formatRollsForMutation() : 'null'}
            printNames: ${formData.value.printNames && formData.value.printNames.length > 0 ? `[${formData.value.printNames.map(name => `"${escapeGraphQLString(name)}"`).join(', ')}]` : 'null'}
            supplier: ${formData.value.supplier ? `"${escapeGraphQLString(formData.value.supplier)}"` : 'null'}
            thumbnail: ${formData.value.thumbnail ? `"${escapeGraphQLString(formData.value.thumbnail)}"` : 'null'}
            amazonAsin: ${formData.value.amazonAsin ? `"${escapeGraphQLString(formData.value.amazonAsin)}"` : 'null'}
            amazonUrl: ${formData.value.amazonUrl ? `"${escapeGraphQLString(formData.value.amazonUrl)}"` : 'null'}
            notes: ${formData.value.notes ? `"${escapeGraphQLString(formData.value.notes)}"` : 'null'}
          }) {
            id
            name
            type
            size
            cost
            quantity
            unit
            remainingArea
            totalArea
          rolls {
            rollNumber
            onHand
            maxArea
            image
            printName
            hasReverseSide
            pairedRollNumber
          }
            supplier
            thumbnail
            amazonAsin
            amazonUrl
            notes
            createdAt
            updatedAt
          }
        }
      `
      await executeQuery(mutation)
    } else {
      // Create new item
      const mutation = `
        mutation {
          createInventory(input: {
            name: ${formData.value.name ? `"${escapeGraphQLString(formData.value.name)}"` : 'null'}
            type: ${formData.value.type}
            size: ${formData.value.size ? `"${escapeGraphQLString(formData.value.size)}"` : 'null'}
            cost: ${formData.value.cost}
            quantity: ${formData.value.quantity}
            unit: ${formData.value.unit ? `"${escapeGraphQLString(formData.value.unit)}"` : 'null'}
            rollLength: ${formData.value.rollLength != null ? formData.value.rollLength : 'null'}
            rollWidth: ${formData.value.rollWidth != null ? formData.value.rollWidth : 'null'}
            rolls: ${(formData.value.type === 'wrapping_paper' || formData.value.type === 'ribbon') ? formatRollsForMutation() : 'null'}
            printNames: ${formData.value.printNames && formData.value.printNames.length > 0 ? `[${formData.value.printNames.map(name => `"${escapeGraphQLString(name)}"`).join(', ')}]` : 'null'}
            supplier: ${formData.value.supplier ? `"${escapeGraphQLString(formData.value.supplier)}"` : 'null'}
            thumbnail: ${formData.value.thumbnail ? `"${escapeGraphQLString(formData.value.thumbnail)}"` : 'null'}
            amazonAsin: ${formData.value.amazonAsin ? `"${escapeGraphQLString(formData.value.amazonAsin)}"` : 'null'}
            amazonUrl: ${formData.value.amazonUrl ? `"${escapeGraphQLString(formData.value.amazonUrl)}"` : 'null'}
            notes: ${formData.value.notes ? `"${escapeGraphQLString(formData.value.notes)}"` : 'null'}
          }) {
            id
            name
            type
            size
            cost
            quantity
            unit
            remainingArea
            totalArea
          rolls {
            rollNumber
            onHand
            maxArea
            image
            printName
            hasReverseSide
            pairedRollNumber
          }
            supplier
            thumbnail
            amazonAsin
            amazonUrl
            notes
            createdAt
            updatedAt
          }
        }
      `
      await executeQuery(mutation)
    }

    await fetchInventory()
    closeModal()
  } catch (error) {
    console.error('Error saving inventory item:', error)
    alert('Failed to save inventory item. Please try again.')
  } finally {
    saving.value = false
  }
}

const editItem = (item) => {
  editingItem.value = item
  const sizePerRoll = parseFloat(item.size) || 0
  
  // Initialize rolls array from existing data or create new ones
  let rolls = []
  if (item.rolls && Array.isArray(item.rolls) && item.rolls.length > 0) {
    // Use existing roll data
    rolls = item.rolls.map((roll, index) => ({
      rollNumber: index + 1,
      onHand: roll.onHand ?? roll.remainingArea ?? sizePerRoll,
      maxArea: sizePerRoll,
      image: roll.image || null,
      printName: roll.printName || roll.print1Name || null, // Support legacy print1Name
      hasReverseSide: roll.hasReverseSide ?? false
    }))
    
    // Set form-level reverse-side settings from first roll if available
    if (rolls.length > 0 && rolls[0].hasReverseSide) {
      formData.value.hasReverseSide = true
      formData.value.printName = rolls[0].printName || ''
    }
    
    // Set printNames from item if available
    if (item.printNames && Array.isArray(item.printNames)) {
      formData.value.printNames = item.printNames
    }
  } else {
    // Create new rolls array based on quantity
    // Distribute remainingArea evenly across rolls if available
    const remainingArea = item.remainingArea ?? (sizePerRoll * item.quantity)
    const onHandPerRoll = item.quantity > 0 ? remainingArea / item.quantity : sizePerRoll
    
    for (let i = 0; i < item.quantity; i++) {
      const existingRoll = item.rolls && item.rolls[i]
      rolls.push({
        rollNumber: i + 1,
        onHand: onHandPerRoll,
        maxArea: sizePerRoll,
        image: existingRoll?.image || null,
        printName: existingRoll?.printName || existingRoll?.print1Name || null, // Support legacy print1Name
        hasReverseSide: existingRoll?.hasReverseSide ?? false,
        pairedRollNumber: existingRoll?.pairedRollNumber || null
      })
    }
  }
  
  // Parse tag dimensions from size if it's a tag
  let tagWidth = null
  let tagLength = null
  if (item.type === 'tag' && item.size) {
    const sizeMatch = item.size.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/i)
    if (sizeMatch && sizeMatch[1] && sizeMatch[2]) {
      tagWidth = parseFloat(sizeMatch[1])
      tagLength = parseFloat(sizeMatch[2])
    }
  }
  
  formData.value = {
    name: item.name,
    type: item.type,
    size: item.size || '',
    cost: item.cost,
    quantity: item.quantity,
    unit: item.unit || 'each',
    rollLength: item.rollLength ?? null,
    rollWidth: item.rollWidth ?? null,
    tagWidth: tagWidth,
    tagLength: tagLength,
    remainingArea: item.remainingArea ?? null,
    totalArea: item.totalArea ?? null,
    rolls: rolls,
    supplier: item.supplier || '',
    thumbnail: item.thumbnail || '',
    amazonAsin: item.amazonAsin || '',
    amazonUrl: item.amazonUrl || '',
    notes: item.notes || ''
  }
  showAddModal.value = true
}

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to delete this inventory item?')) {
    return
  }

  try {
    const mutation = `
      mutation {
        deleteInventory(id: "${id}")
      }
    `
    await executeQuery(mutation)
    await fetchInventory()
    closeModal()
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    alert('Failed to delete inventory item. Please try again.')
  }
}

const handleDeleteFromModal = async () => {
  if (!editingItem.value) return
  
  if (!confirm(`Are you sure you want to delete "${editingItem.value.name}"? This action cannot be undone.`)) {
    return
  }

  await deleteItem(editingItem.value.id)
}

const closeModal = () => {
  showAddModal.value = false
  editingItem.value = null
  amazonImportUrl.value = ''
  formData.value = {
    name: '',
    type: '',
    size: '',
    cost: 0,
    quantity: 0,
    unit: 'each',
    rollLength: null,
    rollWidth: null,
    tagWidth: null,
    tagLength: null,
    remainingArea: null,
    totalArea: null,
    rolls: [],
    hasReverseSide: false,
    printName: '',
    printNames: [],
    supplier: '',
    thumbnail: '',
    amazonAsin: '',
    amazonUrl: '',
    notes: ''
  }
}

const handleImageError = (event) => {
  // Replace broken image with placeholder
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3Cpath d="M21 15l-5-5L5 21"%3E%3C/svg%3E'
}

const clearFilters = () => {
  typeFilter.value = ''
  searchQuery.value = ''
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

const handleReceiving = async ({ item, updateData }) => {
  try {
    saving.value = true
    
    console.log('📦 Receiving data:', { item, updateData })
    
    // Build rolls array string if needed (using same format as formatRollsForMutation)
    // Note: We preserve existing images but don't re-encode them to avoid huge mutations
    let rollsStr = 'null'
    if (updateData.rolls && Array.isArray(updateData.rolls) && updateData.rolls.length > 0) {
      const rollsArray = updateData.rolls.map(roll => {
        // For receiving, we only update onHand and maxArea - preserve other fields but don't include image in mutation
        // The backend should preserve existing images when not provided
        const printPart = roll.printName !== undefined && roll.printName !== null 
          ? `, printName: "${escapeGraphQLString(roll.printName)}"` 
          : ', printName: null'
        const hasReversePart = `, hasReverseSide: ${roll.hasReverseSide !== undefined ? roll.hasReverseSide : false}`
        const pairedPart = roll.pairedRollNumber !== null && roll.pairedRollNumber !== undefined 
          ? `, pairedRollNumber: ${roll.pairedRollNumber}` 
          : ', pairedRollNumber: null'
        const rollNumber = roll.rollNumber || 0
        const onHand = typeof roll.onHand === 'number' ? roll.onHand : 0
        const maxArea = typeof roll.maxArea === 'number' ? roll.maxArea : 0
        // Skip image field to avoid huge base64 strings in mutation - backend will preserve existing
        return `{rollNumber: ${rollNumber}, onHand: ${onHand}, maxArea: ${maxArea}${printPart}${hasReversePart}${pairedPart}}`
      })
      rollsStr = `[${rollsArray.join(', ')}]`
    }
    
    // Build mutation fields - only include provided fields
    // Note: remainingArea is calculated from rolls, so we don't include it in the mutation
    const mutationFields = [`id: "${item.id}"`]
    
    if (updateData.quantity !== undefined && updateData.quantity !== null) {
      mutationFields.push(`quantity: ${Number(updateData.quantity)}`)
    }
    // remainingArea is not in UpdateInventoryInput - it's calculated from rolls
    // if (updateData.remainingArea !== undefined && updateData.remainingArea !== null) {
    //   mutationFields.push(`remainingArea: ${Number(updateData.remainingArea)}`)
    // }
    if (updateData.rolls && Array.isArray(updateData.rolls) && updateData.rolls.length > 0) {
      mutationFields.push(`rolls: ${rollsStr}`)
    }
    if (updateData.notes !== undefined && updateData.notes !== null) {
      mutationFields.push(`notes: ${updateData.notes ? `"${escapeGraphQLString(updateData.notes)}"` : 'null'}`)
    }
    
    const mutation = `
      mutation {
        updateInventory(input: {
          ${mutationFields.join('\n          ')}
        }) {
          id
          name
          quantity
          remainingArea
          rolls {
            rollNumber
            onHand
            maxArea
          }
        }
      }
    `
    
    console.log('🔍 GraphQL Mutation:', mutation)
    console.log('📊 Update Data:', updateData)
    
    const result = await executeQuery(mutation)
    console.log('✅ Mutation result:', result)
    await fetchInventory()
    showReceivingModal.value = false
    alert(`✅ Successfully received stock for ${item.name}`)
  } catch (error) {
    console.error('Error receiving inventory:', error)
    console.error('Error details:', error.response || error.message)
    // Try to extract GraphQL error message
    if (error.data && error.data.errors) {
      console.error('GraphQL errors:', error.data.errors)
      const errorMsg = error.data.errors.map((e) => e.message).join(', ')
      alert(`Failed to receive stock: ${errorMsg}`)
    } else {
      alert(`Failed to receive stock: ${error.message || 'Unknown error'}`)
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchInventory()
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target && target instanceof Element && !target.closest('.print-name-dropdown-container')) {
      showPrintNameDropdown.value = null
    }
  })
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

