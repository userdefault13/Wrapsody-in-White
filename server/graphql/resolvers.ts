import { getDatabase } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

// Helper function to calculate booking duration in minutes
async function calculateBookingDuration(service: string, numberOfGifts: number): Promise<number> {
  const db = await getDatabase()
  
  // Find the pricing tier for this service
  const pricing = await db.collection('pricing').findOne({ name: service })
  
  if (!pricing || !pricing.scopeOfWork || !pricing.scopeOfWork.duration) {
    // Default to 15 minutes per item if no scope of work is defined
    return numberOfGifts * 15
  }
  
  // Calculate total duration: numberOfGifts × duration per item
  return numberOfGifts * pricing.scopeOfWork.duration
}

// Helper function to get time slots occupied by a booking based on duration
function getOccupiedTimeSlots(startTime: string, durationMinutes: number, allSlots: string[]): string[] {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const startTotalMinutes = startHour * 60 + startMin
  
  // Calculate end time
  const endTotalMinutes = startTotalMinutes + durationMinutes
  
  // Round up to the next hour for safety (e.g., if work ends at 7:45, block until 8:00)
  const endHour = Math.ceil(endTotalMinutes / 60)
  const endSlotTotalMinutes = endHour * 60
  
  // Find all slots that fall within the booking duration
  const occupiedSlots: string[] = []
  
  for (const slot of allSlots) {
    const [slotHour, slotMin] = slot.split(':').map(Number)
    const slotTotalMinutes = slotHour * 60 + slotMin
    
    // If slot is between start and end time (inclusive of start, exclusive of end)
    // We round up to the next hour to account for cleanup/buffer time
    if (slotTotalMinutes >= startTotalMinutes && slotTotalMinutes < endSlotTotalMinutes) {
      occupiedSlots.push(slot)
    }
  }
  
  return occupiedSlots
}

// Helper function to find alternative time slots for a booking
async function findAlternativeTimeSlot(
  booking: any,
  conflictingSlots: string[],
  baseSlots: string[],
  existingBookings: any[],
  db: any
): Promise<string | null> {
  const durationMinutes = await calculateBookingDuration(booking.service, booking.numberOfGifts || 1)
  
  // Find the earliest available slot after the conflict ends
  // Sort conflicting slots to find the latest one
  const sortedConflictingSlots = [...conflictingSlots].sort()
  const lastConflictingSlot = sortedConflictingSlots[sortedConflictingSlots.length - 1]
  
  const [lastHour, lastMin] = lastConflictingSlot.split(':').map(Number)
  const lastConflictingMinutes = lastHour * 60 + lastMin
  
  // Find available slots after the conflict
  for (const slot of baseSlots) {
    const [slotHour, slotMin] = slot.split(':').map(Number)
    const slotMinutes = slotHour * 60 + slotMin
    
    // Only consider slots after the conflict ends
    if (slotMinutes <= lastConflictingMinutes) {
      continue
    }
    
    // Check if this slot and subsequent required slots are available
    const potentialOccupiedSlots = getOccupiedTimeSlots(slot, durationMinutes, baseSlots)
    
    // Check if any of these slots are already occupied by other bookings
    let isAvailable = true
    for (const s of potentialOccupiedSlots) {
      // Check if this slot is occupied by any existing booking (excluding the one we're rescheduling)
      for (const b of existingBookings) {
        if (b.id === booking.id) continue // Skip the booking we're rescheduling
        
        const bDurationMinutes = await calculateBookingDuration(b.service, b.numberOfGifts || 1)
        const bOccupiedSlots = getOccupiedTimeSlots(b.time, bDurationMinutes, baseSlots)
        
        if (bOccupiedSlots.includes(s)) {
          isAvailable = false
          break
        }
      }
      if (!isAvailable) break
    }
    
    if (isAvailable) {
      return slot
    }
  }
  
  return null
}

