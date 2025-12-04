# GraphQL API Documentation

Wrapsody in White now supports GraphQL alongside REST APIs. GraphQL provides a flexible query language that allows you to request exactly the data you need.

## Endpoints

- **GraphQL Endpoint**: `POST /api/graphql`
- **GraphQL Playground**: `GET /api/graphql` (Simple HTML playground)

## Getting Started

### Using the GraphQL Playground

1. Navigate to `http://localhost:3000/api/graphql` in your browser
2. Enter your GraphQL queries or mutations in the text area
3. Click "Execute Query" to run them

### Example Queries

#### Get All Bookings
```graphql
query {
  bookings {
    id
    name
    email
    phone
    service
    date
    time
    address
    numberOfGifts
    status
    createdAt
  }
}
```

#### Get Bookings by Status
```graphql
query {
  bookings(status: pending) {
    id
    name
    email
    date
    time
    status
  }
}
```

#### Get Bookings for a Specific Date
```graphql
query {
  bookings(date: "2024-12-25") {
    id
    name
    email
    time
    status
  }
}
```

#### Get a Single Booking
```graphql
query {
  booking(id: "booking-1234567890-abc123") {
    id
    name
    email
    phone
    service
    date
    time
    address
    numberOfGifts
    message
    status
    createdAt
    updatedAt
  }
}
```

#### Get Availability Schedule
```graphql
query {
  availability {
    availability {
      date
      slots
      isAvailable
    }
    dayOfWeekSchedules {
      dayOfWeek
      slots
      isBlocked
    }
    updatedAt
  }
}
```

#### Get Available Time Slots for a Date
```graphql
query {
  availableTimeSlots(date: "2024-12-25")
}
```

#### Check if Date is Available
```graphql
query {
  isDateAvailable(date: "2024-12-25")
}
```

### Example Mutations

#### Create a Booking
```graphql
mutation {
  createBooking(input: {
    name: "John Doe"
    email: "john@example.com"
    phone: "555-1234"
    service: "premium"
    date: "2024-12-25"
    time: "14:00"
    address: "123 Main St, Long Beach, CA"
    numberOfGifts: 5
    message: "Please wrap carefully"
  }) {
    id
    status
    createdAt
  }
}
```

#### Update Booking Status
```graphql
mutation {
  updateBookingStatus(input: {
    id: "booking-1234567890-abc123"
    status: confirmed
  }) {
    id
    status
    updatedAt
  }
}
```

#### Update Availability Schedule
```graphql
mutation {
  updateAvailability(input: {
    availability: [
      {
        date: "2024-12-25"
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00"]
        isAvailable: true
      }
    ]
    dayOfWeekSchedules: [
      {
        dayOfWeek: 1
        slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
        isBlocked: false
      }
    ]
  }) {
    availability {
      date
      slots
    }
    dayOfWeekSchedules {
      dayOfWeek
      slots
      isBlocked
    }
    updatedAt
  }
}
```

## Using GraphQL in Vue Composables

You can use the `useGraphQL` composable to execute GraphQL queries:

```typescript
import { useGraphQL } from '~/composables/useGraphQL'

const { executeQuery } = useGraphQL()

// Execute a query
const data = await executeQuery(`
  query {
    bookings(status: pending) {
      id
      name
      email
    }
  }
`)

// Execute a mutation with variables
const result = await executeQuery(`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
    }
  }
`, {
  input: {
    name: "John Doe",
    email: "john@example.com",
    // ... other fields
  }
})
```

## Type Definitions

### BookingStatus Enum
- `pending` - Booking is pending confirmation
- `confirmed` - Booking has been confirmed
- `completed` - Service has been completed
- `cancelled` - Booking has been cancelled

### DayOfWeek
- `0` - Sunday
- `1` - Monday
- `2` - Tuesday
- `3` - Wednesday
- `4` - Thursday
- `5` - Friday
- `6` - Saturday

## Error Handling

GraphQL returns errors in the following format:

```json
{
  "errors": [
    {
      "message": "Error message here",
      "locations": [...],
      "path": [...]
    }
  ],
  "data": null
}
```

Always check for `errors` in the response when using GraphQL queries.

## Benefits of GraphQL

1. **Flexible Queries**: Request only the fields you need
2. **Single Endpoint**: One endpoint for all operations
3. **Type Safety**: Strong typing with schema validation
4. **Efficient**: Reduce over-fetching of data
5. **Self-Documenting**: Schema serves as documentation

## Migration from REST

The REST API endpoints (`/api/bookings`, `/api/availability`) are still available and functional. You can gradually migrate to GraphQL or use both simultaneously.

