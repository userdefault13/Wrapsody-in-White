<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400">Overview of your business operations</p>
            <p v-if="walletAddress" class="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
              Connected: {{ walletAddress }}
            </p>
          </div>
          <div class="flex gap-2">
            <DarkModeToggle />
            <button
              @click="refreshData"
              :disabled="loading"
              class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                :class="['w-5 h-5 transition-transform', loading ? 'animate-spin' : '']"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Refresh
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
            <NuxtLink to="/admin/bookings" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Bookings
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/transactions" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Transactions
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/pricing" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Price Manager
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/services" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Service Manager
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/inventory" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Inventory
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/settings" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Business Settings
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/profile" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                My Profile
              </span>
            </NuxtLink>
            <NuxtLink to="/admin/terminal" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Terminal
              </span>
            </NuxtLink>
            <NuxtLink to="/" class="relative group btn-secondary flex items-center justify-center w-10 h-10 p-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Go to Site
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Bookings"
          :value="todaysBookings.length"
          icon="📅"
          color="blue"
        />
        <StatCard
          title="Daily Revenue"
          :value="formatCurrency(dailyRevenue)"
          icon="💰"
          color="green"
        />
        <StatCard
          title="Weekly Revenue"
          :value="formatCurrency(weeklyRevenue)"
          icon="📊"
          color="purple"
        />
        <StatCard
          title="MTD Revenue"
          :value="formatCurrency(mtdRevenue)"
          icon="💵"
          color="orange"
        />
      </div>

      <!-- Additional Stats Cards - 7 cards in one row on large screens, 2 rows on medium screens -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          :value="totalBookings"
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Pending"
          :value="pendingBookingsCount"
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="In Progress"
          :value="inProgressBookingsCount"
          icon="🔄"
          color="blue"
        />
        <StatCard
          title="Ready"
          :value="readyBookingsCount"
          icon="📦"
          color="purple"
        />
        <StatCard
          title="Picked Up"
          :value="pickedUpBookingsCount"
          icon="🚚"
          color="green"
        />
        <StatCard
          title="Delivered"
          :value="deliveredBookingsCount"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Cancelled"
          :value="cancelledBookingsCount"
          icon="❌"
          color="red"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Today's Schedule -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(new Date()) }}</span>
          </div>
          <div v-if="loading" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
          <div v-else-if="todaysBookings.length === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">No bookings scheduled for today</p>
          </div>
          <div v-else class="space-y-4 max-h-96 overflow-y-auto">
            <div
              v-for="booking in todaysBookings"
              :key="booking.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ booking.name }}</h3>
                    <span :class="getStatusClass(booking.status)">
                      {{ getStatusLabel(booking.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span class="font-medium">{{ formatTime(booking.time) }}</span>
                    <span class="mx-2">•</span>
                    {{ booking.service }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ booking.numberOfGifts }} gift{{ booking.numberOfGifts !== 1 ? 's' : '' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {{ booking.address }}
                  </p>
                </div>
                <div class="flex flex-col gap-2">
                  <button
                    @click="viewBooking(booking)"
                    class="text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Actions -->
        <div v-if="!loading" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pending Actions</h2>
            <span v-if="pendingActionsCount > 0" class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-semibold">
              {{ pendingActionsCount }}
            </span>
          </div>
          <div v-if="pendingActionsCount === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">No pending actions</p>
          </div>
          <div v-else class="space-y-4 max-h-96 overflow-y-auto">
            <!-- Pending Bookings to Confirm -->
            <div
              v-for="booking in pendingBookings"
              :key="`pending-${booking.id}`"
              class="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300">
                      Pending Confirmation
                    </span>
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ booking.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span class="font-medium">{{ formatDate(booking.date) }} at {{ formatTime(booking.time) }}</span>
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {{ booking.service }} • {{ booking.numberOfGifts }} gift{{ booking.numberOfGifts !== 1 ? 's' : '' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {{ booking.email }} • {{ booking.phone }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button
                  @click="confirmBooking(booking)"
                  :disabled="processingAction === booking.id"
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {{ processingAction === booking.id ? 'Processing...' : 'Confirm Booking' }}
                </button>
                <button
                  @click="viewBooking(booking)"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                >
                  View Details
                </button>
              </div>
            </div>

            <!-- Pending Refund Approvals -->
            <div
              v-for="refund in pendingRefunds"
              :key="`refund-${refund.id}`"
              class="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-300">
                      Refund Required
                    </span>
                  </div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ refund.booking.name }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Booking Date: <span class="font-medium">{{ formatDate(refund.booking.date) }} at {{ formatTime(refund.booking.time) }}</span>
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Cancelled: <span class="font-medium">{{ formatDate(refund.booking.updatedAt) }}</span>
                  </p>
                  <p class="text-lg font-bold text-red-600 dark:text-red-400 mt-2">
                    Refund Amount: ${{ (refund.transaction.amount / 100).toFixed(2) }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button
                  @click="approveRefund(refund)"
                  :disabled="processingAction === refund.id"
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {{ processingAction === refund.id ? 'Processing...' : 'Approve Refund' }}
                </button>
                <button
                  @click="rejectRefund(refund)"
                  :disabled="processingAction === refund.id"
                  class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Summary Table -->
      <div v-if="!loading" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transaction Summary</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Period
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Transactions
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Card Payments
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  USDC Payments
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  Today
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ dailyStats.total }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                  {{ formatCurrency(dailyStats.revenue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ dailyStats.card }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ dailyStats.usdc }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  This Week
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ weeklyStats.total }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                  {{ formatCurrency(weeklyStats.revenue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ weeklyStats.card }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ weeklyStats.usdc }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  Month to Date
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ mtdStats.total }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                  {{ formatCurrency(mtdStats.revenue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ mtdStats.card }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ mtdStats.usdc }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Availability Modal -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useGraphQL } from '~/composables/useGraphQL'
import StatCard from '~/components/StatCard.vue'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { disconnect, walletAddress } = useAuth()
const router = useRouter()
const { executeQuery } = useGraphQL()

const loading = ref(true)
const bookings = ref([])
const transactions = ref([])
const readyItems = ref([])
const processingAction = ref(null)

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Get start of week (Sunday)
const getWeekStart = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day
  const weekStart = new Date(today.setDate(diff))
  return weekStart.toISOString().split('T')[0]
}

// Get start of month
const getMonthStart = () => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
}

// Today's bookings
const todaysBookings = computed(() => {
  const today = getTodayDate()
  return bookings.value
    .filter(b => b.date === today && (b.status === 'pending' || b.status === 'in_progress' || b.status === 'ready'))
    .sort((a, b) => {
      // Sort by time
      return a.time.localeCompare(b.time)
    })
})

// Revenue calculations - amounts are now returned in dollars from GraphQL
const dailyRevenue = computed(() => {
  const today = getTodayDate()
  return transactions.value
    .filter(t => {
      const txDate = new Date(t.createdAt).toISOString().split('T')[0]
      return txDate === today && t.status === 'completed'
    })
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0
      return sum + amount
    }, 0)
})

const weeklyRevenue = computed(() => {
  const weekStart = getWeekStart()
  return transactions.value
    .filter(t => {
      const txDate = new Date(t.createdAt).toISOString().split('T')[0]
      return txDate >= weekStart && t.status === 'completed'
    })
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0
      return sum + amount
    }, 0)
})

