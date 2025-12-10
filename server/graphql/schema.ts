export const typeDefs = `#graphql
  type ReceiptVerification {
    method: String!
    notes: String
    photoUrl: String
    verifiedAt: String!
    verifiedBy: String
  }

  type Booking {
    id: ID!
    firstName: String # Nullable for backward compatibility with old bookings
    lastName: String # Nullable for backward compatibility with old bookings
    name: String! # Computed: firstName + lastName (for backward compatibility)
    email: String!
    phone: String!
    service: String!
    date: String!
    time: String!
    address: String!
    numberOfGifts: Int!
    message: String
    status: BookingStatus!
    workOrders: [WorkOrder!]!
    items: [WorkItem!]! # Legacy support: flattened items from all workOrders
    checkedInAt: String
    checkedInBy: String
    currentStage: WorkflowStage
    receiptVerification: ReceiptVerification
    readyEmailSentAt: String
    createdAt: String!
    updatedAt: String!
  }

  enum BookingStatus {
    pending
    confirmed
    in_progress
    ready
    picked_up
    delivered
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

  type Size {
    id: ID!
    name: SizeName!
    displayName: String!
    order: Int!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum SizeName {
    xsmall
    small
    medium
    large
    xl
  }

  type BoxDimension {
    id: ID!
    sizeId: ID!
    size: Size
    length: Float!
    width: Float!
    height: Float!
    surfaceArea: Float!
    wrappingPaperNeeded: Float!
    wasteFactor: Float!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type WorkOrder {
    id: ID!
    bookingId: ID!
    workOrderNumber: Int!
    items: [WorkItem!]!
    status: WorkOrderStatus!
    assignedWorker: String
    priority: Int
    notes: String
    startedAt: String
    completedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type WorkItem {
    id: ID!
    workOrderId: ID!
    bookingId: ID
    itemNumber: Int!
    description: String
    sizeId: ID
    size: Size
    photos: [String!]!
    serialNumber: String
    serialNumberPhoto: String
    specialInstructions: String
    wrappingStyle: String
    giftFrom: String
    giftTo: String
    materialsUsed: [MaterialUsed!]!
    status: ItemStatus!
    assignedWorker: String
    checkedInAt: String
    wrappingStartedAt: String
    wrappingCompletedAt: String
    wrappingProgress: [Boolean!]!
    boxDimensionId: ID
    wrappingAttempts: Int
    wrappingPaperSelection: String
    qualityCheckedAt: String
    qualityCheckProgress: [Boolean!]!
    readyAt: String
    pickedUpAt: String
    isExpensiveElectronics: Boolean!
    isLargerThanPaidSize: Boolean!
    isSmallerThanPaidSize: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum WorkOrderStatus {
    pending
    assigned
    in_progress
    quality_check
    ready
    completed
    cancelled
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

  type Roll {
    rollNumber: Int!
    onHand: Float!
    maxArea: Float!
  }

  type Inventory {
    id: ID!
    name: String!
    type: InventoryType!
    size: String
    cost: Float!
    quantity: Float!
    unit: String
    rollLength: Float
    rollWidth: Float
    totalArea: Float
    remainingArea: Float
    minUsableArea: Float
    rolls: [Roll!]
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
    availability(workerId: String): Availability!
    workerAvailability(workerId: String!): Availability!
    availableTimeSlots(date: String!, workerId: String): [String!]!
    isDateAvailable(date: String!, workerId: String): Boolean!
    maxGiftsForTimeSlot(date: String!, time: String!, service: String!, workerId: String): Int!
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
    sizes(active: Boolean): [Size!]!
    size(id: ID, name: SizeName): Size
    boxDimensions(sizeId: ID, active: Boolean): [BoxDimension!]!
    boxDimension(id: ID!): BoxDimension
    workOrders(bookingId: ID, status: WorkOrderStatus, assignedWorker: String): [WorkOrder!]!
    workOrder(id: ID!): WorkOrder
    workItems(workOrderId: ID!): [WorkItem!]!
    workItem(id: ID!): WorkItem
    terminalBookings(stage: WorkflowStage): [Booking!]!
  }

  input CreateBookingInput {
    firstName: String
    lastName: String
    name: String # Legacy: if provided, will be split into firstName and lastName
    email: String!
    phone: String!
    service: String!
    date: String!
    time: String!
    address: String!
    numberOfGifts: Int!
    message: String
  }

  input ReceiptVerificationInput {
    method: String!
    notes: String
    photoUrl: String
  }

  input UpdateBookingStatusInput {
    id: ID!
    status: BookingStatus!
    receiptVerification: ReceiptVerificationInput
  }

  input UpdateAvailabilityInput {
    workerId: String
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

  input RollInput {
    rollNumber: Int!
    onHand: Float!
    maxArea: Float!
  }

  input CreateInventoryInput {
    name: String!
    type: InventoryType!
    size: String
    cost: Float!
    quantity: Float!
    unit: String
    rollLength: Float
    rollWidth: Float
    rolls: [RollInput!]
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
    quantity: Float
    unit: String
    rollLength: Float
    rollWidth: Float
    rolls: [RollInput!]
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
  }

  input CreateBoxDimensionInput {
    sizeId: ID!
    length: Float!
    width: Float!
    height: Float!
    wasteFactor: Float
    active: Boolean
  }

  input UpdateBoxDimensionInput {
    id: ID!
    sizeId: ID
    length: Float
    width: Float
    height: Float
    wasteFactor: Float
    active: Boolean
  }

  input MaterialUsedInput {
    inventoryId: ID!
    inventoryName: String!
    quantity: Float!
    unit: String
  }

  input CreateSizeInput {
    name: SizeName!
    displayName: String!
    order: Int!
    active: Boolean
  }

  input UpdateSizeInput {
    id: ID!
    displayName: String
    order: Int
    active: Boolean
  }

  input CreateWorkOrderInput {
    bookingId: ID!
    workOrderNumber: Int!
    priority: Int
    notes: String
  }

  input UpdateWorkOrderInput {
    id: ID!
    status: WorkOrderStatus
    assignedWorker: String
    priority: Int
    notes: String
  }

  input AddWorkItemInput {
    workOrderId: ID!
    itemNumber: Int!
    description: String
    sizeId: ID
    photos: [String!]
    serialNumber: String
    serialNumberPhoto: String
    specialInstructions: String
    wrappingStyle: String
    giftFrom: String
    giftTo: String
    isExpensiveElectronics: Boolean
    isLargerThanPaidSize: Boolean
    isSmallerThanPaidSize: Boolean
  }

  input UpdateWorkItemInput {
    id: ID!
    description: String
    sizeId: ID
    photos: [String!]
    serialNumber: String
    serialNumberPhoto: String
    specialInstructions: String
    wrappingStyle: String
    giftFrom: String
    giftTo: String
    status: ItemStatus
    assignedWorker: String
    materialsUsed: [MaterialUsedInput!]
    wrappingProgress: [Boolean!]
    boxDimensionId: ID
    wrappingAttempts: Int
    wrappingPaperSelection: String
    qualityCheckProgress: [Boolean!]
    isExpensiveElectronics: Boolean
    isLargerThanPaidSize: Boolean
    isSmallerThanPaidSize: Boolean
  }

  input CheckInBookingInput {
    bookingId: ID!
    checkedInBy: String!
  }

  input AssignWorkerInput {
    workItemId: ID!
    workerId: String!
  }

  input RecordMaterialsInput {
    workItemId: ID!
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
    createSize(input: CreateSizeInput!): Size!
    updateSize(input: UpdateSizeInput!): Size!
    deleteSize(id: ID!): Boolean!
    createBoxDimension(input: CreateBoxDimensionInput!): BoxDimension!
    updateBoxDimension(input: UpdateBoxDimensionInput!): BoxDimension!
    deleteBoxDimension(id: ID!): Boolean!
    createWorkOrder(input: CreateWorkOrderInput!): WorkOrder!
    updateWorkOrder(input: UpdateWorkOrderInput!): WorkOrder!
    addWorkItem(input: AddWorkItemInput!): WorkItem!
    updateWorkItem(input: UpdateWorkItemInput!): WorkItem!
    assignWorker(input: AssignWorkerInput!): WorkItem!
    recordMaterialsUsed(input: RecordMaterialsInput!): WorkItem!
  }
`

