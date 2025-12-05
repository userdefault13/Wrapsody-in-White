import { getDatabase } from '~/server/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = await getDatabase()
    
    // Validate required fields
    if (!body.bookingId || !body.amount || !body.currency || !body.walletAddress || !body.transactionHash) {
      throw createError({
        statusCode: 400,
        message: 'Missing required payment fields (bookingId, amount, currency, walletAddress, transactionHash)'
      })
    }

    // Create transaction record for crypto payment
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookingId: body.bookingId,
      amount: Math.round(body.amount * 100), // Amount in cents
      currency: 'USD',
      status: 'pending', // Will be confirmed when payment is verified
      paymentMethod: 'usdc', // USDC on Base chain
      paymentIntentId: null,
      metadata: {
        cryptoAmount: body.cryptoAmount,
        cryptoCurrency: 'USDC',
        chainId: 8453, // Base chain ID
        network: 'base',
        exchangeRate: body.exchangeRate,
        walletAddress: body.walletAddress,
        recipientAddress: body.recipientAddress || null,
        transactionHash: body.transactionHash,
        blockNumber: body.blockNumber || null,
        discount: body.discount || 0,
        originalAmount: body.originalAmount || body.amount,
        createdAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Insert transaction
    const result = await db.collection('transactions').insertOne(transaction)

    // Note: In production, you would:
    // 1. Generate a payment address for the customer
    // 2. Wait for blockchain confirmation
    // 3. Update transaction status to 'completed' via webhook or polling
    // 4. Update booking status to 'confirmed'

    // For now, we'll mark it as completed (in production, verify payment first)
    await db.collection('transactions').updateOne(
      { id: transaction.id },
      { $set: { status: 'completed', updatedAt: new Date().toISOString() } }
    )

    // Update booking status
    await db.collection('bookings').updateOne(
      { id: body.bookingId },
      { 
        $set: { 
          status: 'confirmed',
          updatedAt: new Date().toISOString()
        }
      }
    )

    return {
      success: true,
      data: { ...transaction, _id: result.insertedId, status: 'completed' }
    }
  } catch (error) {
    console.error('Error processing crypto payment:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to process crypto payment'
    })
  }
})