const mtdRevenue = computed(() => {
  const monthStart = getMonthStart()
  return transactions.value
    .filter(t => {
      const txDate = new Date(t.createdAt).toISOString().split('T')[0]
      return txDate >= monthStart && t.status === 'completed'
    })
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0
      return sum + amount
    }, 0)
})

// Transaction stats - amounts are now returned in dollars from GraphQL
const dailyStats = computed(() => {
  const today = getTodayDate()
  const daily = transactions.value.filter(t => {
    const txDate = new Date(t.createdAt).toISOString().split('T')[0]
    return txDate === today && t.status === 'completed'
  })
  return {
    total: daily.length,
    revenue: daily.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0
      return sum + amount
    }, 0),
    card: daily.filter(t => t.paymentMethod === 'card').length,
    usdc: daily.filter(t => t.paymentMethod === 'usdc' || t.paymentMethod === 'crypto').length
  }
})

const weeklyStats = computed(() => {
  const weekStart = getWeekStart()
  const weekly = transactions.value.filter(t => {
    const txDate = new Date(t.createdAt).toISOString().split('T')[0]
    return txDate >= weekStart && t.status === 'completed'
  })
  return {
    total: weekly.length,
    revenue: weekly.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0
      return sum + amount
    }, 0),
    card: weekly.filter(t => t.paymentMethod === 'card').length,
    usdc: weekly.filter(t => t.paymentMethod === 'usdc' || t.paymentMethod === 'crypto').length
  }
})

