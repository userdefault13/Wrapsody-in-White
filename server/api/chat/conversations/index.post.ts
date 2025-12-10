import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    const conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: body.email || undefined,
      name: body.name || undefined,
      status: 'active',
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: '',
      unreadCount: 0,
      customerUnreadCount: 0,
      assignedTo: undefined,
      metadata: body.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('conversations').insertOne(conversation)
    const createdConversation = { ...conversation, _id: result.insertedId }

    // Remove MongoDB _id from response (keep custom id)
    const { _id, ...responseData } = createdConversation

    return {
      success: true,
      conversation: responseData
    }
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create conversation'
    })
  }
})

