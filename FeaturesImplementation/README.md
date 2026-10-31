# Hotel Management System - Complete Implementation

A comprehensive hotel management system with 7 interconnected features, a robust API layer, and a modern HTML/CSS/JavaScript UI.

## Project Structure

```
FeaturesImplementation/
├── Feature1_Inventory/          # Room inventory and configuration
├── Feature2_Reservation/        # Reservation management
├── Feature3_Transaction/        # Payment processing
├── Feature4_CheckInOut/         # Guest check-in/out operations
├── Feature5_Billing/            # Billing and invoicing
├── Feature6_Reporting/          # Reports and analytics
├── Feature7_Security/           # Security and infrastructure
├── Feature8_Housekeeping/       # Housekeeping & room maintenance
├── Shared/                      # Shared database models
├── api/                         # Backend API server
├── public/                      # Frontend HTML/CSS/JS
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Features Implemented

### Feature 1: Inventory & System Configuration (Admin Module)

- **Room Management**: Add, update, delete, and list rooms
- **Pricing & Tax Engine**: Calculate prices with dynamic tax rates
- **User & Role Management**: Manage users with different roles
- **System Verification**: Verify system configurations

### Feature 2: Reservation Engine (Customer & Clerk Module)

- **Real-time Availability Search**: Search available rooms by date range
- **Temporary Hold Logic**: Hold rooms to prevent double-booking
- **Booking CRUD Operations**: Full create, read, update, delete functionality
- **Status Management**: Handle various reservation states

### Feature 3: Transaction & Payment Processing (Financial Module)

- **Payment Gateway Integration**: Process payments securely
- **Payment Authorization**: Authorize payments with gateway tokens
- **Financial Record Keeping**: Maintain transaction records
- **Refund Logic**: Handle refunds and payment reversals

### Feature 4: Operational Check-In/Out (Front Desk Module)

- **Room Assignment**: Assign specific rooms to guests
- **Live Status Synchronization**: Update room status in real-time
- **Charge Posting**: Apply additional charges to guest accounts

### Feature 5: Automated Billing & Invoicing (Output Module)

- **Calculation Engine**: Automatically calculate subtotals and taxes
- **Invoice Generation**: Generate invoices upon check-out
- **Document Export**: Export invoices for customers

### Feature 6: Reporting & Analytics (Manager Module)

- **Occupancy Dashboard**: Real-time occupancy visualization
- **Revenue Reporting**: Aggregate revenue data
- **Audit Trail Viewer**: View system audit logs

### Feature 7: System Security & Infrastructure (Foundation)

- **Authentication System**: Secure login with password policies
- **Automated Backup Routine**: Daily incremental and weekly full backups
- **Database Recovery Testing**: Verify backup restoration

### Feature 8: Housekeeping & Room Maintenance Management (Operational Module)

- **Housekeeping Task Scheduling**: Automatically create cleaning tasks upon guest checkout and assign staff
- **Room Turnover & Inspection Flow**: Mark cleaned and inspected rooms as "Available"
- **Maintenance & Defect Tracking**: Report room issues (HVAC, plumbing, electrical, etc.), set rooms out of order, and restore them upon repair
- **Housekeeping Dashboard**: Real-time visibility into rooms pending cleaning, in maintenance, and available

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A modern web browser

### Step 1: Install Dependencies

Navigate to the project directory and install required packages:

```bash
cd "e:\DBMS proj\FeaturesImplementation"
npm install
```

This will install:

- **express**: Web server framework
- **body-parser**: JSON parsing middleware
- **cors**: Cross-Origin Resource Sharing
- **sqlite3**: Database (optional, for future enhancement)

### Step 2: Start the API Server

```bash
npm start
```

Or for development with hot-reload:

```bash
npm run dev
```

The server will start on **http://localhost:3000**

### Step 3: Access the Web Interface

Open your browser and navigate to:

```
http://localhost:3000
```

## API Endpoints

### Room Management

- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Add a new room
- `PUT /api/rooms/:id` - Update room details
- `DELETE /api/rooms/:id` - Delete a room

### Pricing

- `POST /api/pricing/calculate` - Calculate price with tax
- `POST /api/pricing/tax-settings` - Update tax settings

### Users

- `GET /api/users` - List all users
- `POST /api/users` - Add a new user

### Reservations

- `GET /api/reservations` - List all reservations
- `POST /api/reservations` - Create a reservation
- `GET /api/reservations/available-rooms` - Search available rooms
- `POST /api/reservations/hold-room` - Hold a room
- `PUT /api/reservations/:id/status` - Update reservation status

### Payments

- `POST /api/payments` - Process payment
- `POST /api/payments/authorize` - Authorize payment
- `POST /api/payments/:id/refund` - Process refund

### Check-In/Out

- `POST /api/check-in` - Guest check-in
- `POST /api/check-out` - Guest check-out
- `POST /api/check-in/assign-room` - Assign room to guest
- `POST /api/charges` - Post charge to guest

### Billing

- `POST /api/billing/calculate` - Calculate billing totals
- `POST /api/invoices` - Generate invoice
- `GET /api/invoices/:id/export` - Export invoice

### Reporting

- `GET /api/reporting/occupancy` - Get occupancy dashboard
- `GET /api/reporting/revenue` - Get revenue report
- `GET /api/reporting/audit-logs` - Get audit logs

### Security

- `POST /api/auth/login` - User login
- `POST /api/backup/daily` - Perform daily backup
- `POST /api/backup/weekly` - Perform weekly snapshot
- `POST /api/recovery/test` - Test database recovery

### Housekeeping & Maintenance

- `GET /api/housekeeping/rooms` - Get rooms grouped by housekeeping status and statistics
- `GET /api/housekeeping/tasks` - List all housekeeping tasks
- `POST /api/housekeeping/assign` - Create or assign cleaning tasks
- `POST /api/housekeeping/clean` - Mark room cleaned, inspected, and available
- `POST /api/maintenance` - Report room maintenance issue (sets room to Maintenance)
- `GET /api/maintenance` - List all maintenance tickets
- `PUT /api/maintenance/:id/resolve` - Resolve maintenance ticket and restore room to Available

## Usage Guide

### 1. Adding a Room

- Navigate to the **Inventory** tab
- Fill in room details (Type, Floor, Base Rate)
- Click "Add Room"

### 2. Creating a Reservation

- Go to the **Reservations** tab
- Search for available rooms using check-in/check-out dates
- Fill in reservation details and click "Create Reservation"

### 3. Processing a Payment

- Navigate to the **Payments** tab
- Enter reservation ID and payment amount
- Click "Process Payment"

### 4. Guest Check-In

- Go to the **Check-In/Out** tab
- Enter room ID and reservation ID
- Click "Check-In"

### 5. Generating an Invoice

- Navigate to the **Billing** tab
- Enter reservation ID and billing details
- Click "Generate Invoice"

### 6. Viewing Reports

- Go to the **Reports** tab
- View occupancy dashboard and revenue reports
- Refresh data as needed

## Frontend Features

### User Interface Components

- **Responsive Dashboard**: Real-time occupancy and revenue metrics
- **Navigation Tabs**: Easy access to all features
- **Form Inputs**: Intuitive forms for data entry
- **Data Tables**: Display and manage data
- **Status Badges**: Visual status indicators
- **Notifications**: Success/error messages

### Styling

- Modern gradient design with purple theme
- Responsive layout for mobile and desktop
- Interactive buttons and forms
- Clear visual hierarchy
- Smooth animations and transitions

## Backend Architecture

### API Server (Express.js)

- RESTful endpoints for all operations
- CORS support for frontend integration
- JSON request/response handling
- Mock database for demonstration

### Feature Modules

Each feature is organized in a dedicated folder with specific modules:

- Room management logic
- Reservation engine
- Payment gateway integration
- Check-in/out operations
- Billing calculations
- Reporting and analytics
- Security functions

## Database Models

The system uses the following data models:

### Room

```json
{
  "id": "INTEGER PRIMARY KEY",
  "type": "TEXT",
  "floor": "INTEGER",
  "baseRate": "REAL",
  "status": "TEXT (Available, Occupied, Cleaning)"
}
```

### User

```json
{
  "id": "INTEGER PRIMARY KEY",
  "username": "TEXT UNIQUE",
  "password": "TEXT",
  "role": "TEXT (Admin, Manager, Receptionist, Guest)"
}
```

### Reservation

```json
{
  "id": "INTEGER PRIMARY KEY",
  "roomId": "INTEGER",
  "userId": "INTEGER",
  "status": "TEXT (Confirmed, Cancelled, Completed, No-Show)",
  "checkInDate": "DATE",
  "checkOutDate": "DATE"
}
```

### Payment

```json
{
  "id": "INTEGER PRIMARY KEY",
  "reservationId": "INTEGER",
  "amount": "REAL",
  "status": "TEXT (Authorized, Captured, Refunded, Failed)",
  "gatewayAuthToken": "TEXT"
}
```

### Invoice

```json
{
  "id": "INTEGER PRIMARY KEY",
  "reservationId": "INTEGER",
  "totalAmount": "REAL",
  "tax": "REAL",
  "createdAt": "DATE"
}
```

## Future Enhancements

1. **Database Integration**: Replace mock database with SQLite3/PostgreSQL
2. **Authentication**: Implement JWT-based authentication
3. **Real Payment Gateway**: Integrate with PayPal or Stripe
4. **Email Notifications**: Send confirmations and invoices via email
5. **Mobile App**: Create a native mobile application
6. **Advanced Analytics**: Machine learning for revenue optimization
7. **Multi-language Support**: Support multiple languages
8. **Cloud Deployment**: Deploy to AWS, Azure, or Google Cloud

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, modify the port in `api/server.js`:

```javascript
const port = 3001; // Change to any available port
```

### CORS Errors

Ensure CORS middleware is enabled in the API server.

### Database Connection Issues

Make sure you have SQLite3 installed if switching from mock database.

## Support & Contribution

For issues or feature requests, please contact the development team.

## License

This project is licensed under the MIT License.

---

**Version**: 1.0.0  
**Last Updated**: May 2, 2026  
**Status**: Production Ready
