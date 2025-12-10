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
              <tr
                v-for="item in filteredInventory"
                :key="item.id"
                @click="editItem(item)"
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors',
                  item.quantity === 0 ? 'bg-red-50 dark:bg-red-900/10' : item.quantity < 10 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap" @click.stop>
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
                      <div v-if="item.notes" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{{ item.notes }}</div>
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
                    <span v-if="item.size && (item.type === 'wrapping_paper' || item.type === 'ribbon')" class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      sqft
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

        <div v-if="filteredInventory.length === 0" class="p-12 text-center">
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
                    </select>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Size
                      <span v-if="formData.type === 'wrapping_paper' || formData.type === 'ribbon'" class="text-xs text-gray-500 dark:text-gray-400">
                        (Size per roll in sqft)
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
                        <span class="font-semibold">Size per roll:</span> {{ formData.size }} sqft
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span class="font-semibold">Total cost:</span> ${{ formData.cost.toFixed(2) }}
                      </p>
                      <p class="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        📊 Cost per roll: ${{ calculateCostPerRoll().toFixed(4) }}
                      </p>
                      <p class="text-xs text-green-600 dark:text-green-400 font-semibold">
                        💰 Cost per sqft: ${{ calculateCostPerSqft().toFixed(4) }}
                      </p>
                    </div>
                  </div>
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
                <div v-if="formData.type === 'wrapping_paper'" class="grid md:grid-cols-2 gap-4">
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

                <div v-if="formData.type === 'wrapping_paper' && formData.quantity > 0" class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    On-Hand per Roll (sqft)
                    <span class="text-xs text-gray-500 dark:text-gray-400">(remaining area for each roll)</span>
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="(roll, index) in rollOnHandInputs" :key="index" class="space-y-1">
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Roll {{ index + 1 }}
                      </label>
                      <input
                        v-model.number="roll.onHand"
                        type="number"
                        step="0.01"
                        min="0"
                        :max="roll.maxArea"
                        class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Max: {{ roll.maxArea.toFixed(2) }} sqft
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-600 dark:text-gray-400">Total On-Hand:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">
                        {{ totalRollOnHand.toFixed(2) }} sqft
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-sm mt-1">
                      <span class="text-gray-600 dark:text-gray-400">Total Area:</span>
                      <span class="font-semibold text-gray-900 dark:text-white">
                        {{ totalRollArea.toFixed(2) }} sqft
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const editingItem = ref(null)
const saving = ref(false)
const typeFilter = ref('')
const searchQuery = ref('')
const amazonImportUrl = ref('')
const fetchingAmazon = ref(false)

const formData = ref({
  name: '',
  type: '',
  size: '',
  cost: 0,
  quantity: 0,
  unit: 'each',
  rollLength: null,
  rollWidth: null,
  remainingArea: null,
  totalArea: null,
  rolls: [], // Array of { rollNumber, onHand, maxArea }
  supplier: '',
  thumbnail: '',
  amazonAsin: '',
  amazonUrl: '',
  notes: ''
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
    box: 'Box'
  }
  return labels[type] || type
}

