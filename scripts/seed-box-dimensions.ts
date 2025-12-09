import { connectToDatabase, closeDatabase } from '../server/utils/mongodb'
import { calculateBoxSurfaceArea, calculateWrappingPaperNeeded } from '../server/utils/wrapping-paper-calculator'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function seedBoxDimensions() {
  try {
    const { db } = await connectToDatabase()
    const sizesCollection = db.collection('sizes')
    const boxDimensionsCollection = db.collection('boxDimensions')
    
    // First, ensure sizes exist
    const existingSizes = await sizesCollection.countDocuments()
    if (existingSizes === 0) {
      console.log('📦 Seeding sizes...')
      const defaultSizes = [
        { id: 'size-xsmall', name: 'xsmall', displayName: 'Extra Small', order: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-small', name: 'small', displayName: 'Small', order: 2, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-medium', name: 'medium', displayName: 'Medium', order: 3, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-large', name: 'large', displayName: 'Large', order: 4, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-xl', name: 'xl', displayName: 'Extra Large', order: 5, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
      await sizesCollection.insertMany(defaultSizes)
      console.log('✅ Seeded sizes')
    }
    
    // Get size IDs
    const sizes = await sizesCollection.find({ active: true }).toArray()
    const sizeMap = new Map(sizes.map(s => [s.name, s.id]))
    console.log('📋 Size map:', Array.from(sizeMap.entries()))
    
    // Check if boxDimensions already exist
    const existingBoxDimensions = await boxDimensionsCollection.countDocuments()
    if (existingBoxDimensions > 0) {
      console.log(`⚠️ BoxDimensions already exist (${existingBoxDimensions} documents). Skipping seeding.`)
      return
    }
    
    // Default box dimensions for each size
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
      if (!dim.sizeId) {
        console.error(`❌ Missing sizeId for dimension ${dim.id}`)
        continue
      }
      dim.surfaceArea = calculateBoxSurfaceArea(dim.length, dim.width, dim.height)
      dim.wrappingPaperNeeded = calculateWrappingPaperNeeded(
        dim.length,
        dim.width,
        dim.height,
        dim.wasteFactor
      )
    }
    
    // Filter out any dimensions with missing sizeId
    const validDimensions = defaultBoxDimensions.filter(dim => dim.sizeId)
    
    if (validDimensions.length > 0) {
      await boxDimensionsCollection.insertMany(validDimensions)
      console.log(`✅ Seeded ${validDimensions.length} box dimensions`)
    } else {
      console.error('❌ No valid box dimensions to seed')
    }
    
  } catch (error: any) {
    console.error('❌ Error seeding box dimensions:', error)
    throw error
  }
}

seedBoxDimensions()
  .then(async () => {
    console.log('✅ Seeding complete')
    await closeDatabase()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('❌ Seeding failed:', error)
    await closeDatabase()
    process.exit(1)
  })

