// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, init, runAsync, getAsync, allAsync } = require('./db');

// Import feature modules
const roomManagement = require('../Feature1_Inventory/RoomManagement');
const pricingAndTax = require('../Feature1_Inventory/PricingAndTax');
const userRoleManagement = require('../Feature1_Inventory/UserRoleManagement');
const systemVerification = require('../Feature1_Inventory/SystemVerification');

const reservationEngine = require('../Feature2_Reservation/ReservationEngine');
const statusManagement = require('../Feature2_Reservation/StatusManagement');

const paymentGateway = require('../Feature3_Transaction/PaymentGateway');
const refundLogic = require('../Feature3_Transaction/RefundLogic');
const financialRecords = require('../Feature3_Transaction/FinancialRecords');

const roomAssignment = require('../Feature4_CheckInOut/RoomAssignment');
const liveStatusSync = require('../Feature4_CheckInOut/LiveStatusSync');
const chargePosting = require('../Feature4_CheckInOut/ChargePosting');

const calculationEngine = require('../Feature5_Billing/CalculationEngine');
const invoiceGeneration = require('../Feature5_Billing/InvoiceGeneration');
const documentExport = require('../Feature5_Billing/DocumentExport');

const occupancyDashboard = require('../Feature6_Reporting/OccupancyDashboard');
const revenueReporting = require('../Feature6_Reporting/RevenueReporting');
const auditTrailViewer = require('../Feature6_Reporting/AuditTrailViewer');

const authenticationSystem = require('../Feature7_Security/AuthenticationSystem');
const backupRoutine = require('../Feature7_Security/BackupRoutine');
const databaseRecovery = require('../Feature7_Security/DatabaseRecovery');

<<<<<<< HEAD
const housekeepingManager = require('../Feature8_Housekeeping/HousekeepingManager');
const maintenanceTracker = require('../Feature8_Housekeeping/MaintenanceTracker');
=======
// Feature 8: Guest Services, Housekeeping & Reviews
const guestServicesModule = require('../Feature8_GuestServices/GuestServices');
const housekeepingModule = require('../Feature8_GuestServices/HousekeepingManagement');
const guestReviewsModule = require('../Feature8_GuestServices/GuestReviews');
>>>>>>> origin/main

const app = express();
const port = 3000;

// Session support
const session = require('express-session');

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  store: new (require('express-session').MemoryStore)(),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
});

app.use(sessionMiddleware);

// Authentication Middleware
const verifyAuthToken = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No authentication token or session provided' });
  }

  const tokenValidation = authenticationSystem.validateToken(token);
  if (!tokenValidation.success) {
    return res.status(401).json({ success: false, message: tokenValidation.message });
  }

  req.user = tokenValidation.data;
  next();
};

// Role-based authorization helper
const requireRole = (allowedRoles = []) => (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!allowedRoles.includes(user.role)) return res.status(403).json({ success: false, message: 'Insufficient privileges' });
  next();
};

// Initialize persistent database
init();

// Guarded page routes
app.get('/portal.html', verifyAuthToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/portal.html'));
});

app.get('/docs.html', verifyAuthToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/docs.html'));
});

// Serve public static files
app.use(express.static(path.join(__dirname, '../public')));

// ========== FEATURE 1: INVENTORY & SYSTEM CONFIGURATION ==========

app.post('/api/rooms', verifyAuthToken, requireRole(['admin','manager']), async (req, res) => {
  try {
    const { type, floor, baseRate } = req.body;
    roomManagement.addRoom(type, floor, baseRate);
    const result = await runAsync('INSERT INTO rooms (type, floor, baseRate, status) VALUES (?, ?, ?, ?)', [type, floor, baseRate, 'Available']);
    const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [result.lastID]);
    return res.json({ success: true, message: 'Room added successfully', room });
  } catch (err) {
    console.error('Error creating room:', err);
    return res.status(500).json({ success: false, message: 'Failed to add room' });
  }
});

app.get('/api/rooms', verifyAuthToken, async (req, res) => {
  try {
    const rooms = await allAsync('SELECT * FROM rooms');
    res.json({ success: true, rooms });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms' });
  }
});

app.put('/api/rooms/:id', verifyAuthToken, requireRole(['admin','manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, floor, baseRate } = req.body;
    const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await runAsync('UPDATE rooms SET type = COALESCE(?, type), floor = COALESCE(?, floor), baseRate = COALESCE(?, baseRate) WHERE id = ?', [type, floor, baseRate, id]);
    roomManagement.updateRoom(id, { type, floor, baseRate });
    const updated = await getAsync('SELECT * FROM rooms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Room updated successfully', room: updated });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ success: false, message: 'Failed to update room' });
  }
});

