// Shared database models for the system

// Room table model
const Room = {
  id: 'INTEGER PRIMARY KEY',
  type: 'TEXT',
  floor: 'INTEGER',
  baseRate: 'REAL',
  status: 'TEXT' // Available, Occupied, Cleaning
};

// User table model
const User = {
  id: 'INTEGER PRIMARY KEY',
  username: 'TEXT UNIQUE',
  password: 'TEXT',
  role: 'TEXT' // Admin, Manager, Receptionist, Guest
};

// Reservation table model
const Reservation = {
  id: 'INTEGER PRIMARY KEY',
  roomId: 'INTEGER',
  userId: 'INTEGER',
  status: 'TEXT', // Confirmed, Cancelled, Completed, No-Show
  checkInDate: 'DATE',
  checkOutDate: 'DATE'
};

// Payment table model
const Payment = {
  id: 'INTEGER PRIMARY KEY',
  reservationId: 'INTEGER',
  amount: 'REAL',
  status: 'TEXT', // Authorized, Captured, Refunded, Failed
  gatewayAuthToken: 'TEXT'
};

// Invoice table model
const Invoice = {
  id: 'INTEGER PRIMARY KEY',
  reservationId: 'INTEGER',
  totalAmount: 'REAL',
  tax: 'REAL',
  createdAt: 'DATE'
};

// GuestService table model (Feature 8)
const GuestService = {
  id: 'INTEGER PRIMARY KEY',
  confirmationNumber: 'TEXT',
  serviceType: 'TEXT',
  details: 'TEXT',
  cost: 'REAL',
  status: 'TEXT', // Pending, Approved, Fulfilled, Rejected
  createdAt: 'TEXT'
};

// HousekeepingTask table model (Feature 8)
const HousekeepingTask = {
  id: 'INTEGER PRIMARY KEY',
  roomId: 'INTEGER',
  taskType: 'TEXT',
  priority: 'TEXT', // Low, Normal, High, Urgent
  status: 'TEXT', // Pending, In Progress, Completed, Cancelled
  assignedTo: 'TEXT',
  notes: 'TEXT',
  createdAt: 'TEXT'
};

// GuestReview table model (Feature 8)
const GuestReview = {
  id: 'INTEGER PRIMARY KEY',
  confirmationNumber: 'TEXT',
  rating: 'INTEGER', // 1-5
  comment: 'TEXT',
  createdAt: 'TEXT'
};

module.exports = { Room, User, Reservation, Payment, Invoice, GuestService, HousekeepingTask, GuestReview };
