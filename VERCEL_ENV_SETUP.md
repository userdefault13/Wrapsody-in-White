# Quick Fix: Set Environment Variables in Vercel

## The Problem
Your Vercel site looks different from localhost because:
- **API calls are failing** - The homepage tries to fetch services, pricing, and availability slots
- **GraphQL endpoints need MongoDB** - Without `MONGODB_URI`, all database queries fail
- **Services show "Loading..."** - Because the GraphQL query can't connect to the database

## Solution: Add Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: **wrapsody-in-white**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Variables

Add these variables (you can copy from your local `.env` file):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority
MONGODB_DB_NAME=wrapsody-in-white
```

**For each variable:**
- Check all three environments: ✅ Production, ✅ Preview, ✅ Development
- Click "Save"
- Add the next variable

### Step 3: Add Stripe Variables (if using payments)

```
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
```

### Step 4: Add Email Variables (optional)

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password
```

### Step 5: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click the **three dots** (...) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a redeploy

## Verify It's Working

After redeploy, check:
1. ✅ Services section loads (not stuck on "Loading services...")
2. ✅ Time slots appear (not stuck on "Loading available slots...")
3. ✅ No console errors in browser DevTools (F12)

## Check Browser Console

If it's still not working:
1. Open your Vercel site
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for red error messages
5. Common errors:
   - `MongoDB connection error` → MONGODB_URI is wrong or not set
   - `GraphQL query error` → API endpoints failing
   - `404 Not Found` → Build issue or wrong deployment

## Common Issues

### Issue: Variables set but still not working
- **Solution**: Variables are only available after redeploy. Click "Redeploy" in Vercel dashboard

### Issue: MongoDB connection timeout
- **Solution**: Check MongoDB Atlas Network Access allows connections from `0.0.0.0/0` (or add Vercel IP ranges)

### Issue: Different appearance
- **Solution**: This is usually due to:
  1. API calls failing (fix by setting env vars)
  2. CSS not loading (check build logs)
  3. Browser cache (hard refresh: Ctrl+Shift+R)

## Quick Checklist

- [ ] MONGODB_URI is set in Vercel
- [ ] MONGODB_DB_NAME is set in Vercel
- [ ] Variables are set for Production, Preview, AND Development
- [ ] Redeployed after adding variables
- [ ] MongoDB Atlas allows connections from Vercel (Network Access)
- [ ] Checked browser console for errors
