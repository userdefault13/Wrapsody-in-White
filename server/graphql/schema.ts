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
    items: [BookingItem!]!
    checkedInAt: String
    checkedInBy: String
    currentStage: WorkflowStage
    createdAt: String!
    updatedAt: String!
  }

  enum BookingStatus {
    pending
    in_progress
    ready
    completed
    cancelled
  }

  enum WorkflowStage {
    awaiting_checkin
    checked_in
    in_progress
    quality_check
    ready_for_pickup
    completed
  }

  type MaterialUsed {
    inventoryId: ID!
    inventoryName: String!
    quantity: Float!
    unit: String
  }

  type BookingItem {
    id: ID!
    bookingId: ID!
    itemNumber: Int!
    description: String
    size: String
    photos: [String!]!
    serialNumber: String
    serialNumberPhoto: String
    specialInstructions: String
    wrappingStyle: String
    materialsUsed: [MaterialUsed!]!
    status: ItemStatus!
    assignedWorker: String
    checkedInAt: String
    wrappingStartedAt: String
    wrappingCompletedAt: String
    wrappingProgress: [Boolean!]!
    qualityCheckedAt: String
    readyAt: String
    pickedUpAt: String
    isExpensiveElectronics: Boolean!
    isLargerThanPaidSize: Boolean!
    isSmallerThanPaidSize: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum ItemStatus {
    pending_checkin
    checked_in
    wrapping
    quality_check
    ready
    picked_up
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

  type ScopeOfWork {
    duration: Int!
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
    scopeOfWork: ScopeOfWork
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

  type Transaction {
    id: ID!
    bookingId: String!
    userId: String
    amount: Float!
    currency: String!
    status: String!
    paymentMethod: String!
    paymentIntentId: String
    metadata: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    email: String
    walletAddress: String
    name: String
    role: String!
    transactionHistory: [Transaction!]!
    createdAt: String!
    updatedAt: String!
  }

  enum WorkerType {
    Owner
    Employee
  }

  type Worker {
    id: ID!
    walletAddress: String!
    workerType: WorkerType!
    name: String
    email: String
    phone: String
    packagesCheckedIn: [String!]!
    packagesWrapped: [String!]!
    packagesCompleted: [String!]!
    packagesDroppedOff: [String!]!
    availabilityId: String
    createdAt: String!
    updatedAt: String!
  }

  enum InventoryType {
    wrapping_paper
    bow
    ribbon
    box
  }

  type Inventory {
    id: ID!
    name: String!
    type: InventoryType!
    size: String
    cost: Float!
    quantity: Int!
    unit: String
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    bookings(status: BookingStatus, date: String): [Booking!]!
    booking(id: ID!): Booking
    availability: Availability!
    availableTimeSlots(date: String!): [String!]!
    isDateAvailable(date: String!): Boolean!
    maxGiftsForTimeSlot(date: String!, time: String!, service: String!): Int!
    pricing(active: Boolean, group: String, serviceCategory: String): [Pricing!]!
    pricingItem(id: ID!): Pricing
    services(active: Boolean, category: String): [Service!]!
    service(id: ID!): Service
    transactions(bookingId: String, status: String, paymentMethod: String, userId: String): [Transaction!]!
    transaction(id: ID!): Transaction
    inventory(type: InventoryType): [Inventory!]!
    inventoryItem(id: ID!): Inventory
    users(email: String, walletAddress: String, role: String): [User!]!
    user(id: ID!, email: String, walletAddress: String): User
    workers(workerType: WorkerType): [Worker!]!
    worker(id: ID, walletAddress: String): Worker
    bookingItems(bookingId: ID!): [BookingItem!]!
    terminalBookings(stage: WorkflowStage): [Booking!]!
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

  input ScopeOfWorkInput {
    duration: Int!
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
    scopeOfWork: ScopeOfWorkInput
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
    scopeOfWork: ScopeOfWorkInput
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

  input CreateTransactionInput {
    bookingId: String!
    userId: String
    amount: Float!
    currency: String!
    status: String!
    paymentMethod: String!
    paymentIntentId: String
    metadata: String
  }

  input CreateUserInput {
    email: String
    walletAddress: String
    name: String
    role: String!
  }

  input UpdateUserInput {
    id: ID!
    email: String
    walletAddress: String
    name: String
    role: String
  }

  input CreateWorkerInput {
    walletAddress: String!
    name: String
    email: String
    phone: String
    availabilityId: String
  }

  input UpdateWorkerInput {
    id: ID!
    name: String
    email: String
    phone: String
    packagesCheckedIn: [String!]
    packagesWrapped: [String!]
    packagesCompleted: [String!]
    packagesDroppedOff: [String!]
    availabilityId: String
  }

  input AddWorkerPackageInput {
    id: ID!
    bookingId: String!
    action: WorkerPackageAction!
  }

  enum WorkerPackageAction {
    check_in
    wrap
    complete
    drop_off
  }

  input CreateInventoryInput {
    name: String!
    type: InventoryType!
    size: String
    cost: Float!
    quantity: Int!
    unit: String
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
  }

  input UpdateInventoryInput {
    id: ID!
    name: String
    type: InventoryType
    size: String
    cost: Float
    quantity: Int
    unit: String
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
  }

  input MaterialUsedInput {
    inventoryId: ID!
    inventoryName: String!
    quantity: Float!
    unit: String
  }

  input AddBookingItemInput {
    bookingId: ID!
    itemNumber: Int!
    description: String
    size: String
    photos: [String!]
    serialNumber: String
    serialNumberPhoto: String
    specialInstructions: String
    wrappingStyle: String
    isExpensiveElectronics: Boolean
    isLargerThanPaidSize: Boolean
    isSmallerThanPaidSize: Boolean
  }

  input UpdateBookingItemInput {
    id: ID!
    description: String
    size: String
    photos: [String!]
    serialNumber: String
    serialNumberPhoto: String
    specialInstructions: String
    wrappingStyle: String
    status: ItemStatus
    assignedWorker: String
    materialsUsed: [MaterialUsedInput!]
    wrappingProgress: [Boolean!]
    isExpensiveElectronics: Boolean
    isLargerThanPaidSize: Boolean
    isSmallerThanPaidSize: Boolean
  }

  input CheckInBookingInput {
    bookingId: ID!
    checkedInBy: String!
  }

  input AssignWorkerInput {
    itemId: ID!
    workerId: String!
  }

  input RecordMaterialsInput {
    itemId: ID!
    materialsUsed: [MaterialUsedInput!]!
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
    createTransaction(input: CreateTransactionInput!): Transaction!
    createInventory(input: CreateInventoryInput!): Inventory!
    updateInventory(input: UpdateInventoryInput!): Inventory!
    deleteInventory(id: ID!): Boolean!
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    createWorker(input: CreateWorkerInput!): Worker!
    updateWorker(input: UpdateWorkerInput!): Worker!
    addWorkerPackage(input: AddWorkerPackageInput!): Worker!
    checkInBooking(input: CheckInBookingInput!): Booking!
    addBookingItem(input: AddBookingItemInput!): BookingItem!
    updateBookingItem(input: UpdateBookingItemInput!): BookingItem!
    assignWorker(input: AssignWorkerInput!): BookingItem!
    recordMaterialsUsed(input: RecordMaterialsInput!): BookingItem!
  }
`

