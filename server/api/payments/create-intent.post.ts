import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Debug logging (remove sensitive data in production)
    console.log('Stripe config check:', {
      hasStripeSecretKey: !!config.stripeSecretKey,
      keyPrefix: config.stripeSecretKey ? config.stripeSecretKey.substring(0, 7) : 'missing',
      allConfigKeys: Object.keys(config)
    })
    
    if (!config.stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is missing from runtime config')
      throw createError({
        statusCode: 500,
        message: 'Stripe secret key not configured. Please add STRIPE_SECRET_KEY to your .env file.'
      })
    }

    // Clean the Stripe key - aggressively remove any invalid characters
    // Stripe keys format: sk_test_ or sk_live_ followed by alphanumeric and underscore only
    const rawKey = String(config.stripeSecretKey || '')
    
    // Remove ALL whitespace, newlines, tabs, and any non-alphanumeric/underscore characters
    let cleanedStripeKey = rawKey
      .trim()
      .replace(/[\r\n\t\s]/g, '') // Remove all whitespace characters
      .replace(/[^a-zA-Z0-9_]/g, '') // Only keep letters, numbers, and underscores
    
    // Validate format: must start with sk_test_ or sk_live_ and contain only valid chars
    if (!cleanedStripeKey.match(/^sk_(test|live)_[a-zA-Z0-9_]+$/)) {
      console.error('Invalid Stripe secret key format after cleaning', {
        originalLength: rawKey.length,
        cleanedLength: cleanedStripeKey.length,
        cleanedPrefix: cleanedStripeKey.substring(0, 20),
        originalFirstChars: Array.from(rawKey.substring(0, 50)).map(c => c.charCodeAt(0))
      })
      throw createError({
        statusCode: 500,
        message: `Invalid Stripe secret key format. Expected format: sk_test_... or sk_live_... (got ${cleanedStripeKey.substring(0, 20)}...)`
      })
    }
    
    console.log('Stripe key validated and cleaned:', {
      originalLength: rawKey.length,
      cleanedLength: cleanedStripeKey.length,
      keyPrefix: cleanedStripeKey.substring(0, 12) + '...',
      isValidFormat: true
    })

    const stripe = new Stripe(cleanedStripeKey, {
      // Use default API version for better compatibility
      maxNetworkRetries: 2,
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
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    })
    
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        message: error.message || 'Stripe API error'
      })
    }
    
    // Return more detailed error message
    const errorMessage = error.message || 'Failed to create payment intent'
    throw createError({
      statusCode: 500,
      message: `Stripe error: ${errorMessage}`
    })
  }
})