app.delete('/api/rooms/:id', verifyAuthToken, requireRole(['admin','manager']), async (req, res) => {
  try {
    const { id } = req.params;
    await runAsync('DELETE FROM rooms WHERE id = ?', [id]);
    roomManagement.deleteRoom(id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ success: false, message: 'Failed to delete room' });
  }
});

app.post('/api/pricing/calculate', verifyAuthToken, (req, res) => {
  const { baseRate, taxRate } = req.body;
  const result = pricingAndTax.calculatePrice(baseRate, taxRate);
  res.json({ success: true, result });
});

app.post('/api/pricing/tax-settings', verifyAuthToken, requireRole(['admin','manager']), (req, res) => {
  const { taxRate } = req.body;
  pricingAndTax.updateTaxSettings(taxRate);
  res.json({ success: true, message: 'Tax settings updated successfully', taxRate });
});

app.post('/api/users', verifyAuthToken, requireRole(['admin']), (req, res) => {
  (async () => {
    try {
      const { username, password, role } = req.body;
      const policyCheck = authenticationSystem.enforcePasswordPolicy(password);
      if (!policyCheck.success) {
        return res.status(400).json({ success: false, message: policyCheck.message });
      }
      const existing = await getAsync('SELECT id FROM users WHERE username = ?', [username]);
      if (existing) return res.status(400).json({ success: false, message: 'Username already exists' });
      userRoleManagement.addUser(username, password, role);
      const passwordHash = authenticationSystem.hashPassword(password);
      const result = await runAsync('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, passwordHash, role]);
      const user = await getAsync('SELECT id, username, role FROM users WHERE id = ?', [result.lastID]);
      res.json({ success: true, message: 'User added successfully', user });
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ success: false, message: 'Failed to add user' });
    }
  })();
});

app.get('/api/users', verifyAuthToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await allAsync('SELECT id, username, role FROM users');
    res.json({ success: true, users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

app.post('/api/system/verify', verifyAuthToken, (req, res) => {
  systemVerification.verifySystemConfigurations();
  res.json({ success: true, message: 'System configurations verified' });
});

// ========== FEATURE 2: RESERVATION ENGINE ==========

app.get('/api/reservations/available-rooms', async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    reservationEngine.searchAvailableRooms(checkInDate, checkOutDate);
    const availableRooms = await allAsync("SELECT * FROM rooms WHERE status = 'Available'");
    res.json({ success: true, availableRooms });
  } catch (err) {
    console.error('Error fetching available rooms:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch available rooms' });
  }
});

app.post('/api/reservations/hold-room', verifyAuthToken, (req, res) => {
  const { roomId, userId } = req.body;
  reservationEngine.holdRoom(roomId, userId);
  res.json({ success: true, message: 'Room held successfully' });
});

app.post('/api/reservations', verifyAuthToken, async (req, res) => {
  try {
    const { roomId, userId, checkInDate, checkOutDate } = req.body;
    reservationEngine.createReservation(roomId, userId, checkInDate, checkOutDate);
    const result = await runAsync('INSERT INTO reservations (roomId, userId, status, checkInDate, checkOutDate, createdAt) VALUES (?, ?, ?, ?, ?, ?)', [roomId, userId, 'Confirmed', checkInDate, checkOutDate, new Date().toISOString()]);
    const reservation = await getAsync('SELECT * FROM reservations WHERE id = ?', [result.lastID]);
    res.json({ success: true, message: 'Reservation created successfully', reservation });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ success: false, message: 'Failed to create reservation' });
  }
});

app.get('/api/reservations', verifyAuthToken, async (req, res) => {
  try {
    const reservations = await allAsync('SELECT * FROM reservations');
    res.json({ success: true, reservations });
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
  }
});

app.put('/api/reservations/:id/status', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reservation = await getAsync('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    await runAsync('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    statusManagement.updateReservationStatus(id, status);
    const updated = await getAsync('SELECT * FROM reservations WHERE id = ?', [id]);
    res.json({ success: true, message: 'Reservation status updated', reservation: updated });
  } catch (err) {
    console.error('Error updating reservation status:', err);
    res.status(500).json({ success: false, message: 'Failed to update reservation status' });
  }
});

