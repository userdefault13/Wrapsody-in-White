# MongoDB Atlas Connection Troubleshooting

## Current Issue: Authentication Failed

The connection is failing with "bad auth : authentication failed". Here are steps to resolve:

### Step 1: Verify Credentials in MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Navigate to **Database Access**
3. Find user `userdefault`
4. Click **Edit** on the user
5. **Reset the password** if needed
6. Make sure the user has these roles:
   - `readWriteAnyDatabase@admin` ✅ (you have this)
   - Or `readWrite` on `wrapsody-in-white` database

### Step 2: Verify Network Access

1. Go to **Network Access**
2. Make sure your IP is whitelisted OR
3. Use `0.0.0.0/0` for development (allows all IPs)

### Step 3: Test Connection String

Try connecting with MongoDB Compass (GUI tool):

1. Download: [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Use connection string:
   ```
   mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/?retryWrites=true&w=majority
   ```
3. If Compass connects, the credentials are correct
4. If Compass fails, verify password in Atlas

### Step 4: Alternative Connection String Format

If the user is in the `admin` database, try:

```
mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority&authSource=admin
```

### Step 5: Create New Database User (Recommended)

1. In Atlas, go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `wrapsody-app`
5. Password: Create a new strong password
6. Database User Privileges: 
   - Select **"Read and write to any database"** OR
   - Select **"wrapsody-in-white"** database with **"readWrite"** role
7. Click **Add User**
8. Update `.env` with new credentials

### Common Issues

**Issue:** Password contains special characters
- **Solution:** URL encode the password in connection string

**Issue:** User doesn't have database permissions
- **Solution:** Grant `readWrite` role on `wrapsody-in-white` database

**Issue:** IP not whitelisted
- **Solution:** Add `0.0.0.0/0` to Network Access for development

**Issue:** Cluster is paused
- **Solution:** Resume cluster in Atlas dashboard

### Test Connection Manually

```bash
# Test with mongosh
mongosh "mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/?retryWrites=true&w=majority"

# If successful, you'll see MongoDB shell prompt
# Then try:
use wrapsody-in-white
db.test.insertOne({test: "connection"})
```

### Current .env Configuration

Your `.env` file is set to:
```
MONGODB_URI=mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority&authSource=admin
```

If authentication still fails, please:
1. Double-check the password in MongoDB Atlas
2. Verify Network Access allows your IP
3. Try creating a new database user with fresh credentials

