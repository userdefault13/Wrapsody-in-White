import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray()
    
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

