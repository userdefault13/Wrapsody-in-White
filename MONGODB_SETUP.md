# MongoDB Connection Guide

## Option 1: Local MongoDB (Recommended for Development)

### Install MongoDB Locally

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Check if it's running
brew services list | grep mongodb
```

**Using Docker (Easiest):**
```bash
# Run MongoDB in a Docker container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Check if it's running
docker ps | grep mongodb
```

**Windows:**
- Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service

### Verify Local Connection

```bash
# Test connection
mongosh mongodb://localhost:27017

# Or using MongoDB Compass (GUI)
# Download from: https://www.mongodb.com/try/download/compass
```

### Update .env File

Your `.env` file should have:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=wrapsody-in-white
```

---

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier M0 is perfect for development)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Configure Database Access

1. Go to "Database Access" in Atlas
2. Create a database user:
   - Username: `wrapsody-admin` (or your choice)
   - Password: Create a strong password
   - Save the password securely!

### Step 4: Configure Network Access

1. Go to "Network Access" in Atlas
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, use specific IPs only!

### Step 5: Update .env File

Replace the connection string in your `.env` file:

```
MONGODB_URI=mongodb+srv://wrapsody-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=wrapsody-in-white
```

**Important:** Replace:
- `wrapsody-admin` with your database username
- `YOUR_PASSWORD` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

---

## Testing the Connection

### Method 1: Test via Application

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Check server logs - you should see:
   ```
   Connected to MongoDB
   ```

3. Try creating a booking - if it works, MongoDB is connected!

### Method 2: Test via MongoDB Shell

**Local MongoDB:**
```bash
mongosh mongodb://localhost:27017/wrapsody-in-white
```

**MongoDB Atlas:**
```bash
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wrapsody-in-white"
```

### Method 3: Test via MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect using your connection string from `.env`
3. You should see the `wrapsody-in-white` database

---

## Troubleshooting

### Connection Refused (Local MongoDB)

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community

# Or restart Docker container
docker restart mongodb
```

### Authentication Failed (MongoDB Atlas)

- Double-check username and password in connection string
- Make sure database user has proper permissions
- Verify network access allows your IP address

### Connection Timeout

- Check your internet connection (for Atlas)
- Verify firewall isn't blocking port 27017 (local)
- For Atlas, ensure IP is whitelisted in Network Access

---

## Current Configuration

Check your `.env` file:
```bash
cat .env
```

Make sure `MONGODB_URI` points to your MongoDB instance!

