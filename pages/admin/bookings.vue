<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">Booking Management</h1>
              <p class="text-gray-600">View and manage all bookings</p>
              <p v-if="walletAddress" class="text-xs text-gray-500 mt-1 font-mono">
                Connected: {{ walletAddress }}
              </p>
            </div>
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
                @click="openAvailabilityModal"
                class="btn-secondary"
              >
                Manage Availability
              </button>
              <NuxtLink to="/" class="btn-secondary">
                Back to Home
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          :value="bookings.length"
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Pending"
          :value="pendingCount"
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Confirmed"
          :value="confirmedCount"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Completed"
          :value="completedCount"
          icon="🎉"
          color="purple"
        />
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
            <select
              v-model="statusFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Search by Name</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Customer name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <input
              v-model="dateFilter"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

      <!-- Bookings Table -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="booking in filteredBookings"
                :key="booking.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="openBookingDetail(booking)"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {{ booking.id.slice(-8) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ booking.name }}</div>
                  <div class="text-sm text-gray-500">{{ booking.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getServiceName(booking.service) }}<br>
                  <span class="text-gray-500">{{ booking.numberOfGifts }} gift(s)</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(booking.date) }}<br>
                  <span class="text-gray-500">{{ formatTime(booking.time) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(booking.status)">
                    {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" @click.stop>
                  <select
                    :value="booking.status"
                    @change="updateStatus(booking.id, $event.target.value)"
                    @click.stop
                    class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredBookings.length === 0" class="p-12 text-center">
          <p class="text-gray-500 text-lg">No bookings found.</p>
          <p class="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
        </div>
      </div>
    </div>

    <!-- Booking Detail Modal -->
    <BookingDetailModal
      v-if="selectedBooking"
      :booking="selectedBooking"
      @close="selectedBooking = null"
      @status-updated="handleStatusUpdate"
    />

    <!-- Availability Modal -->
    <AvailabilityModal
      :is-open="isAvailabilityModalOpen"
      @close="closeAvailabilityModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookings } from '~/composables/useBookings'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { bookings, updateBookingStatus } = useBookings()
const { disconnect, walletAddress } = useAuth()
const router = useRouter()

const statusFilter = ref('')
const searchQuery = ref('')
const dateFilter = ref('')
const selectedBooking = ref(null)
const isAvailabilityModalOpen = ref(false)

const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateB.getTime() - dateA.getTime() // Newest first
  })
})

const filteredBookings = computed(() => {
  let filtered = sortedBookings.value

  if (statusFilter.value) {
    filtered = filtered.filter(b => b.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.phone.includes(query)
    )
  }

  if (dateFilter.value) {
    filtered = filtered.filter(b => b.date === dateFilter.value)
  }

  return filtered
})

const pendingCount = computed(() => bookings.value.filter(b => b.status === 'pending').length)
const confirmedCount = computed(() => bookings.value.filter(b => b.status === 'confirmed').length)
const completedCount = computed(() => bookings.value.filter(b => b.status === 'completed').length)

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    confirmed: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
    completed: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    cancelled: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
  }
  return classes[status] || classes.pending
}

const getServiceName = (serviceId) => {
  const services = {
    basic: 'Basic ($8)',
    premium: 'Premium ($12)',
    unlimited: 'Unlimited ($50/hr)'
  }
  return services[serviceId] || serviceId
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const updateStatus = async (id, status) => {
  await updateBookingStatus(id, status)
}

const clearFilters = () => {
  statusFilter.value = ''
  searchQuery.value = ''
  dateFilter.value = ''
}

const openBookingDetail = (booking) => {
  selectedBooking.value = booking
}

const handleStatusUpdate = (bookingId, newStatus) => {
  updateStatus(bookingId, newStatus)
  selectedBooking.value = null
}

const openAvailabilityModal = () => {
  isAvailabilityModalOpen.value = true
}

const closeAvailabilityModal = () => {
  isAvailabilityModalOpen.value = false
}

const handleLogout = () => {
  disconnect()
  router.push('/admin/login')
}
</script>