app.delete('/api/reservations/:id', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await getAsync('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    const cancellationResult = reservationEngine.cancelReservation(reservation);
    if (!cancellationResult.success) return res.status(400).json({ success: false, message: cancellationResult.message });

    await runAsync('UPDATE reservations SET status = ? WHERE id = ?', ['Cancelled', id]);

    const payment = await getAsync('SELECT * FROM payments WHERE reservationId = ?', [id]);
    let refundResult = null;
    if (payment && payment.status === 'Authorized') {
      refundResult = refundLogic.processRefund(payment, cancellationResult.refundPercentage);
      if (refundResult.success) {
        await runAsync('UPDATE payments SET status = ?, refundAmount = ?, refundTransactionId = ? WHERE id = ?', ['Refunded', refundResult.refund.refundAmount, refundResult.refund.transactionId, payment.id]);
      }
    }

    const updated = await getAsync('SELECT * FROM reservations WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation: {
        ...updated,
        refundPolicy: `${cancellationResult.refundPercentage}% refund applied`,
        hoursUntilCheckIn: cancellationResult.hoursUntilCheckIn
      },
      refund: refundResult?.refund || null
    });
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel reservation' });
  }
});

// ========== FEATURE 3: TRANSACTION & PAYMENT PROCESSING ==========

app.post('/api/payments', verifyAuthToken, async (req, res) => {
  try {
    const { reservationId, amount } = req.body;
    paymentGateway.processPayment(reservationId, amount);
    const gatewayAuthToken = 'TOKEN_' + Date.now();
    const result = await runAsync('INSERT INTO payments (reservationId, amount, status, gatewayAuthToken, createdAt) VALUES (?, ?, ?, ?, ?)', [reservationId, amount, 'Authorized', gatewayAuthToken, new Date().toISOString()]);
    const payment = await getAsync('SELECT * FROM payments WHERE id = ?', [result.lastID]);
    financialRecords.recordTransaction(reservationId, amount, 'Authorized', gatewayAuthToken);
    res.json({ success: true, message: 'Payment processed successfully', payment });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ success: false, message: 'Failed to process payment' });
  }
});

app.post('/api/payments/authorize', verifyAuthToken, (req, res) => {
  const { reservationId, amount } = req.body;
  paymentGateway.authorizePayment(reservationId, amount);
  res.json({ success: true, message: 'Payment authorized successfully' });
});

app.post('/api/payments/:id/refund', verifyAuthToken, (req, res) => {
  (async () => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const payment = await getAsync('SELECT * FROM payments WHERE id = ?', [id]);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      const refund = refundLogic.processRefund(payment, amount);
      if (refund && refund.success) {
        await runAsync('UPDATE payments SET status = ?, refundAmount = ? WHERE id = ?', ['Refunded', amount, id]);
        const updated = await getAsync('SELECT * FROM payments WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Refund processed successfully', payment: updated });
      }
      res.status(400).json({ success: false, message: 'Refund failed' });
    } catch (err) {
      console.error('Error processing refund:', err);
      res.status(500).json({ success: false, message: 'Failed to process refund' });
    }
  })();
});

// ========== FEATURE 4: CHECK-IN/OUT ==========

app.post('/api/check-in/assign-room', verifyAuthToken, (req, res) => {
  const { reservationId, roomId } = req.body;
  roomAssignment.assignRoom(reservationId, roomId);
  res.json({ success: true, message: 'Room assigned successfully' });
});

app.post('/api/check-in', verifyAuthToken, (req, res) => {
  (async () => {
    try {
      const { roomId } = req.body;
      liveStatusSync.updateRoomStatus(roomId, 'Occupied');
      const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      await runAsync("UPDATE rooms SET status = 'Occupied' WHERE id = ?", [roomId]);
      const updated = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
      res.json({ success: true, message: 'Guest checked in successfully', room: updated });
    } catch (err) {
      console.error('Error during check-in:', err);
      res.status(500).json({ success: false, message: 'Check-in failed' });
    }
  })();
});

app.post('/api/check-out', verifyAuthToken, (req, res) => {
  (async () => {
    try {
      const { roomId } = req.body;
      liveStatusSync.updateRoomStatus(roomId, 'Cleaning');
      const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      await runAsync("UPDATE rooms SET status = 'Cleaning' WHERE id = ?", [roomId]);

      // Auto-schedule housekeeping task
      const taskData = housekeepingManager.createCleaningTask(roomId, 'Departure Cleaning', 'High', 'Guest checked out');
      await runAsync(
        'INSERT INTO housekeepingTasks (roomId, assignedTo, taskType, priority, status, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [roomId, 'Unassigned', taskData.taskType, taskData.priority, taskData.status, taskData.notes, taskData.createdAt]
      );
      await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', [
        'Housekeeping Task Created',
        `Departure cleaning task automatically scheduled for Room ${roomId}`,
        new Date().toISOString()
      ]);

      const updated = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
      res.json({ success: true, message: 'Guest checked out successfully', room: updated });
    } catch (err) {
      console.error('Error during check-out:', err);
      res.status(500).json({ success: false, message: 'Check-out failed' });
    }
  })();
});

