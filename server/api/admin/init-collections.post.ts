import { initializeCollections, getCollectionStats } from '~/server/utils/init-collections'

/**
 * Initialize MongoDB collections with indexes
 * POST /api/admin/init-collections
 * 
 * This endpoint should be called once to set up the database structure.
 * It's safe to call multiple times - indexes will be created if they don't exist.
 */
export default defineEventHandler(async (event) => {
  try {
    // Optional: Add authentication check here
    // const { checkAuth } = useAuth()
    // if (!checkAuth()) {
    //   throw createError({
    //     statusCode: 401,
    //     message: 'Unauthorized'
    //   })
    // }

    const result = await initializeCollections()
    
    if (result.success) {
      return {
        success: true,
        message: 'Collections initialized successfully',
        collections: result.collections
      }
    } else {
      throw createError({
        statusCode: 500,
        message: result.error || 'Failed to initialize collections'
      })
    }
  } catch (error: any) {
    console.error('Error initializing collections:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to initialize collections'
    })
  }
})

