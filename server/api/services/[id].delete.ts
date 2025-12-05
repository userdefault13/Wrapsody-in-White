import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const serviceId = getRouterParam(event, 'id')
    const db = await getDatabase()
    
    if (!serviceId) {
      throw createError({
        statusCode: 400,
        message: 'Service ID is required'
      })
    }
    
    // Delete service
    const result = await db.collection('services').deleteOne({ id: serviceId })
    
    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Service not found'
      })
    }
    
    return {
      success: true,
      message: 'Service deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting service:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to delete service'
    })
  }
})