const getTypeClass = (type) => {
  const classes = {
    wrapping_paper: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    bow: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    ribbon: 'px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
    box: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
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
  if (formData.value.type === 'wrapping_paper' || formData.value.type === 'ribbon') {
    return 'e.g., 30, 50, 100 (sqft)'
  }
  if (formData.value.type === 'box') {
    return 'e.g., 12x12x6, 10x8x4 (W x L x H)'
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

// Computed property for roll on-hand inputs
const rollOnHandInputs = computed(() => {
  if (formData.value.type !== 'wrapping_paper' || !formData.value.quantity || formData.value.quantity <= 0) {
    return []
  }
  
  const sizePerRoll = parseFloat(formData.value.size) || 0
  const maxArea = sizePerRoll
  
  // Initialize rolls array if needed
  if (!formData.value.rolls || formData.value.rolls.length !== formData.value.quantity) {
    const rolls = []
    for (let i = 0; i < formData.value.quantity; i++) {
      // If editing and roll data exists, use it; otherwise initialize
      const existingRoll = formData.value.rolls && formData.value.rolls[i]
      rolls.push({
        rollNumber: i + 1,
        onHand: existingRoll?.onHand ?? maxArea,
        maxArea: maxArea
      })
    }
    formData.value.rolls = rolls
  } else {
    // Update maxArea for existing rolls when size changes
    formData.value.rolls.forEach(roll => {
      roll.maxArea = maxArea
    })
  }
  
  return formData.value.rolls
})

const totalRollOnHand = computed(() => {
  if (!rollOnHandInputs.value || rollOnHandInputs.value.length === 0) {
    return formData.value.remainingArea || 0
  }
  return rollOnHandInputs.value.reduce((sum, roll) => sum + (roll.onHand || 0), 0)
})

const totalRollArea = computed(() => {
  if (formData.value.type !== 'wrapping_paper' || !formData.value.size || !formData.value.quantity) {
    return formData.value.totalArea || 0
  }
  const sizePerRoll = parseFloat(formData.value.size) || 0
  return sizePerRoll * formData.value.quantity
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
      
      if (searchText.includes('wrapping') || searchText.includes('wrap') || searchText.includes('paper')) {
        formData.value.type = 'wrapping_paper'
        console.log('Auto-detected type: wrapping_paper')
      } else if (searchText.includes('ribbon')) {
        formData.value.type = 'ribbon'
        console.log('Auto-detected type: ribbon')
      } else if (searchText.includes('box') && !searchText.includes('gift box')) {
        formData.value.type = 'box'
        console.log('Auto-detected type: box')
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
          price: product.price,
          size: product.size,
          quantity: product.quantity,
          thumbnail: product.thumbnail,
          brand: product.brand
        })
        
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
        if (product.rollLength != null && product.rollWidth != null) {
          formData.value.rollLength = product.rollLength
          formData.value.rollWidth = product.rollWidth
          console.log('✅ Set roll dimensions from Amazon:', product.rollLength, 'ft x', product.rollWidth, 'in')
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
        if (product.description && !formData.value.notes) {
          formData.value.notes = product.description.substring(0, 500) // Limit to 500 chars
        }
        
        // Handle size based on product type
        if (product.size && !formData.value.size) {
          // Extract just the number from "88 sqft" format
          const sizeMatch = product.size.match(/(\d+)/)
          if (sizeMatch) {
            formData.value.size = sizeMatch[1] // Store just the number, we'll add "sqft" in display
            console.log('✅ Extracted size:', sizeMatch[1], 'sqft')
          } else {
            formData.value.size = product.size
          }
        } else if (product.dimensions && !formData.value.size) {
          formData.value.size = product.dimensions
        }
        
        // Set quantity if found
        if (product.quantity && formData.value.quantity === 0) {
          formData.value.quantity = product.quantity
          console.log('✅ Extracted quantity:', product.quantity)
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
    const data = await executeQuery(query)
    inventory.value = data.inventory || []
  } catch (error) {
    console.error('Error fetching inventory:', error)
  } finally {
    loading.value = false
  }
}

// Helper function to format rolls for GraphQL mutation
const formatRollsForMutation = () => {
  if (formData.value.type !== 'wrapping_paper' || !rollOnHandInputs.value || rollOnHandInputs.value.length === 0) {
    return 'null'
  }
  const rollsArray = rollOnHandInputs.value.map(roll => 
    `{rollNumber: ${roll.rollNumber}, onHand: ${roll.onHand || 0}, maxArea: ${roll.maxArea || 0}}`
  )
  return `[${rollsArray.join(', ')}]`
}

const saveItem = async () => {
  try {
    saving.value = true

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
            name: "${formData.value.name}"
            type: ${formData.value.type}
            size: ${formData.value.size ? `"${formData.value.size}"` : 'null'}
            cost: ${formData.value.cost}
            quantity: ${formData.value.quantity}
            unit: ${formData.value.unit ? `"${formData.value.unit}"` : 'null'}
            rollLength: ${formData.value.rollLength != null ? formData.value.rollLength : 'null'}
            rollWidth: ${formData.value.rollWidth != null ? formData.value.rollWidth : 'null'}
            rolls: ${formData.value.type === 'wrapping_paper' ? formatRollsForMutation() : 'null'}
            supplier: ${formData.value.supplier ? `"${formData.value.supplier}"` : 'null'}
            thumbnail: ${formData.value.thumbnail ? `"${formData.value.thumbnail}"` : 'null'}
            amazonAsin: ${formData.value.amazonAsin ? `"${formData.value.amazonAsin}"` : 'null'}
            amazonUrl: ${formData.value.amazonUrl ? `"${formData.value.amazonUrl}"` : 'null'}
            notes: ${formData.value.notes ? `"${formData.value.notes.replace(/"/g, '\\"')}"` : 'null'}
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
            name: "${formData.value.name}"
            type: ${formData.value.type}
            size: ${formData.value.size ? `"${formData.value.size}"` : 'null'}
            cost: ${formData.value.cost}
            quantity: ${formData.value.quantity}
            unit: ${formData.value.unit ? `"${formData.value.unit}"` : 'null'}
            rollLength: ${formData.value.rollLength != null ? formData.value.rollLength : 'null'}
            rollWidth: ${formData.value.rollWidth != null ? formData.value.rollWidth : 'null'}
            rolls: ${formData.value.type === 'wrapping_paper' ? formatRollsForMutation() : 'null'}
            supplier: ${formData.value.supplier ? `"${formData.value.supplier}"` : 'null'}
            thumbnail: ${formData.value.thumbnail ? `"${formData.value.thumbnail}"` : 'null'}
            amazonAsin: ${formData.value.amazonAsin ? `"${formData.value.amazonAsin}"` : 'null'}
            amazonUrl: ${formData.value.amazonUrl ? `"${formData.value.amazonUrl}"` : 'null'}
            notes: ${formData.value.notes ? `"${formData.value.notes.replace(/"/g, '\\"')}"` : 'null'}
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
      maxArea: sizePerRoll
    }))
  } else {
    // Create new rolls array based on quantity
    // Distribute remainingArea evenly across rolls if available
    const remainingArea = item.remainingArea ?? (sizePerRoll * item.quantity)
    const onHandPerRoll = item.quantity > 0 ? remainingArea / item.quantity : sizePerRoll
    
    for (let i = 0; i < item.quantity; i++) {
      rolls.push({
        rollNumber: i + 1,
        onHand: onHandPerRoll,
        maxArea: sizePerRoll
      })
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
    remainingArea: null,
    totalArea: null,
    rolls: [],
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

onMounted(() => {
  fetchInventory()
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

