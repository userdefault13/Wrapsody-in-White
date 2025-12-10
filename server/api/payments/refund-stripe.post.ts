import { getDatabase } from '~/server/utils/mongodb'
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()
    const db = await getDatabase()
    
    // Validate required fields
    if (!body.bookingId || !body.transactionId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields (bookingId, transactionId)'
      })
    }

    // Get transaction from database
    const transaction = await db.collection('transactions').findOne({
      id: body.transactionId,
      bookingId: body.bookingId
    })

    if (!transaction) {
      throw createError({
        statusCode: 404,
        message: 'Transaction not found'
      })
    }

    if (transaction.status !== 'completed') {
      throw createError({
        statusCode: 400,
        message: 'Can only refund completed transactions'
      })
    }

    if (transaction.paymentMethod !== 'card') {
      throw createError({
        statusCode: 400,
        message: 'This endpoint is for Stripe refunds only'
      })
    }

    if (!transaction.paymentIntentId) {
      throw createError({
        statusCode: 400,
        message: 'Payment intent ID not found'
      })
    }

    // Initialize Stripe
    if (!config.stripeSecretKey) {
      throw createError({
        statusCode: 500,
        message: 'Stripe secret key not configured'
      })
    }

    // Clean the Stripe key - aggressively remove any invalid characters
    let cleanedStripeKey = String(config.stripeSecretKey)
      .trim()
      .replace(/[\r\n\t]/g, '') // Remove newlines, carriage returns, tabs
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/[^\x20-\x7E]/g, '') // Remove any non-printable ASCII characters
    
    if (!cleanedStripeKey || !cleanedStripeKey.startsWith('sk_')) {
      throw createError({
        statusCode: 500,
        message: 'Invalid Stripe secret key format'
      })
    }

    const stripe = new Stripe(cleanedStripeKey, {
      // Use default API version for better compatibility
    })

    // Create refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.paymentIntentId,
      amount: transaction.amount, // Amount in cents
      reason: 'requested_by_customer',
      metadata: {
        bookingId: body.bookingId,
        originalTransactionId: transaction.id
      }
    })

    // Update transaction status to refunded
    await db.collection('transactions').updateOne(
      { id: transaction.id },
      {
        $set: {
          status: 'refunded',
          refundId: refund.id,
          refundedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    )

    return {
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert cents to dollars
        status: refund.status,
        transactionId: transaction.id
      }
    }
  } catch (error) {
    console.error('Error processing Stripe refund:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to process refund'
    })
  }
})


