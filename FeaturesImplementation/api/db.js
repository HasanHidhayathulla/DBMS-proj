const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_FILE = process.env.DATABASE_FILE || path.join(dataDir, 'database.sqlite');

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open database', err);
  } else {
    console.log('Connected to SQLite database at', DB_FILE);
  }
});

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function init() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY, type TEXT, floor INTEGER, baseRate REAL, status TEXT);`,
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT);`,
    `CREATE TABLE IF NOT EXISTS reservations (id INTEGER PRIMARY KEY, roomId INTEGER, userId INTEGER, status TEXT, checkInDate TEXT, checkOutDate TEXT, customerEmail TEXT, confirmationNumber TEXT, totalPrice REAL, paymentMethod TEXT, createdAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY, reservationId INTEGER, amount REAL, status TEXT, gatewayAuthToken TEXT, confirmationNumber TEXT, method TEXT, transactionId TEXT, createdAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, reservationId INTEGER, totalAmount REAL, tax REAL, createdAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, userId INTEGER, data TEXT, expiresAt INTEGER);`,
    `CREATE TABLE IF NOT EXISTS auditLogs (id INTEGER PRIMARY KEY, action TEXT, details TEXT, timestamp TEXT);`,
    `CREATE TABLE IF NOT EXISTS guest_services (id INTEGER PRIMARY KEY, confirmationNumber TEXT, serviceType TEXT, details TEXT, cost REAL, status TEXT, createdAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS housekeeping_tasks (id INTEGER PRIMARY KEY, roomId INTEGER, taskType TEXT, priority TEXT, status TEXT, assignedTo TEXT, notes TEXT, createdAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS guest_reviews (id INTEGER PRIMARY KEY, confirmationNumber TEXT, rating INTEGER, comment TEXT, createdAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS housekeepingTasks (id INTEGER PRIMARY KEY, roomId INTEGER, assignedTo TEXT, taskType TEXT, priority TEXT, status TEXT, notes TEXT, createdAt TEXT, completedAt TEXT);`,
    `CREATE TABLE IF NOT EXISTS maintenanceRequests (id INTEGER PRIMARY KEY, roomId INTEGER, reportedBy TEXT, issueCategory TEXT, description TEXT, priority TEXT, status TEXT, resolutionNotes TEXT, createdAt TEXT, resolvedAt TEXT);`
  ];

  db.serialize(() => {
    queries.forEach(q => db.run(q, (err) => {
      if (err) console.error('Error creating table:', err.message);
    }));

    // Insert default users if they don't exist
    const defaultUsers = [
      { username: 'admin', password: hashPassword('Admin@123'), role: 'admin' },
      { username: 'manager', password: hashPassword('Manager@123'), role: 'manager' },
      { username: 'staff', password: hashPassword('Staff@123'), role: 'staff' }
    ];

    defaultUsers.forEach(user => {
      db.run(
        'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
        [user.username, user.password, user.role],
        (err) => {
          if (err) console.error('Error inserting default user:', err.message);
        }
      );
    });
  });
}

// Promise helpers
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { db, init, runAsync, getAsync, allAsync };
