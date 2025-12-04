// MongoDB Authentication Setup Script
// Run this with: mongosh mongodb://localhost:27017 < setup-mongodb-auth.js

// Switch to admin database
db = db.getSiblingDB('admin')

// Create admin user (if not exists)
try {
  db.createUser({
    user: "wrapsody-admin",
    pwd: "wrapsody-secure-password-2024",
    roles: [
      { role: "readWrite", db: "wrapsody-in-white" },
      { role: "dbAdmin", db: "wrapsody-in-white" },
      { role: "userAdmin", db: "wrapsody-in-white" }
    ]
  })
  print("✅ Admin user created successfully!")
} catch (e) {
  if (e.code === 51003) {
    print("ℹ️  Admin user already exists")
  } else {
    print("❌ Error creating admin user: " + e)
  }
}

// Switch to application database
db = db.getSiblingDB('wrapsody-in-white')

// Create application user (if not exists)
try {
  db.createUser({
    user: "wrapsody-app",
    pwd: "wrapsody-app-password-2024",
    roles: [
      { role: "readWrite", db: "wrapsody-in-white" }
    ]
  })
  print("✅ Application user created successfully!")
} catch (e) {
  if (e.code === 51003) {
    print("ℹ️  Application user already exists")
  } else {
    print("❌ Error creating application user: " + e)
  }
}

print("\n📝 Credentials created:")
print("Admin User: wrapsody-admin")
print("Admin Password: wrapsody-secure-password-2024")
print("\nApp User: wrapsody-app")
print("App Password: wrapsody-app-password-2024")
print("\n⚠️  IMPORTANT: Update your .env file with these credentials!")
