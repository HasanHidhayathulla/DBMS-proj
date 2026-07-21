# Hotel Management System - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│                    (HTML/CSS/JavaScript)                            │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Dashboard  │  │  Inventory   │  │ Reservations │  │ Payments│ │
│  │   Module    │  │    Module    │  │   Module     │  │ Module  │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │
│         │                 │                │               │       │
│         └─────────────────┼─────────────────┼───────────────┘       │
│                           │ (HTTP Requests) │                       │
│                           ▼                 ▼                       │
│                    ┌──────────────────────┐                        │
│                    │    Frontend App      │                        │
│                    │   (app.js/index.html)│                        │
│                    └─────────────┬────────┘                        │
└────────────────────────────────────┼────────────────────────────────┘
                                     │
                    ┌────────────────┴─────────────────┐
                    │   RESTful API Calls              │
                    │   (Fetch/CORS)                   │
                    ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    API LAYER (Express.js)                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 API Endpoints (server.js)                    │  │
│  │                                                              │  │
│  │  /api/rooms         /api/reservations    /api/payments      │  │
│  │  /api/users         /api/billing         /api/check-in      │  │
│  │  /api/reporting     /api/security        /api/backup        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│         ┌───────────────────────┼───────────────────────┐           │
│         ▼                       ▼                       ▼           │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐ │
│  │ Request Handler │   │ Middleware Layer │   │ Router Handler  │ │
│  │ (bodyParser)    │   │ (CORS, Auth)     │   │ (Express)       │ │
│  └─────────────────┘   └──────────────────┘   └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│   BUSINESS LOGIC LAYER   │  │   SHARED LAYER              │
│   (Feature Modules)      │  │   (DatabaseModels.js)       │
│                          │  │                              │
│ Feature 1: Inventory     │  │ ┌──────────────────────────┐│
│ ├─ RoomManagement.js     │  │ │ Shared Models:           ││
│ ├─ PricingAndTax.js      │  │ │ ├─ Room                  ││
│ ├─ UserRoleManagement.js │  │ │ ├─ User                  ││
│ └─ SystemVerification.js │  │ │ ├─ Reservation           ││
│                          │  │ │ ├─ Payment               ││
│ Feature 2: Reservation   │  │ │ └─ Invoice               ││
│ ├─ ReservationEngine.js  │  │ └──────────────────────────┘│
│ └─ StatusManagement.js   │  │                              │
│                          │  └──────────────────────────────┘
│ Feature 3: Transactions  │
│ ├─ PaymentGateway.js     │
│ ├─ RefundLogic.js        │
│ └─ FinancialRecords.js   │
│                          │
│ Feature 4: Check-In/Out  │
│ ├─ RoomAssignment.js     │
│ ├─ LiveStatusSync.js     │
│ └─ ChargePosting.js      │
│                          │
│ Feature 5: Billing       │
│ ├─ CalculationEngine.js  │
│ ├─ InvoiceGeneration.js  │
│ └─ DocumentExport.js     │
│                          │
│ Feature 6: Reporting     │
│ ├─ OccupancyDashboard.js │
│ ├─ RevenueReporting.js   │
│ └─ AuditTrailViewer.js   │
│                          │
│ Feature 7: Security      │
│ ├─ AuthenticationSystem  │
│ ├─ BackupRoutine.js      │
│ └─ DatabaseRecovery.js   │
└──────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│         DATA LAYER (Mock Database/Future DB)                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ In-Memory Mock Database:                               │ │
│  │                                                        │ │
│  │ - rooms[]              (Room inventory)                │ │
│  │ - users[]              (User accounts)                 │ │
│  │ - reservations[]       (Booking records)               │ │
│  │ - payments[]           (Transaction records)           │ │
│  │ - invoices[]           (Invoice records)               │ │
│  │                                                        │ │
│  │ Future Integration: SQLite3, PostgreSQL, MySQL        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Room Reservation Process

