import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const db = await getDatabase()

    // Build filter
    const filter: any = {}
    if (query.status) {
      filter.status = query.status
    }
    if (query.email) {
      filter.email = query.email
    }
    if (query.assignedTo) {
      filter.assignedTo = query.assignedTo
    }

    // Get conversations sorted by last message time
    const conversations = await db.collection('conversations')
      .find(filter)
      .sort({ lastMessageAt: -1 })
      .limit(query.limit ? parseInt(query.limit as string) : 100)
      .toArray()

    // Remove MongoDB _id from response
    const responseConversations = conversations.map(({ _id, ...conv }) => conv)

    return {
      success: true,
      conversations: responseConversations,
      count: responseConversations.length
    }
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch conversations'
    })
  }
})

