import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const serviceId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const db = await getDatabase()
    
    if (!serviceId) {
      throw createError({
        statusCode: 400,
        message: 'Service ID is required'
      })
    }
    
    // Build update object
    const update: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.name !== undefined) update.name = body.name
    if (body.description !== undefined) update.description = body.description
    if (body.price !== undefined) update.price = parseFloat(body.price)
    if (body.priceType !== undefined) update.priceType = body.priceType
    if (body.features !== undefined) update.features = body.features
    if (body.group !== undefined) update.group = body.group
    if (body.active !== undefined) update.active = body.active
    if (body.order !== undefined) update.order = parseInt(body.order)
    
    // Update service
    const result = await db.collection('services').updateOne(
      { id: serviceId },
      { $set: update }
    )
    
    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Service not found'
      })
    }
    
    // Get updated service
    const updatedService = await db.collection('services').findOne({ id: serviceId })
    
    return {
      success: true,
      data: updatedService
    }
  } catch (error) {
    console.error('Error updating service:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to update service'
    })
  }
})