```
Customer
    │
    ├─> Search Available Rooms
    │   └─> ReservationEngine.searchAvailableRooms()
    │       └─> API: GET /api/reservations/available-rooms
    │           └─> Database Query
    │               └─> Return available rooms
    │
    ├─> Hold Room
    │   └─> ReservationEngine.holdRoom()
    │       └─> API: POST /api/reservations/hold-room
    │
    ├─> Create Reservation
    │   └─> ReservationEngine.createReservation()
    │       └─> API: POST /api/reservations
    │           └─> Database Insert
    │
    └─> Process Payment
        └─> PaymentGateway.processPayment()
            └─> API: POST /api/payments
                ├─> Authorize with gateway
                ├─> FinancialRecords.recordTransaction()
                └─> Update reservation status
```

### Check-In Process

```
Front Desk
    │
    ├─> Assign Room
    │   └─> RoomAssignment.assignRoom()
    │       └─> API: POST /api/check-in/assign-room
    │
    ├─> Check-In Guest
    │   └─> LiveStatusSync.updateRoomStatus()
    │       └─> API: POST /api/check-in
    │           └─> Update room status to "Occupied"
    │
    └─> Post Charges (if any)
        └─> ChargePosting.postCharge()
            └─> API: POST /api/charges
```

### Check-Out & Billing Process

```
Guest/Front Desk
    │
    ├─> Check-Out
    │   └─> LiveStatusSync.updateRoomStatus()
    │       └─> API: POST /api/check-out
    │           └─> Update room status to "Cleaning"
    │
    ├─> Calculate Total
    │   └─> CalculationEngine.calculateTotals()
    │       └─> API: POST /api/billing/calculate
    │
    ├─> Generate Invoice
    │   └─> InvoiceGeneration.generateInvoice()
    │       └─> API: POST /api/invoices
    │           └─> Database Insert
    │
    └─> Export Invoice
        └─> DocumentExport.exportInvoice()
            └─> API: GET /api/invoices/:id/export
                └─> Return invoice document
```

## Technology Stack

### Frontend

- **HTML5**: Structure and markup
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Interactivity and API integration
- **Fetch API**: HTTP requests to backend

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **body-parser**: JSON request parsing
- **CORS**: Cross-origin resource sharing

### Database (Current/Future)

- **Mock Database**: In-memory arrays (current)
- **SQLite3**: Lightweight SQL database (future)
- **PostgreSQL**: Advanced SQL database (future)

## File Organization

```
Features Implementation/
│
├─ public/                    (Frontend)
│  ├─ index.html             (Main UI)
│  ├─ styles.css             (Styling)
│  └─ app.js                 (Frontend logic)
│
├─ api/                       (Backend)
│  └─ server.js              (API endpoints)
│
├─ Feature1_Inventory/       (Business Logic)
├─ Feature2_Reservation/
├─ Feature3_Transaction/
├─ Feature4_CheckInOut/
├─ Feature5_Billing/
├─ Feature6_Reporting/
├─ Feature7_Security/
│
├─ Shared/                    (Shared Resources)
│  └─ DatabaseModels.js
│
├─ package.json              (Dependencies)
├─ README.md                 (Documentation)
└─ SETUP.md                  (Setup Guide)
```

## API Request/Response Flow

### Example: Create Reservation

**Request:**

```
POST /api/reservations
Content-Type: application/json

{
  "roomId": 1,
  "userId": 1,
  "checkInDate": "2026-05-10",
  "checkOutDate": "2026-05-15"
}
```

**Processing:**

1. API receives request
2. Validates input
3. Calls ReservationEngine.createReservation()
4. Inserts record into mock database
5. Returns response

**Response:**

```
{
  "success": true,
  "message": "Reservation created successfully",
  "reservation": {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "checkInDate": "2026-05-10",
    "checkOutDate": "2026-05-15",
    "status": "Confirmed"
  }
}
```

## Error Handling

- All API endpoints include try-catch blocks
- Errors are logged to console
- User-friendly error messages displayed in UI
- HTTP status codes (200, 400, 404, 500) returned appropriately

## Security Features

- CORS enabled for cross-origin requests
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- Password hashing capability (not yet implemented)
- JWT authentication ready (future implementation)

## Scalability Considerations

1. **Database**: Switch from mock to production database
2. **Caching**: Implement Redis for frequently accessed data
3. **Load Balancing**: Use multiple API instances
4. **Microservices**: Split features into separate services
5. **Message Queue**: Use RabbitMQ/Kafka for async operations

---

This architecture provides a solid foundation for a scalable and maintainable hotel management system.
