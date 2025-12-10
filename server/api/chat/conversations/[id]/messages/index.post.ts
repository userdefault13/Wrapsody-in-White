import { getDatabase } from '~/server/utils/mongodb'
import { sendChatNotificationEmail } from '~/server/utils/email'

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

    if (!body.content || !body.sender) {
      throw createError({
        statusCode: 400,
        message: 'Content and sender are required'
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

    // Create message
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      sender: body.sender, // 'customer' or 'admin'
      senderEmail: body.senderEmail || conversation.email || undefined,
      senderName: body.senderName || conversation.name || undefined,
      content: body.content,
      attachments: body.attachments || [],
      isRead: false,
      readAt: undefined,
      metadata: body.metadata || {},
      createdAt: new Date().toISOString()
    }

    const result = await db.collection('messages').insertOne(message)
    const createdMessage = { ...message, _id: result.insertedId }

    // Update conversation
    const updateData: any = {
      lastMessageAt: message.createdAt,
      lastMessagePreview: message.content.substring(0, 100),
      updatedAt: new Date().toISOString()
    }

    // Update unread counts
    if (body.sender === 'customer') {
      updateData.unreadCount = (conversation.unreadCount || 0) + 1
    } else if (body.sender === 'admin') {
      updateData.customerUnreadCount = (conversation.customerUnreadCount || 0) + 1
    }

    await db.collection('conversations').updateOne(
      { id: conversationId },
      { $set: updateData }
    )

    // Send email notification if customer sent a message and email is available
    if (body.sender === 'customer' && conversation.email) {
      sendChatNotificationEmail({
        conversationId,
        customerEmail: conversation.email,
        customerName: conversation.name,
        messagePreview: message.content.substring(0, 150)
      }).catch((error) => {
        console.error('Failed to send chat notification email:', error)
        // Don't throw - email failure shouldn't fail message creation
      })
    }

    // Remove MongoDB _id from response
    const { _id, ...responseData } = createdMessage

    return {
      success: true,
      message: responseData
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error sending message:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send message'
    })
  }
})

