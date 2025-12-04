export const typeDefs = `#graphql
  type Booking {
    id: ID!
    name: String!
    email: String!
    phone: String!
    service: String!
    date: String!
    time: String!
    address: String!
    numberOfGifts: Int!
    message: String
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
  }

  enum BookingStatus {
    pending
    confirmed
    completed
    cancelled
  }

  type DayAvailability {
    date: String!
    slots: [String!]!
    isAvailable: Boolean!
  }

  type DayOfWeekSchedule {
    dayOfWeek: Int!
    slots: [String!]!
    isBlocked: Boolean!
  }

  type Availability {
    availability: [DayAvailability!]!
    dayOfWeekSchedules: [DayOfWeekSchedule!]!
    updatedAt: String!
  }

  type Query {
    bookings(status: BookingStatus, date: String): [Booking!]!
    booking(id: ID!): Booking
    availability: Availability!
    availableTimeSlots(date: String!): [String!]!
    isDateAvailable(date: String!): Boolean!
  }

  input CreateBookingInput {
    name: String!
    email: String!
    phone: String!
    service: String!
    date: String!
    time: String!
    address: String!
    numberOfGifts: Int!
    message: String
  }

  input UpdateBookingStatusInput {
    id: ID!
    status: BookingStatus!
  }

  input UpdateAvailabilityInput {
    availability: [DayAvailabilityInput!]
    dayOfWeekSchedules: [DayOfWeekScheduleInput!]
  }

  input DayAvailabilityInput {
    date: String!
    slots: [String!]!
    isAvailable: Boolean!
  }

  input DayOfWeekScheduleInput {
    dayOfWeek: Int!
    slots: [String!]!
    isBlocked: Boolean!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBookingStatus(input: UpdateBookingStatusInput!): Booking!
    updateAvailability(input: UpdateAvailabilityInput!): Availability!
  }
`

