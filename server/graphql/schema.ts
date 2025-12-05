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

  type Pricing {
    id: ID!
    name: String!
    description: String
    price: Float!
    priceType: String!
    features: [String!]!
    group: String!
    serviceCategory: String
    active: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Service {
    id: ID!
    title: String!
    subtitle: String
    description: String
    tag: String
    category: String
    active: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    bookings(status: BookingStatus, date: String): [Booking!]!
    booking(id: ID!): Booking
    availability: Availability!
    availableTimeSlots(date: String!): [String!]!
    isDateAvailable(date: String!): Boolean!
    pricing(active: Boolean, group: String): [Pricing!]!
    pricingItem(id: ID!): Pricing
    services(active: Boolean, category: String): [Service!]!
    service(id: ID!): Service
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

  input CreatePricingInput {
    name: String!
    description: String
    price: Float!
    priceType: String!
    features: [String!]
    group: String
    serviceCategory: String
    active: Boolean
    order: Int
  }

  input UpdatePricingInput {
    id: ID!
    name: String
    description: String
    price: Float
    priceType: String
    features: [String!]
    group: String
    serviceCategory: String
    active: Boolean
    order: Int
  }

  input ReorderPricingInput {
    pricing: [PricingOrderInput!]!
  }

  input PricingOrderInput {
    id: ID!
    order: Int!
  }

  input CreateServiceInput {
    title: String!
    subtitle: String
    description: String
    tag: String
    category: String
    active: Boolean
    order: Int
  }

  input UpdateServiceInput {
    id: ID!
    title: String
    subtitle: String
    description: String
    tag: String
    category: String
    active: Boolean
    order: Int
  }

  input ReorderServicesInput {
    services: [ServiceOrderInput!]!
  }

  input ServiceOrderInput {
    id: ID!
    order: Int!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBookingStatus(input: UpdateBookingStatusInput!): Booking!
    updateAvailability(input: UpdateAvailabilityInput!): Availability!
    createPricing(input: CreatePricingInput!): Pricing!
    updatePricing(input: UpdatePricingInput!): Pricing!
    deletePricing(id: ID!): Boolean!
    reorderPricing(input: ReorderPricingInput!): Boolean!
    createService(input: CreateServiceInput!): Service!
    updateService(input: UpdateServiceInput!): Service!
    deleteService(id: ID!): Boolean!
    reorderServices(input: ReorderServicesInput!): Boolean!
  }
`

