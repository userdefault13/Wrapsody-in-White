import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    // Validate required fields
    if (!body.name || body.price === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: name, price'
      })
    }
    
    // Get current max order to place new service at the end
    const maxOrderService = await db.collection('services')
      .findOne({}, { sort: { order: -1 } })
    const newOrder = maxOrderService ? maxOrderService.order + 1 : 0
    
    // Generate unique ID
    const serviceId = body.id || `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const service = {
      id: serviceId,
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      priceType: body.priceType || 'per-item', // 'per-item', 'per-hour', 'fixed'
      features: body.features || [],
      group: body.group || 'default',
      active: body.active !== false,
      order: body.order !== undefined ? parseInt(body.order) : newOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Insert service
    const result = await db.collection('services').insertOne(service)
    
    return {
      success: true,
      data: { ...service, _id: result.insertedId }
    }
  } catch (error) {
    console.error('Error creating service:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to create service'
    })
  }
})

