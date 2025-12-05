import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    // Validate required fields
    if (!body.bookingId || !body.amount || !body.currency || !body.paymentMethod) {
      throw createError({
        statusCode: 400,
        message: 'Missing required payment fields'
      })
    }

    // Create transaction record
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookingId: body.bookingId,
      amount: body.amount, // Amount in cents
      currency: body.currency || 'USD',
      status: body.status || 'pending',
      paymentMethod: body.paymentMethod,
      paymentIntentId: body.paymentIntentId || null,
      metadata: {
        ...body.metadata,
        cardDetails: body.cardDetails || null,
        createdAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Insert transaction
    const result = await db.collection('transactions').insertOne(transaction)

    // Update booking status if payment is completed
    if (transaction.status === 'completed' || transaction.status === 'pending') {
      await db.collection('bookings').updateOne(
        { id: body.bookingId },
        { 
          $set: { 
            status: transaction.status === 'completed' ? 'confirmed' : 'pending',
            updatedAt: new Date().toISOString()
          }
        }
      )
    }

    return {
      success: true,
      data: { ...transaction, _id: result.insertedId }
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to process payment'
    })
  }
})

