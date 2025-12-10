import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const conversationId = getRouterParam(event, 'id')
    if (!conversationId) {
      throw createError({
        statusCode: 400,
        message: 'Conversation ID is required'
      })
    }

    const db = await getDatabase()
    
    // Verify conversation exists
    const conversation = await db.collection('conversations').findOne({ id: conversationId })
    if (!conversation) {
      throw createError({
        statusCode: 404,
        message: 'Conversation not found'
      })
    }

    // Get messages ordered by creation time
    const messages = await db.collection('messages')
      .find({ conversationId })
      .sort({ createdAt: 1 }) // Oldest first
      .toArray()

    // Remove MongoDB _id from response
    const responseMessages = messages.map(({ _id, ...msg }) => msg)

    return {
      success: true,
      messages: responseMessages
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching messages:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch messages'
    })
  }
})

