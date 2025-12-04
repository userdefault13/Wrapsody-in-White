import { getDatabase } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

// Helper function to get available time slots for a date
async function getAvailableTimeSlotsForDate(date: string): Promise<string[]> {
  const db = await getDatabase()
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()

  // Get availability schedule
  const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
  const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
  const availability = scheduleDoc?.availability || []

  let baseSlots: string[] = []

  // 1. Check day-of-week schedule first
  const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
  if (daySchedule && !daySchedule.isBlocked) {
    baseSlots = daySchedule.slots || []
  }

  // 2. Override with specific date availability if it exists
  const dayAvailability = availability.find((a: any) => a.date === date)
  if (dayAvailability && dayAvailability.isAvailable) {
    baseSlots = dayAvailability.slots || []
  }

  // If no specific schedule, fall back to default (6 AM - 11 PM)
  if (baseSlots.length === 0) {
    for (let hour = 6; hour <= 23; hour++) {
      baseSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
  }

  // Get bookings for this date to filter out booked slots
  const dayBookings = await db.collection('bookings').find({
    date,
    status: { $ne: 'cancelled' }
  }).toArray()

  const bookedTimes = dayBookings.map((b: any) => b.time)

  // Return available slots that aren't booked
  return baseSlots.filter(slot => !bookedTimes.includes(slot))
}

// Helper function to check if a date is available
async function isDateAvailableCheck(date: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)

  if (selectedDate < today) return false

  const db = await getDatabase()
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()

  // Get availability schedule
  const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
  const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
  const availability = scheduleDoc?.availability || []

  // 1. Check day-of-week schedule first
  const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
  if (daySchedule) {
    if (daySchedule.isBlocked) {
      return false
    }
    if (daySchedule.slots.length > 0) {
      const slots = await getAvailableTimeSlotsForDate(date)
      return slots.length > 0
    }
    return false
  }

  // 2. Check specific date availability
  const dayAvailability = availability.find((a: any) => a.date === date)
  if (dayAvailability) {
    if (dayAvailability.isAvailable && dayAvailability.slots.length > 0) {
      const slots = await getAvailableTimeSlotsForDate(date)
      return slots.length > 0
    }
    return false
  }

  // 3. Default: check if date has available slots
  const slots = await getAvailableTimeSlotsForDate(date)
  return slots.length > 0
}

export const resolvers = {
  Query: {
    bookings: async (_: any, args: { status?: string; date?: string }) => {
      const db = await getDatabase()
      const query: any = {}

      if (args.status) {
        query.status = args.status
      }
      if (args.date) {
        query.date = args.date
      }

      return db.collection('bookings')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()
    },

    booking: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let booking = await db.collection('bookings').findOne({ id: args.id })

      if (!booking && ObjectId.isValid(args.id)) {
        booking = await db.collection('bookings').findOne({
          _id: new ObjectId(args.id)
        })
      }

      if (!booking) {
        throw new Error('Booking not found')
      }

      return booking
    },

    availability: async () => {
      const db = await getDatabase()
      const availability = await db.collection('availability').findOne({
        type: 'schedule'
      })

      return availability || {
        availability: [],
        dayOfWeekSchedules: [],
        updatedAt: new Date().toISOString()
      }
    },

    availableTimeSlots: async (_: any, args: { date: string }) => {
      return getAvailableTimeSlotsForDate(args.date)
    },

    isDateAvailable: async (_: any, args: { date: string }) => {
      return isDateAvailableCheck(args.date)
    }
  },

  Mutation: {
    createBooking: async (_: any, args: { input: any }) => {
      const db = await getDatabase()

      // Check if date/time is available
      const isAvailable = await isDateAvailableCheck(args.input.date)
      if (!isAvailable) {
        throw new Error('Selected date is not available')
      }

      const slots = await getAvailableTimeSlotsForDate(args.input.date)
      if (!slots.includes(args.input.time)) {
        throw new Error('Selected time slot is not available')
      }

      const booking = {
        ...args.input,
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await db.collection('bookings').insertOne(booking)
      return { ...booking, _id: result.insertedId }
    },

    updateBookingStatus: async (_: any, args: { input: { id: string; status: string } }) => {
      const db = await getDatabase()
      const { id, status } = args.input

      // Try to update by id field first
      let result = await db.collection('bookings').updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      )

      // If not found, try MongoDB _id
      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        result = await db.collection('bookings').updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date().toISOString() } }
        )
      }

      if (result.matchedCount === 0) {
        throw new Error('Booking not found')
      }

      // Fetch updated booking
      let booking = await db.collection('bookings').findOne({ id })
      if (!booking && ObjectId.isValid(id)) {
        booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) })
      }

      return booking
    },

    updateAvailability: async (_: any, args: { input: any }) => {
      const db = await getDatabase()
      const schedule = {
        type: 'schedule',
        availability: args.input.availability || [],
        dayOfWeekSchedules: args.input.dayOfWeekSchedules || [],
        updatedAt: new Date().toISOString()
      }

      await db.collection('availability').updateOne(
        { type: 'schedule' },
        { $set: schedule },
        { upsert: true }
      )

      return schedule
    }
  }
}

