import { getDatabase } from '~/server/utils/mongodb'

/**
 * Migration script to rename 'services' collection to 'pricing'
 * Run this once to migrate existing data
 */
export default defineEventHandler(async () => {
  try {
    const db = await getDatabase()
    
    // Check if services collection exists
    const collections = await db.listCollections().toArray()
    const servicesExists = collections.some(c => c.name === 'services')
    const pricingExists = collections.some(c => c.name === 'pricing')
    
    if (!servicesExists) {
      return {
        success: true,
        message: 'No services collection found. Nothing to migrate.',
        migrated: 0
      }
    }
    
    if (pricingExists) {
      return {
        success: false,
        message: 'Pricing collection already exists. Please remove it first if you want to migrate.',
        migrated: 0
      }
    }
    
    // Get all documents from services collection
    const services = await db.collection('services').find({}).toArray()
    
    if (services.length === 0) {
      return {
        success: true,
        message: 'Services collection is empty. Nothing to migrate.',
        migrated: 0
      }
    }
    
    // Insert all documents into pricing collection
    if (services.length > 0) {
      await db.collection('pricing').insertMany(services)
    }
    
    // Optionally, you can drop the old services collection
    // Uncomment the line below if you want to remove the old collection
    // await db.collection('services').drop()
    
    return {
      success: true,
      message: `Successfully migrated ${services.length} documents from 'services' to 'pricing' collection`,
      migrated: services.length,
      note: 'Old services collection still exists. You can drop it manually if needed.'
    }
  } catch (error: any) {
    console.error('Error migrating services to pricing:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to migrate: ${error.message}`
    })
  }
})

