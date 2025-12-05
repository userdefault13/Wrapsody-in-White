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
    },

    pricing: async (_: any, args: { active?: boolean; group?: string; serviceCategory?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.active !== undefined) {
          query.active = args.active
        }
        if (args.group) {
          query.group = args.group
        }
        if (args.serviceCategory) {
          query.serviceCategory = args.serviceCategory
        }

        const pricing = await db.collection('pricing')
          .find(query)
          .sort({ order: 1, createdAt: 1 })
          .toArray()

        console.log(`Fetched ${pricing.length} pricing items from database`)
        return pricing
      } catch (error: any) {
        console.error('Error in pricing query:', error)
        throw new Error(`Failed to fetch pricing: ${error.message}`)
      }
    },

    pricingItem: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let pricing = await db.collection('pricing').findOne({ id: args.id })

      if (!pricing && ObjectId.isValid(args.id)) {
        pricing = await db.collection('pricing').findOne({
          _id: new ObjectId(args.id)
        })
      }

      if (!pricing) {
        throw new Error('Pricing item not found')
      }

      return pricing
    },

    services: async (_: any, args: { active?: boolean; category?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.active !== undefined) {
          query.active = args.active
        }
        if (args.category) {
          query.category = args.category
        }

        const services = await db.collection('services')
          .find(query)
          .sort({ order: 1, createdAt: 1 })
          .toArray()

        console.log(`Fetched ${services.length} services from database`)
        return services
      } catch (error: any) {
        console.error('Error in services query:', error)
        throw new Error(`Failed to fetch services: ${error.message}`)
      }
    },

    service: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let service = await db.collection('services').findOne({ id: args.id })

      if (!service && ObjectId.isValid(args.id)) {
        service = await db.collection('services').findOne({
          _id: new ObjectId(args.id)
        })
      }

      if (!service) {
        throw new Error('Service not found')
      }

      return service
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
    },

    // Pricing mutations (for pricing tiers)
    createPricing: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate required fields
        if (!args.input.name || args.input.price === undefined) {
          throw new Error('Name and price are required')
        }

        // Get current max order
        const maxOrderPricing = await db.collection('pricing')
          .findOne({}, { sort: { order: -1 } })
        const newOrder = maxOrderPricing ? maxOrderPricing.order + 1 : 0

        // Generate unique ID
        const pricingId = `pricing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const pricing = {
          id: pricingId,
          name: args.input.name,
          description: args.input.description || '',
          price: parseFloat(args.input.price),
          priceType: args.input.priceType || 'per-item',
          features: args.input.features || [],
          group: args.input.group || 'default',
          serviceCategory: args.input.serviceCategory || '',
          active: args.input.active !== false,
          order: args.input.order !== undefined ? parseInt(String(args.input.order)) : newOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('pricing').insertOne(pricing)
        return { ...pricing, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createPricing resolver:', error)
        throw new Error(`Failed to create pricing: ${error.message}`)
      }
    },

    updatePricing: async (_: any, args: { input: any }) => {
      const db = await getDatabase()
      const { id, ...updates } = args.input

      const update: any = {
        updatedAt: new Date().toISOString()
      }

      if (updates.name !== undefined) update.name = updates.name
      if (updates.description !== undefined) update.description = updates.description
      if (updates.price !== undefined) update.price = parseFloat(updates.price)
      if (updates.priceType !== undefined) update.priceType = updates.priceType
      if (updates.features !== undefined) update.features = updates.features
      if (updates.group !== undefined) update.group = updates.group
      if (updates.serviceCategory !== undefined) update.serviceCategory = updates.serviceCategory
      if (updates.active !== undefined) update.active = updates.active
      if (updates.order !== undefined) update.order = parseInt(String(updates.order))

      let result = await db.collection('pricing').updateOne(
        { id },
        { $set: update }
      )

      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        result = await db.collection('pricing').updateOne(
          { _id: new ObjectId(id) },
          { $set: update }
        )
      }

      if (result.matchedCount === 0) {
        throw new Error('Pricing item not found')
      }

      let pricing = await db.collection('pricing').findOne({ id })
      if (!pricing && ObjectId.isValid(id)) {
        pricing = await db.collection('pricing').findOne({ _id: new ObjectId(id) })
      }

      return pricing
    },

    deletePricing: async (_: any, args: { id: string }) => {
      const db = await getDatabase()

      let result = await db.collection('pricing').deleteOne({ id: args.id })

      if (result.deletedCount === 0 && ObjectId.isValid(args.id)) {
        result = await db.collection('pricing').deleteOne({
          _id: new ObjectId(args.id)
        })
      }

      if (result.deletedCount === 0) {
        throw new Error('Pricing item not found')
      }

      return true
    },

    reorderPricing: async (_: any, args: { input: { pricing: Array<{ id: string; order: number }> } }) => {
      const db = await getDatabase()

      const updates = args.input.pricing.map(({ id, order }) =>
        db.collection('pricing').updateOne(
          { id },
          { $set: { order: parseInt(String(order)), updatedAt: new Date().toISOString() } }
        )
      )

      await Promise.all(updates)
      return true
    },

    // Service mutations (for service types)
    createService: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate required fields
        if (!args.input.title) {
          throw new Error('Title is required')
        }

        // Get current max order
        const maxOrderService = await db.collection('services')
          .findOne({}, { sort: { order: -1 } })
        const newOrder = maxOrderService ? maxOrderService.order + 1 : 0

        // Generate unique ID
        const serviceId = `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const service = {
          id: serviceId,
          title: args.input.title,
          subtitle: args.input.subtitle || '',
          description: args.input.description || '',
          tag: args.input.tag || '',
          category: args.input.category || '',
          active: args.input.active !== false,
          order: args.input.order !== undefined ? parseInt(String(args.input.order)) : newOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('services').insertOne(service)
        return { ...service, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createService resolver:', error)
        throw new Error(`Failed to create service: ${error.message}`)
      }
    },

    updateService: async (_: any, args: { input: any }) => {
      const db = await getDatabase()
      const { id, ...updates } = args.input

      const update: any = {
        updatedAt: new Date().toISOString()
      }

      if (updates.title !== undefined) update.title = updates.title
      if (updates.subtitle !== undefined) update.subtitle = updates.subtitle
      if (updates.description !== undefined) update.description = updates.description
      if (updates.tag !== undefined) update.tag = updates.tag
      if (updates.category !== undefined) update.category = updates.category
      if (updates.active !== undefined) update.active = updates.active
      if (updates.order !== undefined) update.order = parseInt(String(updates.order))

      let result = await db.collection('services').updateOne(
        { id },
        { $set: update }
      )

      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        result = await db.collection('services').updateOne(
          { _id: new ObjectId(id) },
          { $set: update }
        )
      }

      if (result.matchedCount === 0) {
        throw new Error('Service not found')
      }

      let service = await db.collection('services').findOne({ id })
      if (!service && ObjectId.isValid(id)) {
        service = await db.collection('services').findOne({ _id: new ObjectId(id) })
      }

      return service
    },

    deleteService: async (_: any, args: { id: string }) => {
      const db = await getDatabase()

      let result = await db.collection('services').deleteOne({ id: args.id })

      if (result.deletedCount === 0 && ObjectId.isValid(args.id)) {
        result = await db.collection('services').deleteOne({
          _id: new ObjectId(args.id)
        })
      }

      if (result.deletedCount === 0) {
        throw new Error('Service not found')
      }

      return true
    },

    reorderServices: async (_: any, args: { input: { services: Array<{ id: string; order: number }> } }) => {
      const db = await getDatabase()

      const updates = args.input.services.map(({ id, order }) =>
        db.collection('services').updateOne(
          { id },
          { $set: { order: parseInt(String(order)), updatedAt: new Date().toISOString() } }
        )
      )

      await Promise.all(updates)
      return true
    }
  }
}

