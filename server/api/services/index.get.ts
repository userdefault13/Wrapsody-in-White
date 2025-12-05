import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    const query = getQuery(event)
    
    // Get only active services by default, unless specified
    const activeOnly = query.active !== 'false'
    const group = query.group as string | undefined
    
    const filter: any = {}
    if (activeOnly) {
      filter.active = true
    }
    if (group) {
      filter.group = group
    }
    
    // Get services sorted by order
    const services = await db.collection('services')
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray()
    
    return {
      success: true,
      data: services
    }
  } catch (error) {
    console.error('Error fetching services:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch services'
    })
  }
})

