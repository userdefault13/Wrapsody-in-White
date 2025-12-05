import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async () => {
  try {
    const db = await getDatabase()
    
    // Check if services collection exists
    const collections = await db.listCollections().toArray()
    const servicesCollectionExists = collections.some(c => c.name === 'services')
    
    // Count documents
    const count = servicesCollectionExists 
      ? await db.collection('services').countDocuments()
      : 0
    
    // Get all services
    const services = servicesCollectionExists
      ? await db.collection('services').find({}).toArray()
      : []
    
    // Get indexes
    const indexes = servicesCollectionExists
      ? await db.collection('services').indexes()
      : []
    
    return {
      success: true,
      collectionExists: servicesCollectionExists,
      documentCount: count,
      services,
      indexes,
      allCollections: collections.map(c => c.name)
    }
  } catch (error: any) {
    console.error('Error checking services:', error)
    return {
      success: false,
      error: error.message,
      collectionExists: false,
      documentCount: 0,
      services: [],
      indexes: []
    }
  }
})