const mtdStats = computed(() => {
  const monthStart = getMonthStart()
  const mtd = transactions.value.filter(t => {
    const txDate = new Date(t.createdAt).toISOString().split('T')[0]
    return txDate >= monthStart && t.status === 'completed'
  })
  return {
    total: mtd.length,
    revenue: mtd.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0
      return sum + amount
    }, 0),
    card: mtd.filter(t => t.paymentMethod === 'card').length,
    usdc: mtd.filter(t => t.paymentMethod === 'usdc' || t.paymentMethod === 'crypto').length
  }
})

// Pending bookings that need confirmation
const pendingBookings = computed(() => {
  return bookings.value
    .filter(b => b.status === 'pending')
    .sort((a, b) => {
      // Sort by date and time
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
})

// Pending refunds (cancelled bookings with USDC payments before appointment date)
const pendingRefunds = computed(() => {
  const today = new Date()
  const refunds = []
  
  // Find cancelled bookings
  const cancelledBookings = bookings.value.filter(b => b.status === 'cancelled')
  
  cancelledBookings.forEach(booking => {
    // Find transaction for this booking
    const transaction = transactions.value.find(t => 
      t.bookingId === booking.id && 
      (t.paymentMethod === 'usdc' || t.paymentMethod === 'crypto') &&
      t.status === 'completed'
    )
    
    if (transaction) {
      // Check if booking was cancelled before appointment date
      const appointmentDate = new Date(`${booking.date}T${booking.time}`)
      const cancelledDate = new Date(booking.updatedAt)
      
      if (cancelledDate < appointmentDate) {
        // Check if refund hasn't been processed
        const refundTransaction = transactions.value.find(t => 
          t.bookingId === booking.id && 
          t.status === 'refunded'
        )
        
        if (!refundTransaction) {
          refunds.push({
            id: booking.id,
            booking,
            transaction
          })
        }
      }
    }
  })
  
  return refunds
})

// Booking stats from database
const totalBookings = computed(() => bookings.value.length)
const pendingBookingsCount = computed(() => bookings.value.filter(b => b.status === 'pending').length)
const inProgressBookingsCount = computed(() => bookings.value.filter(b => b.status === 'in_progress').length)
const readyBookingsCount = computed(() => bookings.value.filter(b => b.status === 'ready').length)
const readyItemsCount = computed(() => readyItems.value.length)
const pickedUpBookingsCount = computed(() => bookings.value.filter(b => b.status === 'picked_up').length)
const deliveredBookingsCount = computed(() => bookings.value.filter(b => b.status === 'delivered').length)
const cancelledBookingsCount = computed(() => bookings.value.filter(b => b.status === 'cancelled').length)

// Total pending actions count
const pendingActionsCount = computed(() => {
  return pendingBookings.value.length + pendingRefunds.value.length
})

const refreshData = async () => {
  await fetchData()
}

const fetchData = async () => {
  try {
    loading.value = true
    
    // Fetch bookings
    const bookingsQuery = `
      query {
        bookings {
          id
          name
          email
          phone
          service
          date
          time
          address
          numberOfGifts
          status
          createdAt
          updatedAt
        }
      }
    `
    console.log('Fetching bookings...')
    const bookingsData = await executeQuery(bookingsQuery)
    console.log('Bookings data received:', bookingsData)
    console.log('Bookings data type:', typeof bookingsData)
    console.log('Bookings data keys:', bookingsData ? Object.keys(bookingsData) : 'null')
    
    // Handle different response structures
    if (bookingsData && bookingsData.bookings) {
      bookings.value = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []
    } else if (Array.isArray(bookingsData)) {
      bookings.value = bookingsData
    } else {
      bookings.value = []
    }
    console.log('Bookings count:', bookings.value.length)
    
    // Fetch transactions
    const transactionsQuery = `
      query {
        transactions {
          id
          bookingId
          amount
          currency
          status
          paymentMethod
          createdAt
          updatedAt
        }
      }
    `
    console.log('Fetching transactions...')
    const transactionsData = await executeQuery(transactionsQuery)
    console.log('Transactions data received:', transactionsData)
    console.log('Transactions data type:', typeof transactionsData)
    console.log('Transactions data keys:', transactionsData ? Object.keys(transactionsData) : 'null')
    
    // Handle different response structures
    if (transactionsData && transactionsData.transactions) {
      transactions.value = Array.isArray(transactionsData.transactions) ? transactionsData.transactions : []
    } else if (Array.isArray(transactionsData)) {
      transactions.value = transactionsData
    } else {
      transactions.value = []
    }
    console.log('Transactions count:', transactions.value.length)
    
    // Fetch ready items by getting all bookings and their work orders/items in parallel
    console.log('Fetching ready items...')
    const workOrdersQuery = `
      query GetWorkOrders($bookingId: ID!) {
        workOrders(bookingId: $bookingId) {
          id
          bookingId
          items {
            id
            status
          }
        }
      }
    `
    
    // Fetch work orders for all bookings in parallel
    const itemsPromises = bookings.value.map(booking => 
      executeQuery(workOrdersQuery, { bookingId: booking.id })
        .then(workOrdersData => {
          if (workOrdersData && workOrdersData.workOrders) {
            // Flatten all items from all work orders
            const allItems = workOrdersData.workOrders.flatMap(wo => wo.items || [])
            return allItems.filter(item => item.status === 'ready')
          }
          return []
        })
        .catch(error => {
          console.error(`Error fetching work orders for booking ${booking.id}:`, error)
          return []
        })
    )
    
    const allItemsArrays = await Promise.all(itemsPromises)
    readyItems.value = allItemsArrays.flat()
    console.log('Ready items count:', readyItems.value.length)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      data: error?.data
    })
    // Show error to user
    alert(`Error loading dashboard data: ${error?.message || 'Unknown error'}`)
  } finally {
    loading.value = false
  }
}

