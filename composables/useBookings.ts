import { ref, computed } from 'vue'

export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  address: string
  numberOfGifts: number
  message: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

const bookings = ref<Booking[]>([])

export const useBookings = () => {
  // Load bookings from API
  const loadBookings = async () => {
    if (process.client) {
      try {
        const response = await $fetch('/api/bookings')
        if (response.success) {
          bookings.value = response.data
        }
      } catch (error) {
        console.error('Error loading bookings:', error)
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('wrapsody-bookings')
        if (stored) {
          try {
            bookings.value = JSON.parse(stored)
          } catch (e) {
            console.error('Error loading bookings from localStorage:', e)
          }
        }
      }
    }
  }

  // Load on mount
  if (process.client) {
    loadBookings()
  }

  const saveBookings = async () => {
    // Keep localStorage as backup
    if (process.client) {
      localStorage.setItem('wrapsody-bookings', JSON.stringify(bookings.value))
    }
  }

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    try {
      const response = await $fetch('/api/bookings', {
        method: 'POST',
        body: bookingData
      })
      
      if (response.success) {
        const newBooking = response.data
        bookings.value.push(newBooking)
        await saveBookings()
        return newBooking
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      // Fallback to localStorage
      const newBooking: Booking = {
        ...bookingData,
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      bookings.value.push(newBooking)
      saveBookings()
      return newBooking
    }
  }

  const getBooking = (id: string) => {
    return bookings.value.find(b => b.id === id)
  }

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      const response = await $fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        body: { status }
      })
      
      if (response.success) {
        const index = bookings.value.findIndex(b => b.id === id)
        if (index !== -1) {
          bookings.value[index] = response.data
        }
        await saveBookings()
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      // Fallback to localStorage
      const booking = bookings.value.find(b => b.id === id)
      if (booking) {
        booking.status = status
        saveBookings()
      }
    }
  }

  const getAvailableTimeSlots = (date: string) => {
    // Check day-of-week schedule first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wrapsody-availability')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (!Array.isArray(data)) {
            const dayOfWeekSchedules = data.dayOfWeekSchedules || []
            const dateObj = new Date(date)
            const dayOfWeek = dateObj.getDay()
            const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
            
            if (daySchedule && !daySchedule.isBlocked && daySchedule.slots.length > 0) {
              // Get bookings for this date to filter out booked slots
              const dayBookings = bookings.value.filter(
                b => b.date === date && b.status !== 'cancelled'
              )
              const bookedTimes = dayBookings.map(b => b.time)
              
              // Return scheduled slots that aren't booked
              return daySchedule.slots.filter((slot: string) => !bookedTimes.includes(slot))
            }
          }
        } catch (e) {
          console.error('Error loading day-of-week schedule:', e)
        }
      }
    }

    // Check specific date availability
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wrapsody-availability')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          const availability = Array.isArray(data) ? data : (data.availability || [])
          const dayAvailability = availability.find((a: any) => a.date === date)
          
          if (dayAvailability && dayAvailability.isAvailable && dayAvailability.slots.length > 0) {
            // Get bookings for this date to filter out booked slots
            const dayBookings = bookings.value.filter(
              b => b.date === date && b.status !== 'cancelled'
            )
            const bookedTimes = dayBookings.map(b => b.time)
            
            // Return scheduled slots that aren't booked
            return dayAvailability.slots.filter((slot: string) => !bookedTimes.includes(slot))
          }
        } catch (e) {
          console.error('Error loading availability:', e)
        }
      }
    }

    // Otherwise, fall back to default (6 AM to 11 PM, every hour)
    // Get bookings for the selected date
    const dayBookings = bookings.value.filter(
      b => b.date === date && b.status !== 'cancelled'
    )
    const bookedTimes = dayBookings.map(b => b.time)

    // Generate time slots (6 AM to 11 PM, every hour)
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      if (!bookedTimes.includes(time)) {
        slots.push(time)
      }
    }
    return slots
  }

  const isDateAvailable = (date: string) => {
    // Don't allow past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) return false

    // Check day-of-week schedule
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wrapsody-availability')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (!Array.isArray(data)) {
            const dayOfWeekSchedules = data.dayOfWeekSchedules || []
            const dateObj = new Date(date)
            const dayOfWeek = dateObj.getDay()
            const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
            
            if (daySchedule) {
              if (daySchedule.isBlocked) {
                return false
              }
              // If not blocked, check if there are available slots
              if (daySchedule.slots.length > 0) {
                const dayBookings = bookings.value.filter(
                  b => b.date === date && b.status !== 'cancelled'
                )
                const bookedTimes = dayBookings.map(b => b.time)
                const availableSlots = daySchedule.slots.filter((slot: string) => !bookedTimes.includes(slot))
                return availableSlots.length > 0
              }
              return false
            }
          }
        } catch (e) {
          console.error('Error checking day-of-week schedule:', e)
        }
      }
    }

    // Check availability schedule first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wrapsody-availability')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          const availability = Array.isArray(data) ? data : (data.availability || [])
          const dayAvailability = availability.find((a: any) => a.date === date)
          
          if (dayAvailability) {
            // If there's a schedule for this date, check if it's available and has slots
            if (dayAvailability.isAvailable && dayAvailability.slots.length > 0) {
              const slots = getAvailableTimeSlots(date)
              return slots.length > 0
            }
            return false // Date is scheduled but not available
          }
        } catch (e) {
          console.error('Error loading availability:', e)
        }
      }
    }

    // Otherwise, check if date has available slots (default behavior)
    const slots = getAvailableTimeSlots(date)
    return slots.length > 0
  }

  const getAllBookings = computed(() => bookings.value)

  return {
    bookings: getAllBookings,
    createBooking,
    getBooking,
    updateBookingStatus,
    getAvailableTimeSlots,
    isDateAvailable
  }
}

