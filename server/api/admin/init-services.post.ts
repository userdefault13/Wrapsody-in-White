import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    
    // Check if services already exist
    const existingServices = await db.collection('services').countDocuments()
    
    if (existingServices > 0) {
      return {
        success: true,
        message: 'Services already initialized',
        count: existingServices
      }
    }
    
    // Default services
    const defaultServices = [
      {
        id: 'basic',
        name: 'Basic',
        description: 'Small gifts (books, small boxes)',
        price: 8,
        priceType: 'per-item',
        features: ['Professional wrapping', 'basic ribbon'],
        group: 'pricing',
        active: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Medium gifts (standard boxes)',
        price: 12,
        priceType: 'per-item',
        features: ['Premium paper', 'decorative bows', 'custom tags'],
        group: 'pricing',
        active: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'unlimited',
        name: 'Unlimited',
        description: 'Home visit service',
        price: 50,
        priceType: 'per-hour',
        features: ['Wrap all your gifts', 'multiple styles', '1-hour minimum'],
        group: 'pricing',
        active: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Insert default services
    const result = await db.collection('services').insertMany(defaultServices)
    
    return {
      success: true,
      message: 'Default services initialized',
      count: result.insertedCount
    }
  } catch (error) {
    console.error('Error initializing services:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to initialize services'
    })
  }
})

