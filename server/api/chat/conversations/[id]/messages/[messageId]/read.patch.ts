import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const conversationId = getRouterParam(event, 'id')
    const messageId = getRouterParam(event, 'messageId')
    const body = await readBody(event)

    if (!conversationId || !messageId) {
      throw createError({
        statusCode: 400,
        message: 'Conversation ID and Message ID are required'
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

    // Verify message exists and get it
    const message = await db.collection('messages').findOne({ id: messageId, conversationId })
    if (!message) {
      throw createError({
        statusCode: 404,
        message: 'Message not found'
      })
    }

    // If already read, no need to update
    if (message.isRead) {
      return {
        success: true,
        message: 'Message already marked as read'
      }
    }

    // Mark message as read
    const readAt = new Date().toISOString()
    await db.collection('messages').updateOne(
      { id: messageId },
      { $set: { isRead: true, readAt } }
    )

    // Update conversation unread counts
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    // Decrement appropriate unread count
    if (message.sender === 'customer') {
      // Admin is reading customer message
      updateData.unreadCount = Math.max(0, (conversation.unreadCount || 0) - 1)
    } else if (message.sender === 'admin') {
      // Customer is reading admin message
      updateData.customerUnreadCount = Math.max(0, (conversation.customerUnreadCount || 0) - 1)
    }

    await db.collection('conversations').updateOne(
      { id: conversationId },
      { $set: updateData }
    )

    return {
      success: true,
      message: 'Message marked as read'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error marking message as read:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to mark message as read'
    })
  }
})

