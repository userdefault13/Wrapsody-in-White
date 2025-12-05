import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    const query = getQuery(event)
    
    // Build query filter
    const filter: any = {}
    
    if (query.email) {
      filter.email = query.email
    }
    
    if (query.status) {
      filter.status = query.status
    }
    
    if (query.date) {
      filter.date = query.date
    }
    
    const bookings = await db.collection('bookings').find(filter).sort({ createdAt: -1 }).toArray()
    
    return {
      success: true,
      data: bookings
    }
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    console.error('Error details:', error.message, error.stack)
    throw createError({
      statusCode: 500,
      message: `Failed to fetch bookings: ${error.message || 'Unknown error'}`
    })
  }
})

