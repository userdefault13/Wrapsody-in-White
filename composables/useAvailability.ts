import { ref, computed } from 'vue'

export interface AvailabilitySlot {
  date: string
  time: string
  available: boolean
}

export interface DayAvailability {
  date: string
  slots: string[] // Array of time slots like ["09:00", "10:00", "11:00"]
  isAvailable: boolean
}

const availability = ref<DayAvailability[]>([])

export interface DayOfWeekSchedule {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  slots: string[] // Array of time slots like ["06:00", "07:00", "08:00"]
  isBlocked: boolean
}

const dayOfWeekSchedules = ref<DayOfWeekSchedule[]>([])

export const useAvailability = () => {
  // Load availability from API
  const loadAvailability = async () => {
    if (typeof window !== 'undefined') {
      try {
        const response = await $fetch('/api/availability')
        if (response.success) {
          const data = response.data
          availability.value = data.availability || []
          dayOfWeekSchedules.value = data.dayOfWeekSchedules || []
        }
      } catch (error) {
        console.error('Error loading availability:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem('wrapsody-availability')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            if (Array.isArray(data)) {
              availability.value = data
            } else {
              availability.value = data.availability || []
              dayOfWeekSchedules.value = data.dayOfWeekSchedules || []
            }
          } catch (e) {
            console.error('Error loading availability from localStorage:', e)
          }
        }
      }
    }
  }

  // Load on mount
  if (typeof window !== 'undefined') {
    loadAvailability()
  }

  const saveAvailability = async () => {
    if (typeof window !== 'undefined') {
      // Save to MongoDB
      try {
        await $fetch('/api/availability', {
          method: 'POST',
          body: {
            availability: availability.value,
            dayOfWeekSchedules: dayOfWeekSchedules.value
          }
        })
      } catch (error) {
        console.error('Error saving availability to API:', error)
      }
      
      // Keep localStorage as backup
      localStorage.setItem('wrapsody-availability', JSON.stringify({
        availability: availability.value,
        dayOfWeekSchedules: dayOfWeekSchedules.value
      }))
    }
  }

  const setDayAvailability = (date: string, slots: string[], isAvailable: boolean = true) => {
    const existingIndex = availability.value.findIndex(a => a.date === date)
    const dayAvailability: DayAvailability = {
      date,
      slots,
      isAvailable
    }

    if (existingIndex >= 0) {
      availability.value[existingIndex] = dayAvailability
    } else {
      availability.value.push(dayAvailability)
    }

    saveAvailability()
  }

  const removeDayAvailability = (date: string) => {
    availability.value = availability.value.filter(a => a.date !== date)
    saveAvailability()
  }

  const getDayAvailability = (date: string): DayAvailability | null => {
    return availability.value.find(a => a.date === date) || null
  }

  const isDateAvailable = (date: string): boolean => {
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    
    // Check day-of-week schedule first
    const daySchedule = dayOfWeekSchedules.value.find(s => s.dayOfWeek === dayOfWeek)
    if (daySchedule) {
      if (daySchedule.isBlocked) {
        return false
      }
      // If not blocked, check if there are available slots
      if (daySchedule.slots.length > 0) {
        // Get bookings for this date to filter out booked slots
        let bookedTimes: string[] = []
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('wrapsody-bookings')
          if (stored) {
            try {
              const bookings = JSON.parse(stored)
              const dayBookings = bookings.filter(
                (b: any) => b.date === date && b.status !== 'cancelled'
              )
              bookedTimes = dayBookings.map((b: any) => b.time)
            } catch (e) {
              console.error('Error loading bookings for availability:', e)
            }
          }
        }
        const availableSlots = daySchedule.slots.filter(slot => !bookedTimes.includes(slot))
        return availableSlots.length > 0
      }
      return false
    }

    // Check specific date availability
    const dayAvailability = getDayAvailability(date)
    if (dayAvailability) {
      return dayAvailability.isAvailable && dayAvailability.slots.length > 0
    }
    
    return false
  }

  const getAvailableSlots = (date: string): string[] => {
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    
    // Check day-of-week schedule first
    const daySchedule = dayOfWeekSchedules.value.find(s => s.dayOfWeek === dayOfWeek)
    if (daySchedule && !daySchedule.isBlocked && daySchedule.slots.length > 0) {
      // Get bookings for this date to filter out booked slots
      let bookedTimes: string[] = []
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('wrapsody-bookings')
        if (stored) {
          try {
            const bookings = JSON.parse(stored)
            const dayBookings = bookings.filter(
              (b: any) => b.date === date && b.status !== 'cancelled'
            )
            bookedTimes = dayBookings.map((b: any) => b.time)
          } catch (e) {
            console.error('Error loading bookings for availability:', e)
          }
        }
      }
      return daySchedule.slots.filter(slot => !bookedTimes.includes(slot))
    }

    // Check specific date availability
    const dayAvailability = getDayAvailability(date)
    if (!dayAvailability || !dayAvailability.isAvailable) return []

    // Get bookings for this date to filter out booked slots
    let bookedTimes: string[] = []
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wrapsody-bookings')
      if (stored) {
        try {
          const bookings = JSON.parse(stored)
          const dayBookings = bookings.filter(
            (b: any) => b.date === date && b.status !== 'cancelled'
          )
          bookedTimes = dayBookings.map((b: any) => b.time)
        } catch (e) {
          console.error('Error loading bookings for availability:', e)
        }
      }
    }

    // Return available slots that aren't booked
    return dayAvailability.slots.filter(slot => !bookedTimes.includes(slot))
  }

  const getAllAvailability = computed(() => availability.value)

  const clearAllAvailability = () => {
    availability.value = []
    saveAvailability()
  }

  const setDayOfWeekSchedule = (dayOfWeek: number, slots: string[], isBlocked: boolean) => {
    const existingIndex = dayOfWeekSchedules.value.findIndex(s => s.dayOfWeek === dayOfWeek)
    const schedule: DayOfWeekSchedule = {
      dayOfWeek,
      slots,
      isBlocked
    }

    if (existingIndex >= 0) {
      dayOfWeekSchedules.value[existingIndex] = schedule
    } else {
      dayOfWeekSchedules.value.push(schedule)
    }

    saveAvailability()
  }

  const getDayOfWeekSchedule = (dayOfWeek: number): DayOfWeekSchedule | null => {
    return dayOfWeekSchedules.value.find(s => s.dayOfWeek === dayOfWeek) || null
  }

  const getAllDayOfWeekSchedules = computed(() => dayOfWeekSchedules.value)

  return {
    availability: getAllAvailability,
    setDayAvailability,
    removeDayAvailability,
    getDayAvailability,
    isDateAvailable,
    getAvailableSlots,
    clearAllAvailability,
    setDayOfWeekSchedule,
    getDayOfWeekSchedule,
    dayOfWeekSchedules: getAllDayOfWeekSchedules
  }
}

