import { getDatabase } from './mongodb'

/**
 * Initialize MongoDB collections with indexes and validation
 * This should be run once to set up the database structure
 */
export async function initializeCollections() {
  const db = await getDatabase()
  const results: Record<string, any> = {}

  try {
    // ============================================
    // BOOKINGS COLLECTION
    // ============================================
    const bookingsCollection = db.collection('bookings')
    
    // Create indexes for bookings
    await bookingsCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await bookingsCollection.createIndex({ email: 1 })
    await bookingsCollection.createIndex({ date: 1 })
    await bookingsCollection.createIndex({ status: 1 })
    await bookingsCollection.createIndex({ createdAt: -1 })
    await bookingsCollection.createIndex({ date: 1, time: 1 }) // Compound index for date/time queries
    await bookingsCollection.createIndex({ date: 1, status: 1 }) // Compound index for filtering by date and status
    
    results.bookings = {
      indexes: [
        'id (unique)',
        'email',
        'date',
        'status',
        'createdAt (descending)',
        'date + time (compound)',
        'date + status (compound)'
      ]
    }

    // ============================================
    // AVAILABILITY COLLECTION
    // ============================================
    const availabilityCollection = db.collection('availability')
    
    // Create indexes for availability
    // Global schedule (type: 'schedule') should be unique
    try {
      // Try to drop existing index if it conflicts
      try {
        await availabilityCollection.dropIndex('type_1')
      } catch (e: any) {
        // Index doesn't exist or can't be dropped, continue
      }
      await availabilityCollection.createIndex({ type: 1 }, { unique: true, partialFilterExpression: { type: 'schedule' } })
    } catch (e: any) {
      console.warn('⚠️ Could not create availability type index:', e.message)
    }
    // Worker schedules (type: 'worker_schedule') can have multiple
    try {
      await availabilityCollection.createIndex({ type: 1, workerId: 1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create availability type+workerId index:', e.message)
    }
    try {
      await availabilityCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    } catch (e: any) {
      console.warn('⚠️ Could not create availability id index:', e.message)
    }
    try {
      await availabilityCollection.createIndex({ workerId: 1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create availability workerId index:', e.message)
    }
    try {
      await availabilityCollection.createIndex({ updatedAt: -1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create availability updatedAt index:', e.message)
    }
    
    // Create index on nested availability.date field
    try {
      await availabilityCollection.createIndex({ 'availability.date': 1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create availability.date index:', e.message)
    }
    
    results.availability = {
      indexes: [
        'type (unique for schedule)',
        'type + workerId (compound)',
        'id (unique, sparse)',
        'workerId',
        'updatedAt (descending)',
        'availability.date'
      ]
    }

    // ============================================
    // TRANSACTIONS COLLECTION (for future payments)
    // ============================================
    const transactionsCollection = db.collection('transactions')
    
    // Create indexes for transactions
    await transactionsCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await transactionsCollection.createIndex({ bookingId: 1 })
    await transactionsCollection.createIndex({ status: 1 })
    await transactionsCollection.createIndex({ createdAt: -1 })
    await transactionsCollection.createIndex({ paymentMethod: 1 })
    await transactionsCollection.createIndex({ amount: 1 })
    await transactionsCollection.createIndex({ bookingId: 1, status: 1 }) // Compound index
    
    results.transactions = {
      indexes: [
        'id (unique)',
        'bookingId',
        'status',
        'createdAt (descending)',
        'paymentMethod',
        'amount',
        'bookingId + status (compound)'
      ]
    }

    // ============================================
    // USERS COLLECTION (for future admin/user management)
    // ============================================
    const usersCollection = db.collection('users')
    
    // Create indexes for users
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true })
    await usersCollection.createIndex({ walletAddress: 1 }, { unique: true, sparse: true })
    await usersCollection.createIndex({ role: 1 })
    await usersCollection.createIndex({ createdAt: -1 })
    
    results.users = {
      indexes: [
        'email (unique)',
        'walletAddress (unique)',
        'role',
        'createdAt (descending)'
      ]
    }

    // ============================================
    // PRICING COLLECTION (pricing tiers)
    // ============================================
    const pricingCollection = db.collection('pricing')
    
    // Create indexes for pricing
    await pricingCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await pricingCollection.createIndex({ order: 1 }) // For ordering pricing tiers
    await pricingCollection.createIndex({ active: 1 })
    await pricingCollection.createIndex({ group: 1 })
    await pricingCollection.createIndex({ serviceCategory: 1 }) // For linking to service types
    await pricingCollection.createIndex({ createdAt: -1 })
    
    results.pricing = {
      indexes: [
        'id (unique)',
        'order',
        'active',
        'group',
        'serviceCategory',
        'createdAt (descending)'
      ]
    }

    // ============================================
    // SERVICES COLLECTION (service types)
    // ============================================
    const servicesCollection = db.collection('services')
    
    // Create indexes for services
    await servicesCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await servicesCollection.createIndex({ order: 1 }) // For ordering services
    await servicesCollection.createIndex({ active: 1 })
    await servicesCollection.createIndex({ category: 1 })
    await servicesCollection.createIndex({ createdAt: -1 })
    
    results.services = {
      indexes: [
        'id (unique)',
        'order',
        'active',
        'category',
        'createdAt (descending)'
      ]
    }

    // ============================================
    // INVENTORY COLLECTION (wrapping supplies)
    // ============================================
    const inventoryCollection = db.collection('inventory')
    
    // Create indexes for inventory
    await inventoryCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await inventoryCollection.createIndex({ type: 1 }) // wrapping_paper, bow, ribbon, box
    await inventoryCollection.createIndex({ name: 1 })
    await inventoryCollection.createIndex({ size: 1 })
    await inventoryCollection.createIndex({ quantity: 1 })
    await inventoryCollection.createIndex({ createdAt: -1 })
    await inventoryCollection.createIndex({ type: 1, size: 1 }) // Compound index for filtering by type and size
    
    results.inventory = {
      indexes: [
        'id (unique)',
        'type',
        'name',
        'size',
        'quantity',
        'createdAt (descending)',
        'type + size (compound)'
      ]
    }

    // ============================================
    // WORKERS COLLECTION (staff members)
    // ============================================
    const workersCollection = db.collection('workers')
    
    // Create indexes for workers
    await workersCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await workersCollection.createIndex({ walletAddress: 1 }, { unique: true })
    await workersCollection.createIndex({ workerType: 1 })
    await workersCollection.createIndex({ createdAt: -1 })
    await workersCollection.createIndex({ availabilityId: 1 })
    
    results.workers = {
      indexes: [
        'id (unique)',
        'walletAddress (unique)',
        'workerType',
        'createdAt (descending)',
        'availabilityId'
      ]
    }

    // ============================================
    // UPDATE USERS COLLECTION (add userId index for transactions)
    // ============================================
    await usersCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    
    // Update transactions collection to add userId index
    await transactionsCollection.createIndex({ userId: 1 })

    // ============================================
    // SIZES COLLECTION
    // ============================================
    const sizesCollection = db.collection('sizes')
    
    // Create indexes for sizes
    await sizesCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await sizesCollection.createIndex({ name: 1 }, { unique: true })
    await sizesCollection.createIndex({ order: 1 })
    await sizesCollection.createIndex({ active: 1 })
    await sizesCollection.createIndex({ createdAt: -1 })
    
    // Seed default sizes if collection is empty
    const existingSizes = await sizesCollection.countDocuments()
    if (existingSizes === 0) {
      const defaultSizes = [
        { id: 'size-xsmall', name: 'xsmall', displayName: 'Extra Small', order: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-small', name: 'small', displayName: 'Small', order: 2, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-medium', name: 'medium', displayName: 'Medium', order: 3, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-large', name: 'large', displayName: 'Large', order: 4, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'size-xl', name: 'xl', displayName: 'Extra Large', order: 5, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
      await sizesCollection.insertMany(defaultSizes)
      console.log('✅ Seeded default sizes')
    }
    
    results.sizes = {
      indexes: [
        'id (unique)',
        'name (unique)',
        'order',
        'active',
        'createdAt (descending)'
      ]
    }

    // ============================================
    // BOX DIMENSIONS COLLECTION
    // ============================================
    const boxDimensionsCollection = db.collection('boxDimensions')
    
    // Create indexes for box dimensions (with error handling)
    try {
      await boxDimensionsCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    } catch (e: any) {
      console.warn('⚠️ Could not create boxDimensions id index:', e.message)
    }
    try {
      await boxDimensionsCollection.createIndex({ sizeId: 1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create boxDimensions sizeId index:', e.message)
    }
    try {
      await boxDimensionsCollection.createIndex({ active: 1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create boxDimensions active index:', e.message)
    }
    try {
      await boxDimensionsCollection.createIndex({ wrappingPaperNeeded: 1 })
    } catch (e: any) {
      console.warn('⚠️ Could not create boxDimensions wrappingPaperNeeded index:', e.message)
    }
    
    // Seed default box dimensions if collection is empty
    const existingBoxDimensions = await boxDimensionsCollection.countDocuments()
    if (existingBoxDimensions === 0) {
      // Import calculation functions
      const { calculateBoxSurfaceArea, calculateWrappingPaperNeeded } = await import('./wrapping-paper-calculator')
      
      // Ensure sizes exist first - if sizes collection is empty, seed them
      const existingSizes = await sizesCollection.countDocuments()
      if (existingSizes === 0) {
        const defaultSizes = [
          { id: 'size-xsmall', name: 'xsmall', displayName: 'Extra Small', order: 1, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'size-small', name: 'small', displayName: 'Small', order: 2, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'size-medium', name: 'medium', displayName: 'Medium', order: 3, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'size-large', name: 'large', displayName: 'Large', order: 4, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'size-xl', name: 'xl', displayName: 'Extra Large', order: 5, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
        await sizesCollection.insertMany(defaultSizes)
        console.log('✅ Seeded default sizes for boxDimensions')
      }
      
      // Get size IDs (now they should exist)
      const sizes = await sizesCollection.find({ active: true }).toArray()
      if (sizes.length === 0) {
        console.warn('⚠️ No sizes found - cannot seed boxDimensions')
        results.boxDimensions = {
          indexes: [
            'id (unique)',
            'sizeId',
            'active',
            'wrappingPaperNeeded'
          ],
          error: 'No sizes available for seeding'
        }
      } else {
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
        console.log(`✅ Seeded ${defaultBoxDimensions.length} default box dimensions`)
      }
    }
    
    results.boxDimensions = {
      indexes: [
        'id (unique)',
        'sizeId',
        'active',
        'wrappingPaperNeeded'
      ]
    }

    // ============================================
    // WORK ORDERS COLLECTION
    // ============================================
    const workOrdersCollection = db.collection('workOrders')
    
    // Create indexes for work orders
    await workOrdersCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await workOrdersCollection.createIndex({ bookingId: 1 })
    await workOrdersCollection.createIndex({ status: 1 })
    await workOrdersCollection.createIndex({ assignedWorker: 1 })
    await workOrdersCollection.createIndex({ workOrderNumber: 1 })
    await workOrdersCollection.createIndex({ priority: 1 })
    await workOrdersCollection.createIndex({ createdAt: -1 })
    await workOrdersCollection.createIndex({ bookingId: 1, workOrderNumber: 1 }, { unique: true })
    await workOrdersCollection.createIndex({ status: 1, assignedWorker: 1 })
    
    results.workOrders = {
      indexes: [
        'id (unique)',
        'bookingId',
        'status',
        'assignedWorker',
        'workOrderNumber',
        'priority',
        'createdAt (descending)',
        'bookingId + workOrderNumber (unique compound)',
        'status + assignedWorker (compound)'
      ]
    }

    // ============================================
    // WORK ITEMS COLLECTION
    // ============================================
    const workItemsCollection = db.collection('workItems')
    
    // Create indexes for work items
    await workItemsCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await workItemsCollection.createIndex({ workOrderId: 1 })
    await workItemsCollection.createIndex({ sizeId: 1 })
    await workItemsCollection.createIndex({ status: 1 })
    await workItemsCollection.createIndex({ assignedWorker: 1 })
    await workItemsCollection.createIndex({ createdAt: -1 })
    await workItemsCollection.createIndex({ workOrderId: 1, itemNumber: 1 }, { unique: true })
    
    results.workItems = {
      indexes: [
        'id (unique)',
        'workOrderId',
        'sizeId',
        'status',
        'assignedWorker',
        'createdAt (descending)',
        'workOrderId + itemNumber (unique compound)'
      ]
    }

    // Update bookings collection to add new fields
    await bookingsCollection.createIndex({ currentStage: 1 })
    await bookingsCollection.createIndex({ checkedInAt: -1 })

    // ============================================
    // CONVERSATIONS COLLECTION (chatbot conversations)
    // ============================================
    const conversationsCollection = db.collection('conversations')
    
    // Create indexes for conversations
    await conversationsCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await conversationsCollection.createIndex({ email: 1 }, { sparse: true }) // Sparse since email is optional
    await conversationsCollection.createIndex({ status: 1 })
    await conversationsCollection.createIndex({ assignedTo: 1 })
    await conversationsCollection.createIndex({ lastMessageAt: -1 })
    await conversationsCollection.createIndex({ createdAt: -1 })
    await conversationsCollection.createIndex({ status: 1, lastMessageAt: -1 }) // Compound index
    await conversationsCollection.createIndex({ unreadCount: 1 })
    
    results.conversations = {
      indexes: [
        'id (unique)',
        'email (sparse)',
        'status',
        'assignedTo',
        'lastMessageAt (descending)',
        'createdAt (descending)',
        'status + lastMessageAt (compound)',
        'unreadCount'
      ]
    }

    // ============================================
    // MESSAGES COLLECTION (chatbot messages)
    // ============================================
    const messagesCollection = db.collection('messages')
    
    // Create indexes for messages
    await messagesCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await messagesCollection.createIndex({ conversationId: 1 })
    await messagesCollection.createIndex({ conversationId: 1, createdAt: -1 }) // Compound index
    await messagesCollection.createIndex({ conversationId: 1, isRead: 1 }) // Compound index
    await messagesCollection.createIndex({ conversationId: 1, sender: 1 }) // Compound index
    await messagesCollection.createIndex({ sender: 1 })
    await messagesCollection.createIndex({ createdAt: -1 })
    await messagesCollection.createIndex({ isRead: 1 })
    
    results.messages = {
      indexes: [
        'id (unique)',
        'conversationId',
        'conversationId + createdAt (compound)',
        'conversationId + isRead (compound)',
        'conversationId + sender (compound)',
        'sender',
        'createdAt (descending)',
        'isRead'
      ]
    }

    console.log('✅ Collections initialized successfully!')
    return {
      success: true,
      collections: results,
      message: 'All collections and indexes created successfully'
    }
  } catch (error: any) {
    console.error('❌ Error initializing collections:', error)
    return {
      success: false,
      error: error.message,
      collections: results
    }
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats() {
  const db = await getDatabase()
  const stats: Record<string, any> = {}

  try {
    const collections = ['bookings', 'availability', 'transactions', 'users', 'pricing', 'services', 'inventory', 'workers', 'sizes', 'boxDimensions', 'workOrders', 'workItems']
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      const count = await collection.countDocuments()
      const indexes = await collection.indexes()
      
      stats[collectionName] = {
        documentCount: count,
        indexes: indexes.map((idx: any) => ({
          name: idx.name,
          keys: idx.key,
          unique: idx.unique || false
        }))
      }
    }

    return {
      success: true,
      stats
    }
  } catch (error: any) {
    console.error('Error getting collection stats:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

