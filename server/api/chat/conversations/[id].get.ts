import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Conversation ID is required'
      })
    }

    const db = await getDatabase()
    const conversation = await db.collection('conversations').findOne({ id })

    if (!conversation) {
      throw createError({
        statusCode: 404,
        message: 'Conversation not found'
      })
    }

    // Remove MongoDB _id from response
    const { _id, ...responseData } = conversation

    return {
      success: true,
      conversation: responseData
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching conversation:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch conversation'
    })
  }
})

