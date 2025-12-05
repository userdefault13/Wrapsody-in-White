# Stripe Payment Setup Guide

## Step 1: Create Stripe Account

1. Go to https://stripe.com and sign up
2. Complete account setup
3. Get your API keys from the Dashboard

## Step 2: Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## Step 3: Add Environment Variables

Add these to your `.env` file:

```bash
# Stripe Keys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Step 4: Test Mode

Stripe provides test card numbers for testing:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires 3D Secure:** `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## Step 5: Production

When ready for production:
1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Test with real cards (small amounts first)

## Features Implemented

✅ Stripe card payments with Elements
✅ Crypto payments (BTC/USDC) with 10% discount
✅ Cash on delivery option
✅ Automatic discount calculation
✅ Transaction records in MongoDB
✅ Booking status updates

## Discount Configuration

Crypto payments get a **10% discount** automatically applied. This is configured in `PaymentModal.vue`:

```javascript
const cryptoDiscountPercent = 10 // 10% discount for crypto
```

You can adjust this value to change the discount percentage.

