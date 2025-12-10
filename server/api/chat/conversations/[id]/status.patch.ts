import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const conversationId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!conversationId) {
      throw createError({
        statusCode: 400,
        message: 'Conversation ID is required'
      })
    }

    if (!body.status || !['active', 'closed'].includes(body.status)) {
      throw createError({
        statusCode: 400,
        message: 'Status must be "active" or "closed"'
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

    // Update conversation status
    await db.collection('conversations').updateOne(
      { id: conversationId },
      {
        $set: {
          status: body.status,
          updatedAt: new Date().toISOString()
        }
      }
    )

    // Get updated conversation
    const updatedConversation = await db.collection('conversations').findOne({ id: conversationId })
    const { _id, ...responseData } = updatedConversation

    return {
      success: true,
      conversation: responseData
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error updating conversation status:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update conversation status'
    })
  }
})

