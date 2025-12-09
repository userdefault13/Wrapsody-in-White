import { getDatabase } from '~/server/utils/mongodb'
import { calculateBoxSurfaceArea, calculateWrappingPaperNeeded } from '~/server/utils/wrapping-paper-calculator'

/**
 * Seed box dimensions collection
 * POST /api/admin/seed-box-dimensions
 * 
 * This endpoint seeds the boxDimensions collection with default dimensions.
 */
export default defineEventHandler(async (event) => {
  try {
    const db = await getDatabase()
    const boxDimensionsCollection = db.collection('boxDimensions')
    const sizesCollection = db.collection('sizes')
    
    // Check if already seeded
    const existingCount = await boxDimensionsCollection.countDocuments()
    if (existingCount > 0) {
      return {
        success: true,
        message: `Box dimensions already exist (${existingCount} documents). Skipping seed.`,
        count: existingCount
      }
    }
    
    // Get size IDs
    const sizes = await sizesCollection.find({ active: true }).toArray()
    if (sizes.length === 0) {
      // Seed sizes first if they don't exist
      const defaultSizes = [
        { id: 'size-xsmall', name: 'xsmall', displayName: 'Extra Small', order: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-small', name: 'small', displayName: 'Small', order: 2, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-medium', name: 'medium', displayName: 'Medium', order: 3, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-large', name: 'large', displayName: 'Large', order: 4, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-xl', name: 'xl', displayName: 'Extra Large', order: 5, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
      await sizesCollection.insertMany(defaultSizes)
      console.log('✅ Seeded default sizes')
      // Re-fetch sizes
      const newSizes = await sizesCollection.find({ active: true }).toArray()
      sizes.push(...newSizes)
    }
    
    const sizeMap = new Map(sizes.map(s => [s.name, s.id]))
    
    // Default box dimensions for each size (multiple options per size)
    const defaultBoxDimensions = [
      // XSmall boxes
      {
        id: 'boxdim-xsmall-1',
        sizeId: sizeMap.get('xsmall'),
        length: 3,
        width: 3,
        height: 3,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-xsmall-2',
        sizeId: sizeMap.get('xsmall'),
        length: 4,
        width: 3,
        height: 2,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-xsmall-3',
        sizeId: sizeMap.get('xsmall'),
        length: 3.5,
        width: 3.5,
        height: 3.5,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // Small boxes
      {
        id: 'boxdim-small-1',
        sizeId: sizeMap.get('small'),
        length: 4,
        width: 4,
        height: 4,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-small-2',
        sizeId: sizeMap.get('small'),
        length: 5,
        width: 4,
        height: 3,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-small-3',
        sizeId: sizeMap.get('small'),
        length: 6,
        width: 4,
        height: 2,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // Medium boxes
      {
        id: 'boxdim-medium-1',
        sizeId: sizeMap.get('medium'),
        length: 6,
        width: 6,
        height: 6,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-medium-2',
        sizeId: sizeMap.get('medium'),
        length: 8,
        width: 6,
        height: 4,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-medium-3',
        sizeId: sizeMap.get('medium'),
        length: 10,
        width: 6,
        height: 3,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // Large boxes
      {
        id: 'boxdim-large-1',
        sizeId: sizeMap.get('large'),
        length: 8,
        width: 8,
        height: 8,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-large-2',
        sizeId: sizeMap.get('large'),
        length: 10,
        width: 8,
        height: 6,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-large-3',
        sizeId: sizeMap.get('large'),
        length: 12,
        width: 8,
        height: 4,
        wasteFactor: 0.15,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // XL boxes
      {
        id: 'boxdim-xl-1',
        sizeId: sizeMap.get('xl'),
        length: 12,
        width: 12,
        height: 12,
        wasteFactor: 0.20,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-xl-2',
        sizeId: sizeMap.get('xl'),
        length: 16,
        width: 12,
        height: 8,
        wasteFactor: 0.20,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'boxdim-xl-3',
        sizeId: sizeMap.get('xl'),
        length: 18,
        width: 12,
        height: 6,
        wasteFactor: 0.20,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Calculate surface area and wrapping paper needed for each dimension
    for (const dim of defaultBoxDimensions) {
      dim.surfaceArea = calculateBoxSurfaceArea(dim.length, dim.width, dim.height)
      dim.wrappingPaperNeeded = calculateWrappingPaperNeeded(
        dim.length,
        dim.width,
        dim.height,
        dim.wasteFactor
      )
    }
    
    await boxDimensionsCollection.insertMany(defaultBoxDimensions)
    console.log('✅ Seeded default box dimensions')
    
    return {
      success: true,
      message: `Successfully seeded ${defaultBoxDimensions.length} box dimensions`,
      count: defaultBoxDimensions.length
    }
  } catch (error: any) {
    console.error('Error seeding box dimensions:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to seed box dimensions'
    })
  }
})

