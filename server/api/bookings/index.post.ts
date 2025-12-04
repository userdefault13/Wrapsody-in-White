import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    const booking = {
      ...body,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('bookings').insertOne(booking)
    
    return {
      success: true,
      data: { ...booking, _id: result.insertedId }
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create booking'
    })
  }
})

