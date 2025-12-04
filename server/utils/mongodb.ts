import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase() {
  if (db) {
    return { client, db }
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB_NAME || 'wrapsody-in-white'

  try {
    client = new MongoClient(uri)
    await client.connect()
    
    // Extract database name from URI if present
    // Format: mongodb+srv://user:pass@host/dbname?options
    let finalDbName = dbName
    try {
      const uriMatch = uri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/)
      if (uriMatch && uriMatch[1]) {
        finalDbName = uriMatch[1]
      } else {
        // Try parsing as regular mongodb:// URI
        const parts = uri.split('/')
        if (parts.length > 3) {
          const dbPart = parts[parts.length - 1].split('?')[0]
          if (dbPart && !dbPart.includes('@')) {
            finalDbName = dbPart
          }
        }
      }
    } catch (e) {
      // If extraction fails, use default
      finalDbName = dbName
    }
    
    db = client.db(finalDbName)
    
    console.log(`✅ Connected to MongoDB Atlas - Database: ${finalDbName}`)
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export async function getDatabase() {
  if (!db) {
    await connectToDatabase()
  }
  return db
}

export async function closeDatabase() {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('MongoDB connection closed')
  }
}

