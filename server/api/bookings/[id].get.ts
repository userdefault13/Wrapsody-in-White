import { getDatabase } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const db = await getDatabase()
    
    // Try to find by id field first (our custom ID)
    let booking = await db.collection('bookings').findOne({ id })
    
    // If not found, try MongoDB _id
    if (!booking && ObjectId.isValid(id)) {
      booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) })
    }
    
    if (!booking) {
      throw createError({
        statusCode: 404,
        message: 'Booking not found'
      })
    }
    
    return {
      success: true,
      data: booking
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching booking:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch booking'
    })
  }
})

