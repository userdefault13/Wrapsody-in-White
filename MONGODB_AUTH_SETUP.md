# MongoDB Authentication Setup Guide

## Step 1: Enable Authentication on MongoDB

First, we need to enable authentication on your local MongoDB instance.

### Option A: MongoDB Already Running (Restart Required)

1. Stop MongoDB:
   ```bash
   brew services stop mongodb-community
   ```

2. Edit MongoDB configuration:
   ```bash
   # Find config file location
   brew services info mongodb-community
   
   # Usually located at:
   # /opt/homebrew/etc/mongod.conf (Apple Silicon)
   # /usr/local/etc/mongod.conf (Intel)
   ```

3. Edit the config file and add:
   ```yaml
   security:
     authorization: enabled
   ```

4. Start MongoDB:
   ```bash
   brew services start mongodb-community
   ```

### Option B: Quick Setup Script (Recommended)

I've created a setup script for you. Run:

```bash
# First, make sure MongoDB is running WITHOUT authentication
mongosh mongodb://localhost:27017 setup-mongodb-auth.js
```

This will create users for your application.

## Step 2: Update Your .env File

After creating users, update your `.env` file:

```bash
# For admin user (full access)
MONGODB_URI=mongodb://wrapsody-admin:wrapsody-secure-password-2024@localhost:27017/wrapsody-in-white?authSource=admin

# OR for app user (read/write only)
MONGODB_URI=mongodb://wrapsody-app:wrapsody-app-password-2024@localhost:27017/wrapsody-in-white?authSource=admin

MONGODB_DB_NAME=wrapsody-in-white
```

**Important:** 
- Replace passwords with your own secure passwords
- `authSource=admin` tells MongoDB to authenticate against the admin database where users are stored

## Step 3: Test Connection

```bash
# Test with admin user
mongosh "mongodb://wrapsody-admin:wrapsody-secure-password-2024@localhost:27017/wrapsody-in-white?authSource=admin"

# Test with app user
mongosh "mongodb://wrapsody-app:wrapsody-app-password-2024@localhost:27017/wrapsody-in-white?authSource=admin"
```

## Step 4: Restart Your Application

After updating `.env`, restart your Nuxt dev server:

```bash
npm run dev
```

## Security Notes

⚠️ **Important Security Practices:**

1. **Change Default Passwords**: The passwords in the script are examples - use strong, unique passwords!

2. **Don't Commit .env**: Make sure `.env` is in `.gitignore`

3. **Use Environment Variables**: For production, use secure environment variable management

4. **Limit User Permissions**: Use the `wrapsody-app` user for the application (read/write only), not the admin user

## Troubleshooting

### "Authentication failed"
- Check username/password in connection string
- Verify `authSource=admin` is included
- Make sure MongoDB has authentication enabled

### "User not found"
- Run the setup script again
- Check users exist: `mongosh admin --eval "db.getUsers()"`

### Connection works without password
- MongoDB authentication is not enabled yet
- Follow Step 1 to enable authentication

