# MongoDB Collections Documentation

This document describes the MongoDB collections used in the Wrapsody in White application.

## Collections Overview

### 1. `bookings`
Stores all booking information from customers.

**Schema:**
```typescript
{
  id: string                    // Custom unique ID (e.g., "booking-1234567890-abc123")
  name: string                 // Customer name
  email: string                // Customer email
  phone: string                // Customer phone number
  service: string              // Service type: "basic", "premium", "unlimited"
  date: string                 // Booking date (ISO format: "YYYY-MM-DD")
  time: string                 // Booking time (24-hour format: "HH:MM")
  address: string              // Delivery address
  numberOfGifts: number        // Number of gifts to wrap
  message?: string             // Optional customer message
  status: string               // Booking status: "pending", "confirmed", "completed", "cancelled"
  createdAt: string            // ISO timestamp
  updatedAt: string            // ISO timestamp
  _id: ObjectId                // MongoDB ObjectId
}
```

**Indexes:**
- `id` (unique) - Fast lookup by custom ID
- `email` - Query bookings by customer email
- `date` - Filter bookings by date
- `status` - Filter bookings by status
- `createdAt` (descending) - Sort by creation time
- `date + time` (compound) - Efficient date/time queries
- `date + status` (compound) - Filter by date and status together

**Common Queries:**
- Get all bookings: `db.bookings.find({})`
- Get pending bookings: `db.bookings.find({ status: "pending" })`
- Get bookings for a date: `db.bookings.find({ date: "2024-12-25" })`
- Get bookings by email: `db.bookings.find({ email: "customer@example.com" })`

---

### 2. `availability`
Stores the wrapper's availability schedule.

**Schema:**
```typescript
{
  type: "schedule"             // Always "schedule" (unique)
  availability: [              // Array of specific date availability
    {
      date: string             // Date in ISO format ("YYYY-MM-DD")
      slots: string[]          // Array of time slots (e.g., ["09:00", "10:00", "11:00"])
      isAvailable: boolean     // Whether this date is available
    }
  ],
  dayOfWeekSchedules: [       // Array of recurring weekly schedules
    {
      dayOfWeek: number        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      slots: string[]          // Array of time slots
      isBlocked: boolean       // Whether this day is blocked
    }
  ],
  updatedAt: string            // ISO timestamp
}
```

**Indexes:**
- `type` (unique) - Ensures only one schedule document exists
- `updatedAt` (descending) - Track when schedule was last updated
- `availability.date` - Fast lookup of specific date availability

**Common Queries:**
- Get schedule: `db.availability.findOne({ type: "schedule" })`
- Find specific date: `db.availability.findOne({ "availability.date": "2024-12-25" })`

---

### 3. `transactions`
Stores payment transaction information (for future payment integration).

**Schema:**
```typescript
{
  id: string                   // Custom unique transaction ID
  bookingId: string            // Reference to booking ID
  amount: number               // Transaction amount in cents
  currency: string             // Currency code (e.g., "USD")
  status: string               // Transaction status: "pending", "completed", "failed", "refunded"
  paymentMethod: string        // Payment method: "stripe", "paypal", "crypto", etc.
  paymentIntentId?: string     // Payment processor ID (e.g., Stripe payment intent ID)
  metadata?: object            // Additional transaction metadata
  createdAt: string            // ISO timestamp
  updatedAt: string            // ISO timestamp
  _id: ObjectId                // MongoDB ObjectId
}
```

**Indexes:**
- `id` (unique) - Fast lookup by custom ID
- `bookingId` - Find transactions for a booking
- `status` - Filter transactions by status
- `createdAt` (descending) - Sort by creation time
- `paymentMethod` - Filter by payment method
- `amount` - Query by transaction amount
- `bookingId + status` (compound) - Efficient booking transaction queries

**Common Queries:**
- Get transactions for a booking: `db.transactions.find({ bookingId: "booking-123" })`
- Get completed transactions: `db.transactions.find({ status: "completed" })`
- Get transactions by payment method: `db.transactions.find({ paymentMethod: "stripe" })`

---

### 4. `users`
Stores user information (for future admin/user management).

**Schema:**
```typescript
{
  email?: string               // User email (unique, optional)
  walletAddress?: string       // MetaMask wallet address (unique, optional)
  role: string                 // User role: "admin", "customer", "wrapper"
  name?: string                // User display name
  createdAt: string            // ISO timestamp
  updatedAt: string            // ISO timestamp
  _id: ObjectId                // MongoDB ObjectId
}
```

**Indexes:**
- `email` (unique, sparse) - Fast lookup by email
- `walletAddress` (unique, sparse) - Fast lookup by wallet address
- `role` - Filter users by role
- `createdAt` (descending) - Sort by creation time

**Common Queries:**
- Find user by email: `db.users.findOne({ email: "user@example.com" })`
- Find admin users: `db.users.find({ role: "admin" })`
- Find user by wallet: `db.users.findOne({ walletAddress: "0x..." })`

---

## Initialization

### Initialize Collections

To set up all collections with indexes, call:

```bash
curl -X POST http://localhost:3000/api/admin/init-collections
```

Or use the API endpoint:
```
POST /api/admin/init-collections
```

**Response:**
```json
{
  "success": true,
  "message": "Collections initialized successfully",
  "collections": {
    "bookings": { "indexes": [...] },
    "availability": { "indexes": [...] },
    "transactions": { "indexes": [...] },
    "users": { "indexes": [...] }
  }
}
```

### Get Collection Statistics

To view collection statistics and indexes:

```bash
curl http://localhost:3000/api/admin/collection-stats
```

Or use the API endpoint:
```
GET /api/admin/collection-stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "bookings": {
      "documentCount": 10,
      "indexes": [...]
    },
    "availability": {
      "documentCount": 1,
      "indexes": [...]
    },
    ...
  }
}
```

## Index Performance Benefits

### Bookings Collection
- **Date queries**: Indexed `date` field enables fast filtering by date
- **Status filtering**: Indexed `status` enables quick status-based queries
- **Compound indexes**: `date + time` and `date + status` optimize common query patterns
- **Email lookups**: Indexed `email` enables fast customer lookup

### Availability Collection
- **Unique type**: Ensures only one schedule document exists
- **Nested date index**: `availability.date` enables fast specific date lookups

### Transactions Collection
- **Booking relationship**: Indexed `bookingId` enables fast transaction lookup by booking
- **Status filtering**: Indexed `status` for payment status queries
- **Compound index**: `bookingId + status` optimizes common payment queries

## Best Practices

1. **Always use indexes**: The initialization script creates all necessary indexes
2. **Use compound indexes**: For queries that filter by multiple fields
3. **Sparse unique indexes**: Used for optional unique fields (email, walletAddress)
4. **Regular maintenance**: Monitor index usage and remove unused indexes
5. **Query optimization**: Use `explain()` to analyze query performance

## MongoDB Atlas Monitoring

In MongoDB Atlas, you can:
- View collection sizes and document counts
- Monitor index usage and performance
- Set up alerts for collection growth
- Analyze slow queries

## Future Enhancements

- Add collection validation schemas using MongoDB schema validation
- Implement TTL indexes for automatic document expiration (e.g., old transactions)
- Add text indexes for full-text search (e.g., customer names, addresses)
- Create aggregation pipelines for analytics