const approveRefund = async (refund) => {
  if (!confirm(`Approve refund of $${refund.transaction.amount.toFixed(2)} for booking ${refund.booking.id}?`)) {
    return
  }
  
  processingAction.value = refund.id
  try {
    // Create refund transaction
    const mutation = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
          id
        }
      }
    `
    await executeQuery(mutation, {
      input: {
        bookingId: refund.booking.id,
        amount: refund.transaction.amount, // Already in dollars from GraphQL
        currency: "USD",
        status: "refunded",
        paymentMethod: refund.transaction.paymentMethod
      }
    })
    
    // Refresh data
    await fetchData()
    alert('Refund approved successfully')
  } catch (error) {
    console.error('Error approving refund:', error)
    alert('Failed to approve refund. Please try again.')
  } finally {
    processingAction.value = null
  }
}

const rejectRefund = async (refund) => {
  if (!confirm(`Reject refund request for booking ${refund.booking.id}?`)) {
    return
  }
  
  // For now, just remove from pending list by updating booking status
  // In a real system, you might want to track rejected refunds
  alert('Refund request rejected')
}

const confirmBooking = async (booking) => {
  if (!confirm(`Confirm booking for ${booking.name} on ${formatDate(booking.date)} at ${formatTime(booking.time)}?`)) {
    return
  }
  
  processingAction.value = booking.id
  try {
    const mutation = `
      mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
        updateBookingStatus(input: $input) {
          id
          status
        }
      }
    `
    await executeQuery(mutation, {
      input: {
        id: booking.id,
        status: 'confirmed'
      }
    })
    
    // Refresh data
    await fetchData()
    alert('Booking confirmed successfully')
  } catch (error) {
    console.error('Error confirming booking:', error)
    alert('Failed to confirm booking. Please try again.')
  } finally {
    processingAction.value = null
  }
}

const viewBooking = (booking) => {
  router.push(`/admin/bookings`)
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    confirmed: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    in_progress: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    ready: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    picked_up: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    delivered: 'px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }
  return classes[status] || classes.pending
}


onMounted(() => {
  fetchData()
})
</script>

