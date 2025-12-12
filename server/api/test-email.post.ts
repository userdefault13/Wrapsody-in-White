import { sendPendingBookingEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    // Get test email from request body or use a default
    const body = await readBody(event).catch(() => ({}))
    const testEmail = body.email || 'test@example.com'
    const testName = body.name || 'Test User'

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return {
        success: false,
        error: 'Gmail credentials not configured',
        details: {
          GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Missing',
          GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing',
        },
      }
    }

    // Send test email
    const result = await sendPendingBookingEmail({
      name: testName,
      email: testEmail,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      numberOfGifts: 1,
      id: 'test-booking-' + Date.now(),
      service: 'test-service',
    })

    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      sentTo: testEmail,
      sentFrom: process.env.GMAIL_USER,
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return {
      success: false,
      error: 'Failed to send test email',
      message: error.message || 'Unknown error',
      code: error.code,
      response: error.response,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }
})


