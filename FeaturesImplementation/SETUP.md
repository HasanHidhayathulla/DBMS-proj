# Hotel Management System - Quick Setup Guide

## One-Line Setup

### Windows (PowerShell)

```powershell
cd "e:\DBMS proj\FeaturesImplementation" ; npm install ; npm start
```

## Step-by-Step Setup

### 1. Open Terminal/PowerShell

Navigate to the project folder:

```
cd "e:\DBMS proj\FeaturesImplementation"
```

### 2. Install Dependencies

```
npm install
```

### 3. Start the Server

```
npm start
```

You should see:

```
🚀 Hotel Management System API running at http://localhost:3000
```

### 4. Open the Web Interface

Open your browser and go to:

```
http://localhost:3000
```

## Security & Authentication

### Default Test Credentials

The system comes with three default test users:

| Username | Password    | Role                                    |
| -------- | ----------- | --------------------------------------- |
| admin    | Admin@123   | Admin (full access)                     |
| manager  | Manager@123 | Manager (room & reservation management) |
| staff    | Staff@123   | Staff (view-only, limited access)       |

### Authentication & Session Management

**✅ NEW SECURITY FEATURES (Implemented):**

- **Session-Based Authentication**: Express sessions with secure cookies
- **JWT Token Support**: Bearer token authentication for API calls
- **Database-Backed Users**: All users stored in SQLite with bcrypt password hashing
- **Role-Based Access Control (RBAC)**: Different permissions for admin, manager, staff
- **Protected Routes**: All feature endpoints require authentication
- **Protected Pages**: /portal.html and /docs.html require login
- **Logout Support**: Session destruction on logout with cookie clearing

### Testing Authentication (API)

#### Login to Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

Response includes JWT token:

```json
{
  "success": true,
  "message": "User authenticated successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

#### Use Token to Access Protected Routes

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Check Current Authentication

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Dependencies & Environment Variables

### Required npm Packages

The following packages are automatically installed with `npm install`:

- **express** - Web framework
- **body-parser** - Request body parsing
- **cors** - Cross-origin resource sharing
- **sqlite3** - SQLite database driver
- **bcryptjs** - Password hashing library
- **jsonwebtoken** - JWT token generation/validation
- **express-session** - Session management

**Installation:**

```bash
npm install express body-parser cors sqlite3 bcryptjs jsonwebtoken express-session
```

### Environment Variables (Optional)

You can override defaults by creating a `.env` file:

```env
# Session configuration
SESSION_SECRET=your_custom_session_secret_key

# Database configuration
DATABASE_FILE=./data/database.sqlite

# JWT configuration (optional)
JWT_SECRET=your_custom_jwt_secret_key
```

If not provided, the system uses secure defaults:

- `SESSION_SECRET`: 'change_this_secret' (development only)
- `DATABASE_FILE`: `./data/database.sqlite`
- `JWT_SECRET`: 'hotel-management-system-secret-key-change-in-production'

### Database Initialization

On first startup, the system:

1. Creates SQLite database at `./data/database.sqlite`
2. Creates 7 required tables: rooms, users, reservations, payments, invoices, sessions, auditLogs
3. Inserts default test users (admin, manager, staff)
4. Initializes session store

**Resetting Database:**
Delete `./data/database.sqlite` and restart the server to reinitialize.

## Testing the System

### Manual Testing

1. **Add a Room**: Go to Inventory tab → Fill room details → Click "Add Room"
2. **Create Reservation**: Go to Reservations tab → Select dates → Create reservation
3. **Process Payment**: Go to Payments tab → Enter payment details
4. **Check-In**: Go to Check-In/Out tab → Enter room and reservation IDs
5. **Generate Invoice**: Go to Billing tab → Create invoice

### API Testing with curl (Optional)

#### Add a Room

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"type":"Deluxe","floor":3,"baseRate":150}'
```

#### List All Rooms

```bash
curl http://localhost:3000/api/rooms
```

#### Create a Reservation

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"roomId":1,"userId":1,"checkInDate":"2026-05-10","checkOutDate":"2026-05-15"}'
```

#### Process Payment

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"reservationId":1,"amount":750}'
```

## File Structure Overview

```
FeaturesImplementation/
├── Feature1_Inventory/
│   ├── RoomManagement.js
│   ├── PricingAndTax.js
│   ├── UserRoleManagement.js
│   └── SystemVerification.js
├── Feature2_Reservation/
│   ├── ReservationEngine.js
│   └── StatusManagement.js
├── Feature3_Transaction/
│   ├── PaymentGateway.js
│   ├── RefundLogic.js
│   └── FinancialRecords.js
├── Feature4_CheckInOut/
│   ├── RoomAssignment.js
│   ├── LiveStatusSync.js
│   └── ChargePosting.js
├── Feature5_Billing/
│   ├── CalculationEngine.js
│   ├── InvoiceGeneration.js
│   └── DocumentExport.js
├── Feature6_Reporting/
│   ├── OccupancyDashboard.js
│   ├── RevenueReporting.js
│   └── AuditTrailViewer.js
├── Feature7_Security/
│   ├── AuthenticationSystem.js
│   ├── BackupRoutine.js
│   └── DatabaseRecovery.js
├── Shared/
│   └── DatabaseModels.js
├── api/
│   └── server.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution**: Run `npm install` to install dependencies

### Issue: "Port 3000 already in use"

**Solution**: Kill the process using port 3000 or change the port in `api/server.js`

### Issue: "Cannot GET /"

**Solution**: Make sure you're accessing `http://localhost:3000` (with port number)

### Issue: API calls return errors

**Solution**: Check browser console (F12) for detailed error messages

## Features at a Glance

| Feature      | Location             | Key Functions                |
| ------------ | -------------------- | ---------------------------- |
| Inventory    | Feature1_Inventory   | Room management, pricing     |
| Reservations | Feature2_Reservation | Search, book, update         |
| Payments     | Feature3_Transaction | Process, authorize, refund   |
| Check-In/Out | Feature4_CheckInOut  | Assign, status sync, charges |
| Billing      | Feature5_Billing     | Calculate, generate invoices |
| Reporting    | Feature6_Reporting   | Occupancy, revenue, audit    |
| Security     | Feature7_Security    | Auth, backup, recovery       |

## Next Steps

1. ✅ Start the server with `npm start`
2. ✅ Open `http://localhost:3000` in your browser
3. ✅ Test each feature using the UI
4. ✅ Check API responses in browser console (F12)
5. ✅ Review README.md for detailed documentation

---

For detailed API documentation, see README.md
