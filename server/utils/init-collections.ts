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
    await availabilityCollection.createIndex({ type: 1 }, { unique: true, partialFilterExpression: { type: 'schedule' } })
    // Worker schedules (type: 'worker_schedule') can have multiple
    await availabilityCollection.createIndex({ type: 1, workerId: 1 })
    await availabilityCollection.createIndex({ id: 1 }, { unique: true, sparse: true })
    await availabilityCollection.createIndex({ workerId: 1 })
    await availabilityCollection.createIndex({ updatedAt: -1 })
    
    // Create index on nested availability.date field
    await availabilityCollection.createIndex({ 'availability.date': 1 })
    
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
    const collections = ['bookings', 'availability', 'transactions', 'users', 'pricing', 'services', 'inventory', 'workers', 'sizes', 'workOrders', 'workItems']
    
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