app.post('/api/charges', verifyAuthToken, (req, res) => {
  const { reservationId, chargeDescription, amount } = req.body;
  chargePosting.postCharge(reservationId, chargeDescription, amount);
  res.json({ success: true, message: 'Charge posted successfully' });
});

// ========== FEATURE 5: BILLING & INVOICING ==========

app.post('/api/billing/calculate', (req, res) => {
  const { subtotal, taxRate } = req.body;
  const result = calculationEngine.calculateTotals(subtotal, taxRate);
  res.json({ success: true, result });
});

app.post('/api/invoices', verifyAuthToken, (req, res) => {
  (async () => {
    try {
      const { reservationId, billingDetails } = req.body;
      invoiceGeneration.generateInvoice(reservationId, billingDetails);
      const result = await runAsync('INSERT INTO invoices (reservationId, totalAmount, tax, createdAt) VALUES (?, ?, ?, ?)', [reservationId, billingDetails.totalAmount || 0, billingDetails.tax || 0, new Date().toISOString()]);
      const invoice = await getAsync('SELECT * FROM invoices WHERE id = ?', [result.lastID]);
      res.json({ success: true, message: 'Invoice generated successfully', invoice });
    } catch (err) {
      console.error('Error generating invoice:', err);
      res.status(500).json({ success: false, message: 'Failed to generate invoice' });
    }
  })();
});

app.get('/api/invoices/:id/export', verifyAuthToken, (req, res) => {
  const { id } = req.params;
  documentExport.exportInvoice(id);
  res.json({ success: true, message: 'Invoice exported successfully' });
});

// ========== FEATURE 6: REPORTING & ANALYTICS ==========

app.get('/api/reporting/occupancy', verifyAuthToken, requireRole(['admin','manager']), (req, res) => {
  (async () => {
    try {
      occupancyDashboard.generateOccupancyDashboard();
      const totalRoomsRow = await getAsync('SELECT COUNT(*) as count FROM rooms');
      const totalRooms = totalRoomsRow?.count || 0;
      const occupiedRow = await getAsync("SELECT COUNT(*) as count FROM rooms WHERE status = 'Occupied'");
      const occupiedRooms = occupiedRow?.count || 0;
      const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;
      res.json({ success: true, totalRooms, occupiedRooms, availableRooms: totalRooms - occupiedRooms, occupancyRate });
    } catch (err) {
      console.error('Error generating occupancy report:', err);
      res.status(500).json({ success: false, message: 'Failed to generate occupancy report' });
    }
  })();
});

app.get('/api/reporting/revenue', verifyAuthToken, requireRole(['admin','manager']), (req, res) => {
  (async () => {
    try {
      const { timeframe } = req.query;
      revenueReporting.generateRevenueReport(timeframe);
      const row = await getAsync('SELECT SUM(amount) as total FROM payments');
      const totalRevenue = row?.total || 0;
      res.json({ success: true, timeframe, totalRevenue });
    } catch (err) {
      console.error('Error generating revenue report:', err);
      res.status(500).json({ success: false, message: 'Failed to generate revenue report' });
    }
  })();
});

app.get('/api/reporting/audit-logs', verifyAuthToken, requireRole(['admin','manager']), (req, res) => {
  auditTrailViewer.viewAuditLogs();
  res.json({ success: true, message: 'Audit logs retrieved successfully', logs: [] });
});

// ========== FEATURE 7: SECURITY & INFRASTRUCTURE ==========

app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) return res.json({ success: true, user: req.session.user });
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const tokenValidation = authenticationSystem.validateToken(token);
    if (tokenValidation.success) return res.json({ success: true, user: tokenValidation.data });
  }
  return res.status(401).json({ success: false, message: 'Not authenticated' });
});

app.post('/api/auth/login', (req, res) => {
  (async () => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });
      const user = await getAsync('SELECT * FROM users WHERE username = ?', [username]);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      const authResult = authenticationSystem.authenticateUser(username, password, user.password);
      if (!authResult.success) return res.status(401).json({ success: false, message: authResult.message });
      const tokenResult = authenticationSystem.generateToken(user.id, user.username, user.role);
      if (!tokenResult.success) return res.status(500).json({ success: false, message: tokenResult.message });
      if (req.session) req.session.user = { id: user.id, username: user.username, role: user.role };
      res.json({ success: true, message: 'User authenticated successfully', token: tokenResult.token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  })();
});

app.post('/api/auth/logout', verifyAuthToken, (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to destroy session' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'User logged out successfully' });
    });
  } else {
    res.json({ success: true, message: 'User logged out successfully' });
  }
});

app.post('/api/backup/daily', verifyAuthToken, requireRole(['admin']), (req, res) => {
  backupRoutine.performDailyBackup();
  res.json({ success: true, message: 'Daily backup completed successfully' });
});

