import { getDatabase } from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const db = await getDatabase()
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    // Try to update by id field first
    let result = await db.collection('bookings').updateOne(
      { id },
      { $set: updateData }
    )
    
    // If not found, try MongoDB _id
    if (result.matchedCount === 0 && ObjectId.isValid(id)) {
      result = await db.collection('bookings').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
    }
    
    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Booking not found'
      })
    }
    
    const updatedBooking = await db.collection('bookings').findOne(
      result.matchedCount > 0 ? { id } : { _id: new ObjectId(id) }
    )
    
    return {
      success: true,
      data: updatedBooking
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error updating booking:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update booking'
    })
  }
})

