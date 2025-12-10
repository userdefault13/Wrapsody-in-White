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

    const db = await getDatabase()
    
    // Verify conversation exists
    const conversation = await db.collection('conversations').findOne({ id: conversationId })
    if (!conversation) {
      throw createError({
        statusCode: 404,
        message: 'Conversation not found'
      })
    }

    const readBy = body.readBy // 'customer' or 'admin'

    if (!readBy || !['customer', 'admin'].includes(readBy)) {
      throw createError({
        statusCode: 400,
        message: 'readBy must be "customer" or "admin"'
      })
    }

    // Mark all unread messages from the other party as read
    const senderToMark = readBy === 'customer' ? 'admin' : 'customer'
    
    const result = await db.collection('messages').updateMany(
      {
        conversationId,
        sender: senderToMark,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date().toISOString()
        }
      }
    )

    // Update conversation unread counts
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (readBy === 'customer') {
      // Customer read admin messages
      updateData.customerUnreadCount = 0
    } else {
      // Admin read customer messages
      updateData.unreadCount = 0
    }

    await db.collection('conversations').updateOne(
      { id: conversationId },
      { $set: updateData }
    )

    return {
      success: true,
      messagesMarkedAsRead: result.modifiedCount
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error marking conversation as read:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to mark conversation as read'
    })
  }
})