app.post('/api/backup/weekly', verifyAuthToken, requireRole(['admin']), (req, res) => {
  backupRoutine.performWeeklySnapshot();
  res.json({ success: true, message: 'Weekly snapshot completed successfully' });
});

app.post('/api/recovery/test', verifyAuthToken, requireRole(['admin']), (req, res) => {
  databaseRecovery.testDatabaseRecovery();
  res.json({ success: true, message: 'Database recovery test completed successfully' });
});

<<<<<<< HEAD
// ========== FEATURE 8: HOUSEKEEPING & MAINTENANCE ==========

// Get rooms grouped by status for Housekeeping view
app.get('/api/housekeeping/rooms', verifyAuthToken, async (req, res) => {
  try {
    const rooms = await allAsync('SELECT * FROM rooms');
    const cleaningRooms = rooms.filter(r => r.status === 'Cleaning');
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance');
    const availableRooms = rooms.filter(r => r.status === 'Available');
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied');

    res.json({
      success: true,
      stats: {
        total: rooms.length,
        cleaning: cleaningRooms.length,
        maintenance: maintenanceRooms.length,
        available: availableRooms.length,
        occupied: occupiedRooms.length
      },
      rooms
    });
  } catch (err) {
    console.error('Error fetching housekeeping rooms:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch housekeeping room status' });
  }
});

// List all housekeeping tasks
app.get('/api/housekeeping/tasks', verifyAuthToken, async (req, res) => {
  try {
    const tasks = await allAsync('SELECT t.*, r.type as roomType, r.floor as roomFloor, r.status as roomStatus FROM housekeepingTasks t LEFT JOIN rooms r ON t.roomId = r.id ORDER BY t.id DESC');
    res.json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching housekeeping tasks:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch housekeeping tasks' });
  }
});

// Create or assign cleaning task
app.post('/api/housekeeping/assign', verifyAuthToken, requireRole(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { taskId, roomId, assignedTo, taskType, priority, notes } = req.body;

    if (taskId) {
      // Assign existing task
      const existing = await getAsync('SELECT * FROM housekeepingTasks WHERE id = ?', [taskId]);
      if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });
      housekeepingManager.assignCleaningTask(taskId, assignedTo || 'Staff');
      await runAsync('UPDATE housekeepingTasks SET assignedTo = ?, status = ? WHERE id = ?', [assignedTo || 'Staff', 'In_Progress', taskId]);
      const updated = await getAsync('SELECT * FROM housekeepingTasks WHERE id = ?', [taskId]);
      return res.json({ success: true, message: 'Task assigned successfully', task: updated });
    } else if (roomId) {
      // Create new assigned cleaning task
      const taskData = housekeepingManager.createCleaningTask(roomId, taskType || 'Daily Cleaning', priority || 'Medium', notes || '');
      const assigned = housekeepingManager.assignCleaningTask(0, assignedTo || 'Staff');
      const result = await runAsync(
        'INSERT INTO housekeepingTasks (roomId, assignedTo, taskType, priority, status, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [roomId, assignedTo || 'Staff', taskData.taskType, taskData.priority, 'In_Progress', notes || '', taskData.createdAt]
      );
      await runAsync("UPDATE rooms SET status = 'Cleaning' WHERE id = ?", [roomId]);
      const task = await getAsync('SELECT * FROM housekeepingTasks WHERE id = ?', [result.lastID]);
      await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', [
        'Housekeeping Task Assigned',
        `Cleaning task created & assigned to ${assignedTo || 'Staff'} for Room ${roomId}`,
        new Date().toISOString()
      ]);
      return res.json({ success: true, message: 'Cleaning task created and assigned', task });
    } else {
      return res.status(400).json({ success: false, message: 'taskId or roomId is required' });
    }
  } catch (err) {
    console.error('Error assigning housekeeping task:', err);
    res.status(500).json({ success: false, message: 'Failed to assign housekeeping task' });
  }
});

// Mark room cleaned and ready (transition Cleaning -> Available)
app.post('/api/housekeeping/clean', verifyAuthToken, requireRole(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { roomId, notes } = req.body;
    if (!roomId) return res.status(400).json({ success: false, message: 'roomId is required' });

    const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const cleanResult = housekeepingManager.completeCleaning(roomId, notes || '');
    await runAsync("UPDATE rooms SET status = 'Available' WHERE id = ?", [roomId]);
    await runAsync(
      "UPDATE housekeepingTasks SET status = 'Completed', completedAt = ?, notes = COALESCE(notes || ' | Completed: ' || ?, ?) WHERE roomId = ? AND status != 'Completed'",
      [cleanResult.completedAt, notes || 'Inspected and cleaned', notes || 'Inspected and cleaned', roomId]
    );

    await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', [
      'Room Cleaned & Available',
      `Room ${roomId} cleaning verified and status set to Available`,
      new Date().toISOString()
    ]);

    const updatedRoom = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
    res.json({ success: true, message: `Room ${roomId} has been cleaned and is now Available`, room: updatedRoom });
  } catch (err) {
    console.error('Error completing cleaning:', err);
    res.status(500).json({ success: false, message: 'Failed to mark room as cleaned' });
  }
});

