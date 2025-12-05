import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    // body should be an array of { id, order } objects
    if (!Array.isArray(body) || body.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Expected array of service orders'
      })
    }
    
    // Update all services with new order
    const updates = body.map(({ id, order }) => 
      db.collection('services').updateOne(
        { id },
        { $set: { order: parseInt(order), updatedAt: new Date().toISOString() } }
      )
    )
    
    await Promise.all(updates)
    
    return {
      success: true,
      message: 'Services reordered successfully'
    }
  } catch (error) {
    console.error('Error reordering services:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to reorder services'
    })
  }
})

