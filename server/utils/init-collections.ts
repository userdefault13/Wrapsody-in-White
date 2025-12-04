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
    await availabilityCollection.createIndex({ type: 1 }, { unique: true })
    await availabilityCollection.createIndex({ updatedAt: -1 })
    
    // Create index on nested availability.date field
    await availabilityCollection.createIndex({ 'availability.date': 1 })
    
    results.availability = {
      indexes: [
        'type (unique)',
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
    const collections = ['bookings', 'availability', 'transactions', 'users']
    
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

