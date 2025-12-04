# MongoDB Atlas Cloud Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Create your account (free tier available)

## Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Click "Create"
5. Wait 3-5 minutes for cluster to deploy

## Step 3: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter:
   - **Username**: `wrapsody-admin` (or your choice)
   - **Password**: Create a strong password (save it!)
5. Under "Database User Privileges", select:
   - **Atlas admin** (for full access) OR
   - **Read and write to any database** (recommended for app)
6. Click "Add User"

## Step 4: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **For production**, add specific IPs only!
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Connection String

Replace the placeholders in the connection string:

1. Replace `<username>` with your database username (e.g., `wrapsody-admin`)
2. Replace `<password>` with your database password
3. Add your database name at the end:
   ```
   mongodb+srv://wrapsody-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority
   ```

## Step 7: Update .env File

Update your `.env` file with the Atlas connection string:

```bash
MONGODB_URI=mongodb+srv://wrapsody-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority
MONGODB_DB_NAME=wrapsody-in-white
```

## Step 8: Test Connection

```bash
# Test with mongosh
mongosh "mongodb+srv://wrapsody-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority"

# Or test with your app
npm run dev
```

## Troubleshooting

### "Authentication failed"
- Double-check username and password
- Make sure special characters in password are URL-encoded
- Verify user exists in Database Access

### "IP not whitelisted"
- Go to Network Access
- Add your current IP or use 0.0.0.0/0 for development

### Connection timeout
- Check internet connection
- Verify cluster is running (not paused)
- Try different region if issues persist

## Security Best Practices

1. **Never commit .env to git** ✅ (already in .gitignore)
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Limit IP access** in production (don't use 0.0.0.0/0)
4. **Use separate users** for different environments
5. **Rotate passwords** regularly