// Helper function to get available time slots for a date
async function getAvailableTimeSlotsForDate(date: string): Promise<string[]> {
  const db = await getDatabase()
  // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day) // month is 0-indexed
  const dayOfWeek = dateObj.getDay()
  console.log(`getAvailableTimeSlotsForDate for ${date}: Parsed as year=${year}, month=${month}, day=${day}, dayOfWeek=${dayOfWeek} (0=Sunday, 1=Monday, etc.)`)

  // Get availability schedule
  const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
  const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
  const availability = scheduleDoc?.availability || []

  let baseSlots: string[] = []

  // 1. Check day-of-week schedule first
  const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
  if (daySchedule) {
    if (daySchedule.isBlocked) {
      // Day is blocked, return empty array immediately
      return []
    }
    baseSlots = daySchedule.slots || []
  }

  // 2. Override with specific date availability if it exists
  const dayAvailability = availability.find((a: any) => a.date === date)
  if (dayAvailability) {
    if (!dayAvailability.isAvailable) {
      // Specific date is not available, return empty array
      return []
    }
    baseSlots = dayAvailability.slots || []
  }

  // If no specific schedule and no day-of-week schedule, fall back to default (6 AM - 11 PM)
  if (baseSlots.length === 0 && !daySchedule) {
    for (let hour = 6; hour <= 23; hour++) {
      baseSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
  }

  // Get bookings for this date to filter out booked slots
  const dayBookings = await db.collection('bookings').find({
    date,
    status: { $ne: 'cancelled' }
  }).toArray()

  // Calculate occupied slots based on booking duration
  const occupiedSlots = new Set<string>()
  
  for (const booking of dayBookings) {
    // Calculate duration for this booking
    const durationMinutes = await calculateBookingDuration(booking.service, booking.numberOfGifts || 1)
    
    // Get all time slots that would be occupied by this booking
    const bookingOccupiedSlots = getOccupiedTimeSlots(booking.time, durationMinutes, baseSlots)
    
    // Add to occupied set
    bookingOccupiedSlots.forEach(slot => occupiedSlots.add(slot))
  }

  // Return available slots that aren't occupied
  return baseSlots.filter(slot => !occupiedSlots.has(slot))
}

// Helper function to check if a date is available
async function isDateAvailableCheck(date: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day) // month is 0-indexed
  selectedDate.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    console.log(`isDateAvailableCheck for ${date}: Date is in the past. Returning false.`)
    return false
  }

  const db = await getDatabase()
  // Use the same local date parsing to get correct dayOfWeek
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeek = dateObj.getDay()
  console.log(`isDateAvailableCheck for ${date}: Parsed as year=${year}, month=${month}, day=${day}, dayOfWeek=${dayOfWeek} (0=Sunday, 1=Monday, etc.)`)

  // Get availability schedule
  const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
  const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
  const availability = scheduleDoc?.availability || []

  // 1. Check day-of-week schedule first
  const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
  if (daySchedule) {
    if (daySchedule.isBlocked) {
      console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) is blocked`)
      return false
    }
    if (daySchedule.slots.length > 0) {
      const slots = await getAvailableTimeSlotsForDate(date)
      console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) has ${slots.length} available slots`)
      return slots.length > 0
    }
    console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) has no slots configured`)
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
  console.log(`Date ${date} (dayOfWeek ${dayOfWeek}) - no schedule found, using default slots: ${slots.length}`)
  return slots.length > 0
}

export const resolvers = {
  User: {
    transactionHistory: async (parent: any) => {
      try {
        const db = await getDatabase()
        if (!parent.id) {
          return []
        }

        const transactions = await db.collection('transactions')
          .find({ userId: parent.id })
          .sort({ createdAt: -1 })
          .toArray()

        return transactions.map((tx: any) => ({
          ...tx,
          amount: tx.amount ? (tx.amount / 100) : 0,
          metadata: tx.metadata ? JSON.stringify(tx.metadata) : null
        }))
      } catch (error: any) {
        console.error('Error fetching user transaction history:', error)
        return []
      }
    }
  },

  Booking: {
    items: async (parent: any) => {
      try {
        const db = await getDatabase()
        const items = await db.collection('bookingItems')
          .find({ bookingId: parent.id })
          .sort({ itemNumber: 1 })
          .toArray()
        
        // Map legacy status values to valid GraphQL enum values
        const mapItemStatus = (status: string) => {
          const statusMap: Record<string, string> = {
            'started': 'wrapping',
            'assigned': 'checked_in',
            'staging': 'wrapping',
            'cutting': 'wrapping',
            'ribbon': 'quality_check',
            'tag': 'quality_check',
            'complete': 'ready'
          }
          return statusMap[status] || status
        }
        
        // Normalize item statuses and ensure wrappingProgress is always an array
        return items.map((item: any) => ({
          ...item,
          status: mapItemStatus(item.status || 'pending_checkin'),
          wrappingProgress: Array.isArray(item.wrappingProgress) ? item.wrappingProgress : []
        }))
      } catch (error: any) {
        console.error('Error fetching booking items:', error)
        return []
      }
    },
    checkedInAt: async (parent: any) => {
      return parent.checkedInAt || null
    },
    checkedInBy: async (parent: any) => {
      return parent.checkedInBy || null
    },
    currentStage: async (parent: any) => {
      return parent.currentStage || 'awaiting_checkin'
    }
  },

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

      const bookings = await db.collection('bookings')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      // Map legacy "confirmed" status to "pending" for GraphQL compatibility
      return bookings.map((booking: any) => ({
        ...booking,
        status: booking.status === 'confirmed' ? 'pending' : booking.status
      }))
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

      // Map legacy "confirmed" status to "pending" for GraphQL compatibility
      return {
        ...booking,
        status: booking.status === 'confirmed' ? 'pending' : booking.status
      }
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

    maxGiftsForTimeSlot: async (_: any, args: { date: string; time: string; service: string }) => {
      const db = await getDatabase()
      
      // Get base slots for the date
      const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
      const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
      const availability = scheduleDoc?.availability || []
      
      const [year, month, day] = args.date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      const dayOfWeek = dateObj.getDay()
      
      let baseSlots: string[] = []
      const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
      if (daySchedule && !daySchedule.isBlocked) {
        baseSlots = daySchedule.slots || []
      }
      
      const dayAvailability = availability.find((a: any) => a.date === args.date)
      if (dayAvailability && dayAvailability.isAvailable) {
        baseSlots = dayAvailability.slots || []
      }
      
      if (baseSlots.length === 0 && !daySchedule) {
        for (let hour = 6; hour <= 23; hour++) {
          baseSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        }
      }
      
      // Get the last available slot time
      const lastSlot = baseSlots[baseSlots.length - 1]
      const [lastHour, lastMin] = lastSlot.split(':').map(Number)
      const lastSlotMinutes = lastHour * 60 + lastMin
      const lastAvailableMinutes = lastSlotMinutes + 60 // Add 1 hour buffer
      
      // Get pricing to find duration per gift
      const pricing = await db.collection('pricing').findOne({ name: args.service })
      if (!pricing || !pricing.scopeOfWork || !pricing.scopeOfWork.duration) {
        // Default to 15 minutes per item
        const defaultDuration = 15
        const [startHour, startMin] = args.time.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const availableMinutes = lastAvailableMinutes - startMinutes
        return Math.floor(availableMinutes / defaultDuration)
      }
      
      const durationPerGift = pricing.scopeOfWork.duration
      
      // Calculate available time from start time to closing
      const [startHour, startMin] = args.time.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const availableMinutes = lastAvailableMinutes - startMinutes
      
      // Account for existing bookings that might interleave
      const existingBookings = await db.collection('bookings').find({
        date: args.date,
        status: { $ne: 'cancelled' }
      }).toArray()
      
      // Calculate if existing bookings would affect available time
      // For simplicity, we'll calculate max based on available time until close
      // The interleaving logic will handle conflicts during booking creation
      const maxGifts = Math.floor(availableMinutes / durationPerGift)
      
      return Math.max(1, maxGifts) // At least 1 gift
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
    },

    transactions: async (_: any, args: { bookingId?: string; status?: string; paymentMethod?: string; userId?: string }) => {
      const db = await getDatabase()
      const query: any = {}

      if (args.bookingId) {
        query.bookingId = args.bookingId
      }
      if (args.status) {
        query.status = args.status
      }
      if (args.paymentMethod) {
        query.paymentMethod = args.paymentMethod
      }
      if (args.userId) {
        query.userId = args.userId
      }

      const transactions = await db.collection('transactions')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      return transactions.map((tx: any) => ({
        ...tx,
        // Amount is stored in cents in DB, convert to dollars for GraphQL response
        amount: tx.amount ? (tx.amount / 100) : 0,
        metadata: tx.metadata ? JSON.stringify(tx.metadata) : null
      }))
    },

    transaction: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let transaction = await db.collection('transactions').findOne({ id: args.id })
      if (!transaction && ObjectId.isValid(args.id)) {
        transaction = await db.collection('transactions').findOne({ _id: new ObjectId(args.id) })
      }
      if (!transaction) {
        throw new Error('Transaction not found')
      }
      return {
        ...transaction,
        // Amount is stored in cents in DB, convert to dollars for GraphQL response
        amount: transaction.amount ? (transaction.amount / 100) : 0,
        metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null
      }
    },

    inventory: async (_: any, args: { type?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.type) {
          query.type = args.type
        }

        const inventory = await db.collection('inventory')
          .find(query)
          .sort({ type: 1, name: 1, createdAt: -1 })
          .toArray()

        return inventory
      } catch (error: any) {
        console.error('Error in inventory query:', error)
        throw new Error(`Failed to fetch inventory: ${error.message}`)
      }
    },

    inventoryItem: async (_: any, args: { id: string }) => {
      const db = await getDatabase()
      let item = await db.collection('inventory').findOne({ id: args.id })

      if (!item && ObjectId.isValid(args.id)) {
        item = await db.collection('inventory').findOne({ _id: new ObjectId(args.id) })
      }

      if (!item) {
        throw new Error('Inventory item not found')
      }

      return item
    },

    users: async (_: any, args: { email?: string; walletAddress?: string; role?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.email) {
          query.email = args.email
        }
        if (args.walletAddress) {
          query.walletAddress = args.walletAddress
        }
        if (args.role) {
          query.role = args.role
        }

        const users = await db.collection('users')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray()

        return users
      } catch (error: any) {
        console.error('Error in users query:', error)
        throw new Error(`Failed to fetch users: ${error.message}`)
      }
    },

    user: async (_: any, args: { id?: string; email?: string; walletAddress?: string }) => {
      try {
        const db = await getDatabase()
        let user = null

        if (args.id) {
          user = await db.collection('users').findOne({ id: args.id })
          if (!user && ObjectId.isValid(args.id)) {
            user = await db.collection('users').findOne({ _id: new ObjectId(args.id) })
          }
        } else if (args.email) {
          user = await db.collection('users').findOne({ email: args.email })
        } else if (args.walletAddress) {
          user = await db.collection('users').findOne({ walletAddress: args.walletAddress })
        }

        if (!user) {
          throw new Error('User not found')
        }

        return user
      } catch (error: any) {
        console.error('Error in user query:', error)
        throw new Error(`Failed to fetch user: ${error.message}`)
      }
    },

    workers: async (_: any, args: { workerType?: string }) => {
      try {
        const db = await getDatabase()
        const query: any = {}

        if (args.workerType) {
          query.workerType = args.workerType
        }

        const workers = await db.collection('workers')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray()

        return workers
      } catch (error: any) {
        console.error('Error in workers query:', error)
        throw new Error(`Failed to fetch workers: ${error.message}`)
      }
    },

    worker: async (_: any, args: { id?: string; walletAddress?: string }) => {
      try {
        const db = await getDatabase()
        let worker = null

        if (args.id) {
          worker = await db.collection('workers').findOne({ id: args.id })
          if (!worker && ObjectId.isValid(args.id)) {
            worker = await db.collection('workers').findOne({ _id: new ObjectId(args.id) })
          }
        } else if (args.walletAddress) {
          // Wallet addresses should be compared case-insensitively
          // Try exact match first, then case-insensitive match
          worker = await db.collection('workers').findOne({ walletAddress: args.walletAddress })
          if (!worker) {
            // Try case-insensitive search using regex
            worker = await db.collection('workers').findOne({
              walletAddress: { $regex: new RegExp(`^${args.walletAddress}$`, 'i') }
            })
          }
        }

        if (!worker) {
          throw new Error('Worker not found')
        }

        return worker
      } catch (error: any) {
        console.error('Error in worker query:', error)
        throw new Error(`Failed to fetch worker: ${error.message}`)
      }
    },

    bookingItems: async (_: any, args: { bookingId: string }) => {
      try {
        const db = await getDatabase()
        const items = await db.collection('bookingItems')
          .find({ bookingId: args.bookingId })
          .sort({ itemNumber: 1 })
          .toArray()
        
        // Map legacy status values to valid GraphQL enum values
        const mapItemStatus = (status: string) => {
          const statusMap: Record<string, string> = {
            'started': 'wrapping',
            'assigned': 'checked_in',
            'staging': 'wrapping',
            'cutting': 'wrapping',
            'ribbon': 'quality_check',
            'tag': 'quality_check',
            'complete': 'ready'
          }
          return statusMap[status] || status
        }
        
        // Normalize item statuses and ensure wrappingProgress is always an array
        return items.map((item: any) => ({
          ...item,
          status: mapItemStatus(item.status || 'pending_checkin'),
          wrappingProgress: Array.isArray(item.wrappingProgress) ? item.wrappingProgress : []
        }))
      } catch (error: any) {
        console.error('Error fetching booking items:', error)
        return []
      }
    },

    terminalBookings: async (_: any, args: { stage?: string }) => {
      try {
        const db = await getDatabase()
        
        // Build query based on stage filter
        const query: any = {
          status: { $ne: 'cancelled' } // Exclude cancelled bookings
        }
        
        // If stage filter is provided, filter by currentStage
        // Also include bookings without currentStage set (default to awaiting_checkin)
        if (args.stage) {
          query.$or = [
            { currentStage: args.stage },
            // If filtering for awaiting_checkin, also include bookings without currentStage
            ...(args.stage === 'awaiting_checkin' ? [{ currentStage: { $exists: false } }] : [])
          ]
        }
        
        console.log('Terminal bookings query:', JSON.stringify(query, null, 2))
        
        // Fetch bookings
        const bookings = await db.collection('bookings')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray()
        
        console.log(`Found ${bookings.length} bookings in database`)
        
        // For each booking, fetch its items
        const bookingsWithItems = await Promise.all(bookings.map(async (booking: any) => {
          const items = await db.collection('bookingItems')
            .find({ bookingId: booking.id })
            .sort({ itemNumber: 1 })
            .toArray()
          
          // Set default currentStage if not set
          const currentStage = booking.currentStage || 'awaiting_checkin'
          
          // Map legacy status values to valid GraphQL enum values
          const mapItemStatus = (status: string) => {
            const statusMap: Record<string, string> = {
              'started': 'wrapping',
              'assigned': 'checked_in',
              'staging': 'wrapping',
              'cutting': 'wrapping',
              'ribbon': 'quality_check',
              'tag': 'quality_check',
              'complete': 'ready'
            }
            return statusMap[status] || status
          }
          
          // Normalize item statuses and ensure wrappingProgress is always an array
          const normalizedItems = (items || []).map((item: any) => ({
            ...item,
            status: mapItemStatus(item.status || 'pending_checkin'),
            wrappingProgress: Array.isArray(item.wrappingProgress) ? item.wrappingProgress : []
          }))
          
          return { 
            ...booking,
            status: booking.status === 'confirmed' ? 'pending' : booking.status,
            currentStage: currentStage,
            items: normalizedItems
          }
        }))
        
        console.log(`Returning ${bookingsWithItems.length} bookings with items`)
        return bookingsWithItems
      } catch (error: any) {
        console.error('Error fetching terminal bookings:', error)
        return []
      }
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

      // Get base slots for the date (before filtering by existing bookings)
      const scheduleDoc = await db.collection('availability').findOne({ type: 'schedule' })
      const dayOfWeekSchedules = scheduleDoc?.dayOfWeekSchedules || []
      const availability = scheduleDoc?.availability || []
      
      const [year, month, day] = args.input.date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      const dayOfWeek = dateObj.getDay()
      
      let baseSlots: string[] = []
      const daySchedule = dayOfWeekSchedules.find((s: any) => s.dayOfWeek === dayOfWeek)
      if (daySchedule && !daySchedule.isBlocked) {
        baseSlots = daySchedule.slots || []
      }
      
      const dayAvailability = availability.find((a: any) => a.date === args.input.date)
      if (dayAvailability && dayAvailability.isAvailable) {
        baseSlots = dayAvailability.slots || []
      }
      
      if (baseSlots.length === 0 && !daySchedule) {
        for (let hour = 6; hour <= 23; hour++) {
          baseSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        }
      }

      // Get existing bookings for this date
      const existingBookings = await db.collection('bookings').find({
        date: args.input.date,
        status: { $ne: 'cancelled' }
      }).toArray()
      
      // Get currently available slots (excluding existing bookings)
      const availableSlots = await getAvailableTimeSlotsForDate(args.input.date)
      
      // Calculate duration for the new booking
      const durationMinutes = await calculateBookingDuration(args.input.service, args.input.numberOfGifts || 1)
      
      // First check: Does the booking extend beyond available time slots?
      // Calculate when the work would end
      const [startHour, startMin] = args.input.time.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = startMinutes + durationMinutes
      
      // Get the last available slot time
      if (baseSlots.length > 0) {
        const lastSlot = baseSlots[baseSlots.length - 1]
        const [lastHour, lastMin] = lastSlot.split(':').map(Number)
        const lastSlotMinutes = lastHour * 60 + lastMin
        const lastAvailableMinutes = lastSlotMinutes + 60 // Add 1 hour buffer for completion
        
        if (endMinutes > lastAvailableMinutes) {
          // Work extends beyond closing time - check if delivery service is selected
          const pricing = await db.collection('pricing').findOne({ name: args.input.service })
          const serviceCategory = pricing?.serviceCategory || 'dropoff'
          
          if (serviceCategory === 'dropoff') {
            // For dropoff, client needs to pick up before close - reject and suggest delivery
            const endHour = Math.floor(endMinutes / 60) % 24
            const endMin = endMinutes % 60
            const lastAvailHour = Math.floor(lastAvailableMinutes / 60) % 24
            const lastAvailMin = lastAvailableMinutes % 60
            
            // Find the latest time that would allow completion
            const latestStartMinutes = lastAvailableMinutes - durationMinutes
            const latestStartHour = Math.floor(latestStartMinutes / 60) % 24
            const latestStartMin = latestStartMinutes % 60
            
            throw new Error(
              `This booking would extend past closing time. ` +
              `Work would end at ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}, ` +
              `but we close at ${lastAvailHour.toString().padStart(2, '0')}:${lastAvailMin.toString().padStart(2, '0')}. ` +
              `For drop-off service, please schedule no later than ${latestStartHour.toString().padStart(2, '0')}:${latestStartMin.toString().padStart(2, '0')}, ` +
              `or choose our delivery service instead - we can deliver your wrapped gifts to you after completion!`
            )
          }
          // For delivery or onsite services, allow it since client doesn't need to pick up before close
          console.log(`[LATE BOOKING] Allowing booking extending past close for ${serviceCategory} service - will be delivered/completed after hours`)
        }
      }
      
      // Get all slots that would be occupied by this new booking
      const newBookingOccupiedSlots = getOccupiedTimeSlots(args.input.time, durationMinutes, baseSlots)
      
      // Check if all required slots are available
      const allSlotsAvailable = newBookingOccupiedSlots.every(slot => availableSlots.includes(slot))
      
      if (!allSlotsAvailable) {
        // Find conflicting bookings and check if we can interleave work
        const conflictingBookings: any[] = []
        
        for (const existingBooking of existingBookings) {
          const existingDuration = await calculateBookingDuration(existingBooking.service, existingBooking.numberOfGifts || 1)
          const existingOccupiedSlots = getOccupiedTimeSlots(existingBooking.time, existingDuration, baseSlots)
          
          // Check if there's any overlap
          const hasOverlap = newBookingOccupiedSlots.some(slot => existingOccupiedSlots.includes(slot))
          
          if (hasOverlap) {
            conflictingBookings.push({
              booking: existingBooking,
              occupiedSlots: existingOccupiedSlots,
              duration: existingDuration
            })
          }
        }
        
        // Calculate if we can interleave work (pause earlier, do later, resume earlier)
        // Strategy: Allow overlapping bookings if there's enough total time in the day
        
        // Get all bookings for the day (including the new one) sorted by time
        const allDayBookings = [
          ...existingBookings,
          {
            ...args.input,
            time: args.input.time,
            duration: durationMinutes
          }
        ].map(async (b: any) => {
          const dur = b.duration || await calculateBookingDuration(b.service, b.numberOfGifts || 1)
          const [hour, min] = b.time.split(':').map(Number)
          return {
            ...b,
            timeMinutes: hour * 60 + min,
            duration: dur
          }
        })
        
        const resolvedBookings = await Promise.all(allDayBookings)
        resolvedBookings.sort((a, b) => a.timeMinutes - b.timeMinutes)
        
        // Calculate total time needed with interleaving
        // Strategy: Work on bookings in order, pausing earlier work when later bookings start
        // Example: Bob 3PM (5h), Alice 4PM (1h) → Work Bob 3-4PM, pause Bob, work Alice 4-5PM, resume Bob 5-9PM
        
        let currentTime = resolvedBookings[0]?.timeMinutes || 0
        const activeWork: Array<{ booking: any; remaining: number }> = []
        
        for (let i = 0; i < resolvedBookings.length; i++) {
          const booking = resolvedBookings[i]
          
          // Process any active work until this booking's start time
          while (activeWork.length > 0 && currentTime < booking.timeMinutes) {
            const work = activeWork[0]
            const timeUntilNext = booking.timeMinutes - currentTime
            const workDone = Math.min(work.remaining, timeUntilNext)
            
            work.remaining -= workDone
            currentTime += workDone
            
            if (work.remaining === 0) {
              activeWork.shift() // Remove completed work
            } else {
              break // Still have work remaining, but next booking starts
            }
          }
          
          // Start this booking (or add to queue if we're still working on something)
          currentTime = Math.max(currentTime, booking.timeMinutes)
          activeWork.push({
            booking,
            remaining: booking.duration
          })
          
          // Process this booking immediately
          const work = activeWork[activeWork.length - 1]
          const nextBooking = resolvedBookings[i + 1]
          
          if (nextBooking) {
            // Check if next booking starts before this one finishes
            const timeUntilNext = nextBooking.timeMinutes - currentTime
            if (timeUntilNext < work.remaining) {
              // Pause this work, do some of it
              const workDone = timeUntilNext
              work.remaining -= workDone
              currentTime += workDone
            } else {
              // Can complete this before next starts
              currentTime += work.remaining
              work.remaining = 0
              activeWork.pop()
            }
          } else {
            // Last booking, complete it
            currentTime += work.remaining
            work.remaining = 0
            activeWork.pop()
          }
        }
        
        // Complete any remaining work
        while (activeWork.length > 0) {
          const work = activeWork[0]
          currentTime += work.remaining
          work.remaining = 0
          activeWork.shift()
        }
        
        // Check if there's enough time in the day
        const startMinutes = resolvedBookings[0]?.timeMinutes || 0
        const endMinutes = currentTime
        
        // Get the last available slot time
        const lastSlot = baseSlots[baseSlots.length - 1]
        const [lastHour, lastMin] = lastSlot.split(':').map(Number)
        const lastSlotMinutes = lastHour * 60 + lastMin
        const lastAvailableMinutes = lastSlotMinutes + 60 // Add 1 hour buffer
        
        if (endMinutes > lastAvailableMinutes) {
          // Check if any of the bookings are dropoff (need pickup before close)
          const dropoffBookings = []
          for (const booking of resolvedBookings) {
            const pricing = await db.collection('pricing').findOne({ name: booking.service })
            const serviceCategory = pricing?.serviceCategory || 'dropoff'
            if (serviceCategory === 'dropoff') {
              dropoffBookings.push(booking)
            }
          }
          
          const totalWorkTime = endMinutes - startMinutes
          const endHour = Math.floor(endMinutes / 60) % 24
          const endMin = endMinutes % 60
          const lastAvailHour = Math.floor(lastAvailableMinutes / 60) % 24
          const lastAvailMin = lastAvailableMinutes % 60
          
          if (dropoffBookings.length > 0) {
            // Has dropoff bookings that need pickup before close
            const dropoffNames = dropoffBookings.map(b => b.name || 'booking').join(', ')
            throw new Error(
              `Not enough time available to complete all work before closing. ` +
              `Work would end at ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}, ` +
              `but we close at ${lastAvailHour.toString().padStart(2, '0')}:${lastAvailMin.toString().padStart(2, '0')}. ` +
              `The following drop-off booking(s) need pickup before close: ${dropoffNames}. ` +
              `Please choose an earlier time or switch to delivery service - we can deliver your wrapped gifts to you after completion!`
            )
          } else {
            // All bookings are delivery/onsite - allow it
            console.log(`[LATE INTERLEAVING] Allowing interleaved work extending past close for delivery/onsite services`)
          }
        }
        
        // Work can be interleaved - allow the booking
        // Log interleaving schedule for admin
        if (conflictingBookings.length > 0) {
          const endHour = Math.floor(endMinutes / 60) % 24
          const endMin = endMinutes % 60
          console.log(`[WORK INTERLEAVING] Allowing overlapping booking with interleaved work schedule:`)
          console.log(`  New booking: ${args.input.name} at ${args.input.time} (${Math.ceil(durationMinutes / 60)} hours)`)
          conflictingBookings.forEach(c => {
            console.log(`  Existing: ${c.booking.name} at ${c.booking.time} (${Math.ceil(c.duration / 60)} hours)`)
          })
          console.log(`  Work schedule: Start at ${resolvedBookings[0]?.time}, end at ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`)
          console.log(`  Note: Earlier work will be paused when later bookings start, then resumed after completion`)
        }
      }

      const booking = {
        currentStage: 'awaiting_checkin',
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
    },

    createTransaction: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate required fields
        if (!args.input.bookingId || args.input.amount === undefined) {
          throw new Error('Booking ID and amount are required')
        }

        // Generate unique ID
        const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const transaction = {
          id: transactionId,
          bookingId: args.input.bookingId,
          userId: args.input.userId || null,
          amount: Math.round(parseFloat(args.input.amount) * 100), // Store in cents
          currency: args.input.currency || 'USD',
          status: args.input.status || 'pending',
          paymentMethod: args.input.paymentMethod || 'card',
          paymentIntentId: args.input.paymentIntentId || null,
          metadata: args.input.metadata ? JSON.parse(args.input.metadata) : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('transactions').insertOne(transaction)
        return {
          ...transaction,
          amount: transaction.amount / 100, // Return as dollars
          metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
          _id: result.insertedId
        }
      } catch (error: any) {
        console.error('Error in createTransaction resolver:', error)
        throw new Error(`Failed to create transaction: ${error.message}`)
      }
    },

    createInventory: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Generate unique ID
        const inventoryId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const inventory = {
          id: inventoryId,
          name: args.input.name,
          type: args.input.type,
          size: args.input.size || null,
          cost: parseFloat(args.input.cost),
          quantity: parseInt(args.input.quantity) || 0,
          unit: args.input.unit || 'each',
          supplier: args.input.supplier || null,
          thumbnail: args.input.thumbnail || null,
          amazonAsin: args.input.amazonAsin || null,
          amazonUrl: args.input.amazonUrl || null,
          notes: args.input.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('inventory').insertOne(inventory)
        return { ...inventory, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createInventory resolver:', error)
        throw new Error(`Failed to create inventory item: ${error.message}`)
      }
    },

    updateInventory: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, ...updateData } = args.input

        // Build update object with only provided fields
        const update: any = {
          updatedAt: new Date().toISOString()
        }

        if (updateData.name !== undefined) update.name = updateData.name
        if (updateData.type !== undefined) update.type = updateData.type
        if (updateData.size !== undefined) update.size = updateData.size
        if (updateData.cost !== undefined) update.cost = parseFloat(updateData.cost)
        if (updateData.quantity !== undefined) update.quantity = parseInt(updateData.quantity)
        if (updateData.unit !== undefined) update.unit = updateData.unit
        if (updateData.supplier !== undefined) update.supplier = updateData.supplier
        if (updateData.thumbnail !== undefined) update.thumbnail = updateData.thumbnail
        if (updateData.amazonAsin !== undefined) update.amazonAsin = updateData.amazonAsin
        if (updateData.amazonUrl !== undefined) update.amazonUrl = updateData.amazonUrl
        if (updateData.notes !== undefined) update.notes = updateData.notes

        // Try to update by id field first
        let result = await db.collection('inventory').updateOne(
          { id },
          { $set: update }
        )

        // If not found, try MongoDB _id
        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('inventory').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        if (result.matchedCount === 0) {
          throw new Error('Inventory item not found')
        }

        // Fetch updated item
        let item = await db.collection('inventory').findOne({ id })
        if (!item && ObjectId.isValid(id)) {
          item = await db.collection('inventory').findOne({ _id: new ObjectId(id) })
        }

        return item
      } catch (error: any) {
        console.error('Error in updateInventory resolver:', error)
        throw new Error(`Failed to update inventory item: ${error.message}`)
      }
    },

    deleteInventory: async (_: any, args: { id: string }) => {
      try {
        const db = await getDatabase()

        // Try to delete by id field first
        let result = await db.collection('inventory').deleteOne({ id: args.id })

        // If not found, try MongoDB _id
        if (result.deletedCount === 0 && ObjectId.isValid(args.id)) {
          result = await db.collection('inventory').deleteOne({ _id: new ObjectId(args.id) })
        }

        if (result.deletedCount === 0) {
          throw new Error('Inventory item not found')
        }

        return true
      } catch (error: any) {
        console.error('Error in deleteInventory resolver:', error)
        throw new Error(`Failed to delete inventory item: ${error.message}`)
      }
    },

    createUser: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate that at least email or walletAddress is provided
        if (!args.input.email && !args.input.walletAddress) {
          throw new Error('Either email or walletAddress is required')
        }

        // Check if user already exists
        const existingQuery: any = {}
        if (args.input.email) {
          existingQuery.email = args.input.email
        }
        if (args.input.walletAddress) {
          existingQuery.walletAddress = args.input.walletAddress
        }

        const existing = await db.collection('users').findOne({
          $or: [
            ...(args.input.email ? [{ email: args.input.email }] : []),
            ...(args.input.walletAddress ? [{ walletAddress: args.input.walletAddress }] : [])
          ]
        })

        if (existing) {
          throw new Error('User with this email or wallet address already exists')
        }

        // Generate unique ID
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const user = {
          id: userId,
          email: args.input.email || null,
          walletAddress: args.input.walletAddress || null,
          name: args.input.name || null,
          role: args.input.role || 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('users').insertOne(user)
        return { ...user, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createUser resolver:', error)
        throw new Error(`Failed to create user: ${error.message}`)
      }
    },

    updateUser: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, ...updateData } = args.input

        // Build update object with only provided fields
        const update: any = {
          updatedAt: new Date().toISOString()
        }

        if (updateData.email !== undefined) update.email = updateData.email
        if (updateData.walletAddress !== undefined) update.walletAddress = updateData.walletAddress
        if (updateData.name !== undefined) update.name = updateData.name
        if (updateData.role !== undefined) update.role = updateData.role

        // Try to update by id field first
        let result = await db.collection('users').updateOne(
          { id },
          { $set: update }
        )

        // If not found, try MongoDB _id
        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        if (result.matchedCount === 0) {
          throw new Error('User not found')
        }

        // Fetch updated user
        let user = await db.collection('users').findOne({ id })
        if (!user && ObjectId.isValid(id)) {
          user = await db.collection('users').findOne({ _id: new ObjectId(id) })
        }

        return user
      } catch (error: any) {
        console.error('Error in updateUser resolver:', error)
        throw new Error(`Failed to update user: ${error.message}`)
      }
    },

    createWorker: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()

        // Validate walletAddress is provided
        if (!args.input.walletAddress) {
          throw new Error('Wallet address is required')
        }

        // Check if worker already exists
        const existing = await db.collection('workers').findOne({
          walletAddress: args.input.walletAddress
        })

        if (existing) {
          throw new Error('Worker with this wallet address already exists')
        }

        // Determine worker type based on wallet address
        const OWNER_ADDRESS = '0x2127AA7265D573Aa467f1D73554D17890b872E76'
        const workerType = args.input.walletAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()
          ? 'Owner'
          : 'Employee'

        // Generate unique ID
        const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const worker = {
          id: workerId,
          walletAddress: args.input.walletAddress,
          workerType,
          name: args.input.name || null,
          email: args.input.email || null,
          phone: args.input.phone || null,
          packagesCheckedIn: [],
          packagesWrapped: [],
          packagesCompleted: [],
          packagesDroppedOff: [],
          availabilityId: args.input.availabilityId || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const result = await db.collection('workers').insertOne(worker)
        return { ...worker, _id: result.insertedId }
      } catch (error: any) {
        console.error('Error in createWorker resolver:', error)
        throw new Error(`Failed to create worker: ${error.message}`)
      }
    },

    updateWorker: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, ...updateData } = args.input

        // Build update object with only provided fields
        const update: any = {
          updatedAt: new Date().toISOString()
        }

        if (updateData.name !== undefined) update.name = updateData.name
        if (updateData.email !== undefined) update.email = updateData.email
        if (updateData.phone !== undefined) update.phone = updateData.phone
        if (updateData.packagesCheckedIn !== undefined) update.packagesCheckedIn = updateData.packagesCheckedIn
        if (updateData.packagesWrapped !== undefined) update.packagesWrapped = updateData.packagesWrapped
        if (updateData.packagesCompleted !== undefined) update.packagesCompleted = updateData.packagesCompleted
        if (updateData.packagesDroppedOff !== undefined) update.packagesDroppedOff = updateData.packagesDroppedOff
        if (updateData.availabilityId !== undefined) update.availabilityId = updateData.availabilityId

        // Try to update by id field first
        let result = await db.collection('workers').updateOne(
          { id },
          { $set: update }
        )

        // If not found, try MongoDB _id
        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('workers').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        if (result.matchedCount === 0) {
          throw new Error('Worker not found')
        }

        // Fetch updated worker
        let worker = await db.collection('workers').findOne({ id })
        if (!worker && ObjectId.isValid(id)) {
          worker = await db.collection('workers').findOne({ _id: new ObjectId(id) })
        }

        return worker
      } catch (error: any) {
        console.error('Error in updateWorker resolver:', error)
        throw new Error(`Failed to update worker: ${error.message}`)
      }
    },

    addWorkerPackage: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, bookingId, action } = args.input

        // Determine which array to update based on action
        const fieldMap: Record<string, string> = {
          check_in: 'packagesCheckedIn',
          wrap: 'packagesWrapped',
          complete: 'packagesCompleted',
          drop_off: 'packagesDroppedOff'
        }

        const field = fieldMap[action]
        if (!field) {
          throw new Error(`Invalid action: ${action}. Must be one of: check_in, wrap, complete, drop_off`)
        }

        // Find worker
        let worker = await db.collection('workers').findOne({ id })
        if (!worker && ObjectId.isValid(id)) {
          worker = await db.collection('workers').findOne({ _id: new ObjectId(id) })
        }

        if (!worker) {
          throw new Error('Worker not found')
        }

        // Add bookingId to the appropriate array if not already present
        const currentArray = worker[field] || []
        if (!currentArray.includes(bookingId)) {
          currentArray.push(bookingId)
        }

        // Update worker
        const update: any = {
          [field]: currentArray,
          updatedAt: new Date().toISOString()
        }

        let result = await db.collection('workers').updateOne(
          { id },
          { $set: update }
        )

        if (result.matchedCount === 0 && ObjectId.isValid(id)) {
          result = await db.collection('workers').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
          )
        }

        // Fetch updated worker
        worker = await db.collection('workers').findOne({ id })
        if (!worker && ObjectId.isValid(id)) {
          worker = await db.collection('workers').findOne({ _id: new ObjectId(id) })
        }

        return worker
      } catch (error: any) {
        console.error('Error in addWorkerPackage resolver:', error)
        throw new Error(`Failed to add package to worker: ${error.message}`)
      }
    },
    checkInBooking: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { bookingId, checkedInBy } = args.input
        
        const booking = await db.collection('bookings').findOne({ id: bookingId })
        if (!booking) {
          throw new Error('Booking not found')
        }
        
        const update = {
          currentStage: 'checked_in',
          checkedInAt: new Date().toISOString(),
          checkedInBy: checkedInBy,
          status: 'in_progress',
          updatedAt: new Date().toISOString()
        }
        
        await db.collection('bookings').updateOne(
          { id: bookingId },
          { $set: update }
        )
        
        const updated = await db.collection('bookings').findOne({ id: bookingId })
        return {
          ...updated,
          status: updated.status === 'confirmed' ? 'pending' : updated.status,
          items: []
        }
      } catch (error: any) {
        console.error('Error in checkInBooking resolver:', error)
        throw new Error(`Failed to check in booking: ${error.message}`)
      }
    },
    addBookingItem: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { bookingId, itemNumber, description, size, photos, serialNumber, serialNumberPhoto, specialInstructions, wrappingStyle, isExpensiveElectronics, isLargerThanPaidSize, isSmallerThanPaidSize } = args.input
        
        // Generate unique ID
        const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const item = {
          id: itemId,
          bookingId: bookingId,
          itemNumber: itemNumber,
          description: description || null,
          size: size || null,
          photos: photos || [],
          serialNumber: serialNumber || null,
          serialNumberPhoto: serialNumberPhoto || null,
          specialInstructions: specialInstructions || null,
          wrappingStyle: wrappingStyle || null,
          materialsUsed: [],
          status: 'checked_in',
          assignedWorker: null,
          isExpensiveElectronics: isExpensiveElectronics || false,
          isLargerThanPaidSize: isLargerThanPaidSize || false,
          isSmallerThanPaidSize: isSmallerThanPaidSize || false,
          checkedInAt: new Date().toISOString(),
          wrappingStartedAt: null,
          wrappingCompletedAt: null,
          wrappingProgress: [],
          qualityCheckedAt: null,
          readyAt: null,
          pickedUpAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.collection('bookingItems').insertOne(item)
        return item
      } catch (error: any) {
        console.error('Error in addBookingItem resolver:', error)
        throw new Error(`Failed to add booking item: ${error.message}`)
      }
    },
    updateBookingItem: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { id, status, assignedWorker, materialsUsed, ...updates } = args.input
        
        const update: any = {
          updatedAt: new Date().toISOString()
        }
        
        // Update fields if provided
        if (updates.description !== undefined) update.description = updates.description
        if (updates.size !== undefined) update.size = updates.size
        if (updates.photos !== undefined) update.photos = updates.photos
        if (updates.serialNumber !== undefined) update.serialNumber = updates.serialNumber
        if (updates.serialNumberPhoto !== undefined) update.serialNumberPhoto = updates.serialNumberPhoto
        if (updates.specialInstructions !== undefined) update.specialInstructions = updates.specialInstructions
        if (updates.wrappingStyle !== undefined) update.wrappingStyle = updates.wrappingStyle
        if (updates.isExpensiveElectronics !== undefined) update.isExpensiveElectronics = updates.isExpensiveElectronics
        if (updates.isLargerThanPaidSize !== undefined) update.isLargerThanPaidSize = updates.isLargerThanPaidSize
        if (updates.isSmallerThanPaidSize !== undefined) update.isSmallerThanPaidSize = updates.isSmallerThanPaidSize
        
        if (status) {
          update.status = status
          // Set timestamps based on status
          if (status === 'wrapping' && !updates.wrappingStartedAt) {
            update.wrappingStartedAt = new Date().toISOString()
          } else if (status === 'quality_check' && !updates.wrappingCompletedAt) {
            update.wrappingCompletedAt = new Date().toISOString()
          } else if (status === 'ready' && !updates.qualityCheckedAt) {
            update.qualityCheckedAt = new Date().toISOString()
          } else if (status === 'picked_up' && !updates.readyAt) {
            update.readyAt = new Date().toISOString()
            update.pickedUpAt = new Date().toISOString()
          }
        }
        
        if (assignedWorker !== undefined) update.assignedWorker = assignedWorker
        if (materialsUsed !== undefined) update.materialsUsed = materialsUsed
        if (updates.wrappingProgress !== undefined) update.wrappingProgress = updates.wrappingProgress
        
        await db.collection('bookingItems').updateOne(
          { id: id },
          { $set: update }
        )
        
        const updated = await db.collection('bookingItems').findOne({ id: id })
        if (!updated) {
          throw new Error('Item not found after update')
        }
        return updated
      } catch (error: any) {
        console.error('Error in updateBookingItem resolver:', error)
        throw new Error(`Failed to update booking item: ${error.message}`)
      }
    },
    assignWorker: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { itemId, workerId } = args.input
        
        await db.collection('bookingItems').updateOne(
          { id: itemId },
          { 
            $set: {
              assignedWorker: workerId,
              updatedAt: new Date().toISOString()
            }
          }
        )
        
        const updated = await db.collection('bookingItems').findOne({ id: itemId })
        if (!updated) {
          throw new Error('Item not found')
        }
        return updated
      } catch (error: any) {
        console.error('Error in assignWorker resolver:', error)
        throw new Error(`Failed to assign worker: ${error.message}`)
      }
    },
    recordMaterialsUsed: async (_: any, args: { input: any }) => {
      try {
        const db = await getDatabase()
        const { itemId, materialsUsed } = args.input
        
        await db.collection('bookingItems').updateOne(
          { id: itemId },
          { 
            $set: {
              materialsUsed: materialsUsed,
              updatedAt: new Date().toISOString()
            }
          }
        )
        
        const updated = await db.collection('bookingItems').findOne({ id: itemId })
        if (!updated) {
          throw new Error('Item not found')
        }
        return updated
      } catch (error: any) {
        console.error('Error in recordMaterialsUsed resolver:', error)
        throw new Error(`Failed to record materials: ${error.message}`)
      }
    }
  }
}

