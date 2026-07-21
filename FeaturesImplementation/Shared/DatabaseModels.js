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

module.exports = { Room, User, Reservation, Payment, Invoice };