// Create Maintenance Request (sets room status to Maintenance)
app.post('/api/maintenance', verifyAuthToken, async (req, res) => {
  try {
    const { roomId, reportedBy, issueCategory, description, priority } = req.body;
    if (!roomId || !description) {
      return res.status(400).json({ success: false, message: 'roomId and description are required' });
    }

    const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const reporter = reportedBy || req.user?.username || 'Staff';
    const maintData = maintenanceTracker.reportMaintenanceIssue(
      roomId,
      reporter,
      issueCategory || 'Other',
      description,
      priority || 'Medium'
    );

    const result = await runAsync(
      'INSERT INTO maintenanceRequests (roomId, reportedBy, issueCategory, description, priority, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [roomId, reporter, issueCategory || 'Other', description, priority || 'Medium', 'Reported', maintData.createdAt]
    );

    // Set room status to Maintenance
    await runAsync("UPDATE rooms SET status = 'Maintenance' WHERE id = ?", [roomId]);

    await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', [
      'Maintenance Requested',
      `Room ${roomId}: [${issueCategory || 'Other'}] ${description} (Priority: ${priority || 'Medium'})`,
      new Date().toISOString()
    ]);

    const request = await getAsync('SELECT * FROM maintenanceRequests WHERE id = ?', [result.lastID]);
    const updatedRoom = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
    res.json({ success: true, message: 'Maintenance request logged successfully', request, room: updatedRoom });
  } catch (err) {
    console.error('Error logging maintenance request:', err);
    res.status(500).json({ success: false, message: 'Failed to log maintenance request' });
  }
});

// List all maintenance requests
app.get('/api/maintenance', verifyAuthToken, async (req, res) => {
  try {
    const requests = await allAsync('SELECT m.*, r.type as roomType, r.floor as roomFloor, r.status as roomStatus FROM maintenanceRequests m LEFT JOIN rooms r ON m.roomId = r.id ORDER BY m.id DESC');
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching maintenance requests:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests' });
  }
});

// Resolve Maintenance Request (restores room status to Available)
app.put('/api/maintenance/:id/resolve', verifyAuthToken, requireRole(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const request = await getAsync('SELECT * FROM maintenanceRequests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ success: false, message: 'Maintenance request not found' });

    const resolveData = maintenanceTracker.resolveMaintenanceIssue(id, resolutionNotes || 'Repairs completed');

    await runAsync(
      'UPDATE maintenanceRequests SET status = ?, resolutionNotes = ?, resolvedAt = ? WHERE id = ?',
      ['Resolved', resolutionNotes || 'Repairs completed', resolveData.resolvedAt, id]
    );

    // Restore room to Available if no other active maintenance requests exist for this room
    const otherActive = await getAsync(
      "SELECT id FROM maintenanceRequests WHERE roomId = ? AND status != 'Resolved' AND id != ?",
      [request.roomId, id]
    );
    if (!otherActive) {
      await runAsync("UPDATE rooms SET status = 'Available' WHERE id = ?", [request.roomId]);
    }

    await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', [
      'Maintenance Resolved',
      `Request #${id} for Room ${request.roomId} resolved: ${resolutionNotes || 'Repairs completed'}`,
      new Date().toISOString()
    ]);

    const updated = await getAsync('SELECT * FROM maintenanceRequests WHERE id = ?', [id]);
    const updatedRoom = await getAsync('SELECT * FROM rooms WHERE id = ?', [request.roomId]);
    res.json({ success: true, message: 'Maintenance issue resolved', request: updated, room: updatedRoom });
  } catch (err) {
    console.error('Error resolving maintenance issue:', err);
    res.status(500).json({ success: false, message: 'Failed to resolve maintenance issue' });
  }
});

// Health Check (no auth required)
=======
>>>>>>> origin/main
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// ========== CUSTOMER PORTAL: ONLINE BOOKING ENDPOINTS ==========

