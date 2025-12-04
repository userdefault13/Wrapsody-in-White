import { getCollectionStats } from '~/server/utils/init-collections'

/**
 * Get MongoDB collection statistics
 * GET /api/admin/collection-stats
 * 
 * Returns document counts and index information for all collections
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

    const result = await getCollectionStats()
    
    if (result.success) {
      return {
        success: true,
        stats: result.stats
      }
    } else {
      throw createError({
        statusCode: 500,
        message: result.error || 'Failed to get collection stats'
      })
    }
  } catch (error: any) {
    console.error('Error getting collection stats:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get collection stats'
    })
  }
})

