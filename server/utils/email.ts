import nodemailer from 'nodemailer'

// Verify environment variables are set
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn('⚠️  Gmail credentials not configured. Email sending will fail.')
  console.warn('   GMAIL_USER:', process.env.GMAIL_USER ? '✓ Set' : '✗ Missing')
  console.warn('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '✗ Missing')
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail SMTP connection failed:', error)
  } else {
    console.log('✅ Gmail SMTP connection verified successfully')
  }
})

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    // Check if credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env')
    }

    const mailOptions = {
      from: options.from || process.env.GMAIL_USER,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Plain text fallback
    }

    console.log(`📧 Attempting to send email to: ${mailOptions.to}`)
    console.log(`   Subject: ${mailOptions.subject}`)
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    console.log(`   Response: ${info.response}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Failed to send email:', error)
    console.error('   Error code:', error.code)
    console.error('   Error message:', error.message)
    if (error.response) {
      console.error('   SMTP response:', error.response)
    }
    throw error
  }
}

// Template 1: Pending Booking Email (Initial Confirmation)
export async function sendPendingBookingEmail(booking: {
  firstName?: string
  lastName?: string
  name?: string // Legacy support - will be computed from firstName/lastName if not provided
  email: string
  date: string
  time: string
  numberOfGifts: number
  id: string
  service: string
}) {
  // Compute full name from firstName/lastName or use name for backward compatibility
  const fullName = booking.firstName && booking.lastName
    ? `${booking.firstName} ${booking.lastName}`.trim()
    : booking.name || 'Customer'
  const firstName = booking.firstName || booking.name?.split(/\s+/)[0] || 'Customer'
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const [hours, minutes] = booking.time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  const formattedTime = `${displayHour}:${minutes} ${ampm}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .booking-card { background: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #111827; }
        .status-badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .next-steps h3 { margin-top: 0; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎁 Booking Received!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Thank you for choosing <strong>Last Wrap Hero</strong>! We've received your booking request and are excited to help make your gifts look amazing.</p>
          
          <div class="booking-card">
            <h2 style="margin-top: 0; color: #111827;">Booking Details</h2>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${booking.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of Gifts:</span>
              <span class="detail-value">${booking.numberOfGifts}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${booking.service}</span>
            </div>
            <div class="status-badge">Status: Pending Confirmation</div>
          </div>

          <div class="next-steps">
            <h3>What's Next?</h3>
            <p style="margin-bottom: 0;">We're reviewing your booking and will send you a confirmation email shortly. You'll receive another email once your booking is confirmed!</p>
          </div>

          <p>If you have any questions or need to make changes, please don't hesitate to contact us.</p>
          <p>Best regards,<br><strong>The Last Wrap Hero Team</strong></p>
        </div>
        <div class="footer">
          <p>Last Wrap Hero - Professional Gift Wrapping Services</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    console.log(`📧 sendPendingBookingEmail called with email: ${booking.email}`)
    console.log(`   Booking ID: ${booking.id}`)
    console.log(`   Customer name: ${fullName}`)
    
    if (!booking.email || booking.email === process.env.GMAIL_USER) {
      console.warn(`⚠️  WARNING: Email address is missing or same as sender!`)
      console.warn(`   Booking email: ${booking.email}`)
      console.warn(`   Sender email: ${process.env.GMAIL_USER}`)
    }
    
    return await sendEmail({
      to: booking.email,
      subject: 'Booking Received - Last Wrap Hero',
      html,
    })
  } catch (error) {
    console.error('Error sending pending booking email:', error)
    throw error
  }
}

// Template 2: Confirmed Booking Email
export async function sendConfirmedBookingEmail(booking: {
  firstName?: string
  lastName?: string
  name?: string // Legacy support
  email: string
  date: string
  time: string
  id: string
}) {
  // Compute full name from firstName/lastName or use name for backward compatibility
  const fullName = booking.firstName && booking.lastName
    ? `${booking.firstName} ${booking.lastName}`.trim()
    : booking.name || 'Customer'
  const firstName = booking.firstName || booking.name?.split(/\s+/)[0] || 'Customer'
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const [hours, minutes] = booking.time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  const formattedTime = `${displayHour}:${minutes} ${ampm}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .booking-card { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #111827; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 10px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box h3 { margin-top: 0; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Great news! Your booking has been <strong>confirmed</strong>. We're all set to wrap your gifts!</p>
          
          <div class="booking-card">
            <h2 style="margin-top: 0; color: #111827;">Confirmed Booking Details</h2>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${booking.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${formattedTime}</span>
            </div>
            <div class="status-badge">✓ CONFIRMED</div>
          </div>

          <div class="info-box">
            <h3>What to Expect</h3>
            <p style="margin-bottom: 0;">Please arrive at your scheduled time with your items ready for wrapping. Our team will ensure your gifts are beautifully wrapped and ready for you!</p>
          </div>

          <p>We look forward to seeing you!</p>
          <p>Best regards,<br><strong>The Last Wrap Hero Team</strong></p>
        </div>
        <div class="footer">
          <p>Last Wrap Hero - Professional Gift Wrapping Services</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    return await sendEmail({
      to: booking.email,
      subject: 'Booking Confirmed - Last Wrap Hero',
      html,
    })
  } catch (error) {
    console.error('Error sending confirmed booking email:', error)
    throw error
  }
}

// Template 3: Ready for Pickup Email
export async function sendReadyForPickupEmail(booking: {
  firstName?: string
  lastName?: string
  name?: string // Legacy support
  email: string
  date: string
  time: string
  id: string
  address: string
}) {
  // Compute full name from firstName/lastName or use name for backward compatibility
  const fullName = booking.firstName && booking.lastName
    ? `${booking.firstName} ${booking.lastName}`.trim()
    : booking.name || 'Customer'
  const firstName = booking.firstName || booking.name?.split(/\s+/)[0] || 'Customer'
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .booking-card { background: #f9fafb; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #111827; }
        .status-badge { display: inline-block; background: #8b5cf6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 10px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .pickup-info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .pickup-info h3 { margin-top: 0; color: #92400e; }
        .address-box { background: #ffffff; border: 2px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎁 Your Gifts Are Ready!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Great news! Your beautifully wrapped gifts are <strong>ready for pickup</strong>!</p>
          
          <div class="booking-card">
            <h2 style="margin-top: 0; color: #111827;">Booking Details</h2>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${booking.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="status-badge">✓ READY FOR PICKUP</div>
          </div>

          <div class="pickup-info">
            <h3>Pickup Instructions</h3>
            <p><strong>Pickup Address:</strong></p>
            <div class="address-box">
              ${booking.address}
            </div>
            <p style="margin-bottom: 0;">Please bring a valid ID when picking up your items. If you have any questions, feel free to contact us!</p>
          </div>

          <p>We can't wait for you to see how beautiful your gifts look!</p>
          <p>Best regards,<br><strong>The Last Wrap Hero Team</strong></p>
        </div>
        <div class="footer">
          <p>Last Wrap Hero - Professional Gift Wrapping Services</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    return await sendEmail({
      to: booking.email,
      subject: 'Your Gifts Are Ready for Pickup! - Last Wrap Hero',
      html,
    })
  } catch (error) {
    console.error('Error sending ready for pickup email:', error)
    throw error
  }
}

// Template 4: Thank You Summary Email (After Pickup/Delivery)
export async function sendThankYouSummaryEmail(booking: {
  firstName?: string
  lastName?: string
  name?: string // Legacy support
  email: string
  date: string
  time: string
  id: string
  status: string
  receiptVerification?: {
    method: string
    notes?: string
    photoUrl?: string
  }
}) {
  // Compute full name from firstName/lastName or use name for backward compatibility
  const fullName = booking.firstName && booking.lastName
    ? `${booking.firstName} ${booking.lastName}`.trim()
    : booking.name || 'Customer'
  const firstName = booking.firstName || booking.name?.split(/\s+/)[0] || 'Customer'
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isDelivered = booking.status === 'delivered'
  const statusText = isDelivered ? 'Delivered' : 'Picked Up'
  const statusEmoji = isDelivered ? '🚚' : '📦'

  const verificationMethodLabels: Record<string, string> = {
    signature: 'Customer Signature',
    photo: 'Photo Evidence',
    verbal: 'Verbal Confirmation',
    email: 'Email Confirmation',
    self_pickup: 'Self Pickup (In-Person)',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .summary-card { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #111827; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 10px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .thank-you-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
        .verification-info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .verification-info h3 { margin-top: 0; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} Thank You!</h1>
        </div>
        <div class="content">
          <div class="thank-you-box">
            <h2 style="margin-top: 0; color: #065f46;">Thank You, ${firstName}!</h2>
            <p style="font-size: 18px; margin-bottom: 0;">We hope you love your beautifully wrapped gifts!</p>
          </div>

          <p>Thank you for choosing <strong>Last Wrap Hero</strong>. We're delighted that your order has been ${statusText.toLowerCase()}.</p>
          
          <div class="summary-card">
            <h2 style="margin-top: 0; color: #111827;">Order Summary</h2>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${booking.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${statusText}</span>
            </div>
            <div class="status-badge">✓ ${statusText.toUpperCase()}</div>
          </div>

          ${booking.receiptVerification ? `
          <div class="verification-info">
            <h3>Receipt Verification</h3>
            <p><strong>Verification Method:</strong> ${verificationMethodLabels[booking.receiptVerification.method] || booking.receiptVerification.method}</p>
            ${booking.receiptVerification.notes ? `<p><strong>Notes:</strong> ${booking.receiptVerification.notes}</p>` : ''}
            ${booking.receiptVerification.photoUrl ? `<p><strong>Photo:</strong> <a href="${booking.receiptVerification.photoUrl}">View verification photo</a></p>` : ''}
          </div>
          ` : ''}

          <p>We'd love to hear about your experience! Your feedback helps us continue to provide exceptional service.</p>
          <p>Thank you again for choosing Last Wrap Hero. We hope to serve you again soon!</p>
          <p>Best regards,<br><strong>The Last Wrap Hero Team</strong></p>
        </div>
        <div class="footer">
          <p>Last Wrap Hero - Professional Gift Wrapping Services</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    return await sendEmail({
      to: booking.email,
      subject: 'Thank You! - Last Wrap Hero',
      html,
    })
  } catch (error) {
    console.error('Error sending thank you summary email:', error)
    throw error
  }
}

// Chat Notification Email
export async function sendChatNotificationEmail(data: {
  conversationId: string
  customerEmail: string
  customerName?: string
  messagePreview: string
}) {
  const customerName = data.customerName || 'Customer'
  const conversationUrl = `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/chat/${data.conversationId}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Chat Message - Last Wrap Hero</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to bottom right, #e8f0f5, #ffffff); padding: 30px; border-radius: 10px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #3d6280; margin-top: 0;">New Chat Message</h1>
          <p>You have a new message from <strong>${customerName}</strong> in your chat inbox.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${data.messagePreview}${data.messagePreview.length >= 150 ? '...' : ''}"</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${conversationUrl}" style="display: inline-block; background-color: #3d6280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Conversation</a>
          </div>

          <p style="color: #666; font-size: 14px;">Conversation ID: ${data.conversationId}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>Last Wrap Hero - Professional Gift Wrapping Services</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    // Send to admin email (from env) - you may want to configure this separately
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
    if (!adminEmail) {
      console.warn('⚠️ No admin email configured for chat notifications')
      return { success: false, message: 'Admin email not configured' }
    }

    return await sendEmail({
      to: adminEmail,
      subject: `New Chat Message from ${customerName}`,
      html,
    })
  } catch (error) {
    console.error('Error sending chat notification email:', error)
    throw error
  }
}