app.post('/api/customer/bookings', (req, res) => {
  (async () => {
    try {
      const { roomId, customerName, customerEmail, customerPhone, checkInDate, checkOutDate, totalPrice, paymentMethod } = req.body;
      if (!roomId || !customerName || !customerEmail || !customerPhone || !checkInDate || !checkOutDate || !paymentMethod) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const room = await getAsync('SELECT * FROM rooms WHERE id = ?', [roomId]);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      const confirmationNumber = 'BOOK' + Date.now().toString().slice(-8);
      const result = await runAsync('INSERT INTO reservations (roomId, userId, status, checkInDate, checkOutDate, customerEmail, confirmationNumber, totalPrice, paymentMethod, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [roomId, null, 'Confirmed', checkInDate, checkOutDate, customerEmail, confirmationNumber, totalPrice, paymentMethod, new Date().toISOString()]);
      const reservation = await getAsync('SELECT * FROM reservations WHERE id = ?', [result.lastID]);
      let paymentRecord = null;
      if (paymentMethod === 'online') {
        const txnId = 'TXN' + Date.now();
        const p = await runAsync('INSERT INTO payments (reservationId, confirmationNumber, amount, status, method, transactionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', [reservation.id, confirmationNumber, totalPrice, 'Completed', 'Online', txnId, new Date().toISOString()]);
        paymentRecord = await getAsync('SELECT * FROM payments WHERE id = ?', [p.lastID]);
      }
      await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', ['Customer Booking Created', `Booking ${confirmationNumber} for ${customerName}`, new Date().toISOString()]);
      res.json({ success: true, message: 'Booking created successfully', confirmation: confirmationNumber, reservation, payment: paymentRecord });
    } catch (err) {
      console.error('Error creating customer booking:', err);
      res.status(500).json({ success: false, message: 'Failed to create booking' });
    }
  })();
});

app.get('/api/customer/bookings', (req, res) => {
  (async () => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
      const bookings = await allAsync('SELECT * FROM reservations WHERE customerEmail = ?', [email]);
      res.json({ success: true, bookings, count: bookings.length });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
  })();
});

app.get('/api/customer/bookings/:confirmationNumber', (req, res) => {
  (async () => {
    try {
      const { confirmationNumber } = req.params;
      const booking = await getAsync('SELECT * FROM reservations WHERE confirmationNumber = ?', [confirmationNumber]);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      const payment = await getAsync('SELECT * FROM payments WHERE confirmationNumber = ?', [confirmationNumber]);
      res.json({ success: true, booking, payment });
    } catch (err) {
      console.error('Error fetching booking:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
  })();
});

app.post('/api/customer/bookings/:confirmationNumber/cancel', (req, res) => {
  (async () => {
    try {
      const { confirmationNumber } = req.params;
      const booking = await getAsync('SELECT * FROM reservations WHERE confirmationNumber = ?', [confirmationNumber]);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.status === 'Cancelled') return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      const checkInDate = new Date(booking.checkInDate);
      const now = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));
      let refundPercentage = 100;
      if (daysUntilCheckIn < 7 && daysUntilCheckIn >= 2) refundPercentage = 50;
      else if (daysUntilCheckIn < 2) refundPercentage = 0;
      const refundAmount = (booking.totalPrice * refundPercentage) / 100;
      await runAsync('UPDATE reservations SET status = ?, cancelledAt = ? WHERE id = ?', ['Cancelled', new Date().toISOString(), booking.id]);
      if (booking.paymentMethod === 'online') {
        const payment = await getAsync('SELECT * FROM payments WHERE confirmationNumber = ?', [confirmationNumber]);
        if (payment) {
          await runAsync('UPDATE payments SET status = ?, refundAmount = ?, refundProcessedAt = ? WHERE id = ?', ['Refunded', refundAmount, new Date().toISOString(), payment.id]);
        }
      }
      await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', ['Customer Booking Cancelled', `Booking ${confirmationNumber} cancelled. Refund: $${refundAmount.toFixed(2)} (${refundPercentage}%)`, new Date().toISOString()]);
      const updated = await getAsync('SELECT * FROM reservations WHERE confirmationNumber = ?', [confirmationNumber]);
      res.json({ success: true, message: 'Booking cancelled successfully', refundPercentage, refundAmount, booking: updated });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
  })();
});

// ========== FEATURE 8: GUEST SERVICES, HOUSEKEEPING & REVIEWS ==========

app.post('/api/customer/bookings/:confirmationNumber/services', async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    const { serviceType, details, cost } = req.body;

    const serviceValidation = guestServicesModule.createServiceRequest(confirmationNumber, serviceType, details, cost);
    if (!serviceValidation.success) {
      return res.status(400).json(serviceValidation);
    }

    const result = await runAsync(
      'INSERT INTO guest_services (confirmationNumber, serviceType, details, cost, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [confirmationNumber, serviceType, details || '', parseFloat(cost) || 0, 'Pending', new Date().toISOString()]
    );
    const serviceRequest = await getAsync('SELECT * FROM guest_services WHERE id = ?', [result.lastID]);

    await runAsync('INSERT INTO auditLogs (action, details, timestamp) VALUES (?, ?, ?)', [
      'Guest Service Requested',
      `Service '${serviceType}' requested for booking ${confirmationNumber}`,
      new Date().toISOString()
    ]);

    res.json({ success: true, message: 'Service request created successfully', serviceRequest });
  } catch (err) {
    console.error('Error creating service request:', err);
    res.status(500).json({ success: false, message: 'Failed to create service request' });
  }
});

