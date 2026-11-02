// Shared database models for the system

// Room table model
const Room = {
  id: 'INTEGER PRIMARY KEY',
  type: 'TEXT',
  floor: 'INTEGER',
  baseRate: 'REAL',
  status: 'TEXT' // Available, Occupied, Cleaning, Maintenance
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

// GuestService table model
const GuestService = {
  id: 'INTEGER PRIMARY KEY',
  confirmationNumber: 'TEXT',
  serviceType: 'TEXT',
  details: 'TEXT',
  cost: 'REAL',
  status: 'TEXT', // Pending, Approved, Fulfilled, Rejected
  createdAt: 'TEXT'
};

// HousekeepingTask table model
const HousekeepingTask = {
  id: 'INTEGER PRIMARY KEY',
  roomId: 'INTEGER',
  assignedTo: 'TEXT',
  taskType: 'TEXT',
  priority: 'TEXT', // Low, Medium/Normal, High, Urgent
  status: 'TEXT', // Pending, In_Progress/In Progress, Completed, Cancelled
  notes: 'TEXT',
  createdAt: 'TEXT',
  completedAt: 'TEXT'
};

// MaintenanceRequest table model
const MaintenanceRequest = {
  id: 'INTEGER PRIMARY KEY',
  roomId: 'INTEGER',
  reportedBy: 'TEXT',
  issueCategory: 'TEXT', // Plumbing, Electrical, HVAC, Furniture, Other
  description: 'TEXT',
  priority: 'TEXT',
  status: 'TEXT', // Reported, In_Progress, Resolved
  resolutionNotes: 'TEXT',
  createdAt: 'TEXT',
  resolvedAt: 'TEXT'
};

// GuestReview table model
const GuestReview = {
  id: 'INTEGER PRIMARY KEY',
  confirmationNumber: 'TEXT',
  rating: 'INTEGER', // 1-5
  comment: 'TEXT',
  createdAt: 'TEXT'
};

// PromoCode table model (Feature 9)
const PromoCode = {
  id: 'INTEGER PRIMARY KEY',
  code: 'TEXT UNIQUE',
  description: 'TEXT',
  discountType: 'TEXT', // 'percentage', 'fixed'
  discountValue: 'REAL',
  minSpend: 'REAL',
  maxUses: 'INTEGER',
  usedCount: 'INTEGER',
  validFrom: 'TEXT',
  validUntil: 'TEXT',
  isActive: 'INTEGER', // 1 or 0
  createdAt: 'TEXT'
};

// LoyaltyMember table model (Feature 9)
const LoyaltyMember = {
  id: 'INTEGER PRIMARY KEY',
  customerEmail: 'TEXT UNIQUE',
  customerName: 'TEXT',
  pointsBalance: 'INTEGER',
  tier: 'TEXT', // 'Silver', 'Gold', 'Platinum'
  totalSpent: 'REAL',
  createdAt: 'TEXT'
};

// LoyaltyTransaction table model (Feature 9)
const LoyaltyTransaction = {
  id: 'INTEGER PRIMARY KEY',
  memberId: 'INTEGER',
  type: 'TEXT', // 'Earned', 'Redeemed'
  points: 'INTEGER',
  description: 'TEXT',
  createdAt: 'TEXT'
};

module.exports = {
  Room,
  User,
  Reservation,
  Payment,
  Invoice,
  GuestService,
  HousekeepingTask,
  MaintenanceRequest,
  GuestReview,
  PromoCode,
  LoyaltyMember,
  LoyaltyTransaction
};
