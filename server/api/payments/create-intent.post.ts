import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    if (!config.stripeSecretKey) {
      throw createError({
        statusCode: 500,
        message: 'Stripe secret key not configured. Please add STRIPE_SECRET_KEY to your .env file.'
      })
    }

    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    const body = await readBody(event)
    
    if (!body.amount || !body.currency) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: amount and currency are required'
      })
    }
    
    // bookingId is optional - booking may be created after payment
    const bookingId = body.bookingId || 'pending'

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount, // Amount in cents
      currency: body.currency.toLowerCase(),
      metadata: {
        bookingId: bookingId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create payment intent'
    })
  }
})