app.get('/api/customer/bookings/:confirmationNumber/services', async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    const requests = await allAsync('SELECT * FROM guest_services WHERE confirmationNumber = ?', [confirmationNumber]);
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching booking services:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch booking services' });
  }
});

app.get('/api/services/requests', verifyAuthToken, async (req, res) => {
  try {
    const requests = await allAsync('SELECT * FROM guest_services ORDER BY id DESC');
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching service requests:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch service requests' });
  }
});

app.put('/api/services/requests/:id/status', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validation = guestServicesModule.updateServiceRequestStatus(id, status);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    await runAsync('UPDATE guest_services SET status = ? WHERE id = ?', [status, id]);
    const updated = await getAsync('SELECT * FROM guest_services WHERE id = ?', [id]);
    res.json({ success: true, message: 'Service request status updated', serviceRequest: updated });
  } catch (err) {
    console.error('Error updating service request status:', err);
    res.status(500).json({ success: false, message: 'Failed to update service request status' });
  }
});

app.get('/api/housekeeping/tasks', verifyAuthToken, async (req, res) => {
  try {
    const tasks = await allAsync('SELECT * FROM housekeeping_tasks ORDER BY id DESC');
    res.json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching housekeeping tasks:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch housekeeping tasks' });
  }
});

app.post('/api/housekeeping/tasks', verifyAuthToken, async (req, res) => {
  try {
    const { roomId, taskType, priority, assignedTo, notes } = req.body;
    const taskValidation = housekeepingModule.createHousekeepingTask(roomId, taskType, priority, assignedTo, notes);
    if (!taskValidation.success) {
      return res.status(400).json(taskValidation);
    }

    const result = await runAsync(
      'INSERT INTO housekeeping_tasks (roomId, taskType, priority, status, assignedTo, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [roomId, taskType, priority || 'Normal', 'Pending', assignedTo || 'Unassigned', notes || '', new Date().toISOString()]
    );
    const task = await getAsync('SELECT * FROM housekeeping_tasks WHERE id = ?', [result.lastID]);
    res.json({ success: true, message: 'Housekeeping task created successfully', task });
  } catch (err) {
    console.error('Error creating housekeeping task:', err);
    res.status(500).json({ success: false, message: 'Failed to create housekeeping task' });
  }
});

app.put('/api/housekeeping/tasks/:id', verifyAuthToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;
    const validation = housekeepingModule.updateTaskStatus(id, status);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    await runAsync(
      'UPDATE housekeeping_tasks SET status = ?, assignedTo = COALESCE(?, assignedTo), notes = COALESCE(?, notes) WHERE id = ?',
      [status, assignedTo, notes, id]
    );
    const updated = await getAsync('SELECT * FROM housekeeping_tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Housekeeping task updated', task: updated });
  } catch (err) {
    console.error('Error updating housekeeping task:', err);
    res.status(500).json({ success: false, message: 'Failed to update housekeeping task' });
  }
});

app.post('/api/customer/bookings/:confirmationNumber/review', async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    const { rating, comment } = req.body;

    const validation = guestReviewsModule.addGuestReview(confirmationNumber, rating, comment);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    const result = await runAsync(
      'INSERT INTO guest_reviews (confirmationNumber, rating, comment, createdAt) VALUES (?, ?, ?, ?)',
      [confirmationNumber, parseInt(rating, 10), comment || '', new Date().toISOString()]
    );
    const review = await getAsync('SELECT * FROM guest_reviews WHERE id = ?', [result.lastID]);
    res.json({ success: true, message: 'Guest review submitted successfully', review });
  } catch (err) {
    console.error('Error submitting guest review:', err);
    res.status(500).json({ success: false, message: 'Failed to submit guest review' });
  }
});

app.get('/api/customer/reviews', async (req, res) => {
  try {
    const reviews = await allAsync('SELECT * FROM guest_reviews ORDER BY id DESC');
    const summary = guestReviewsModule.calculateAverageRating(reviews);
    res.json({ success: true, reviews, metrics: summary });
  } catch (err) {
    console.error('Error fetching guest reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch guest reviews' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Hotel Management System API running at http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
});
