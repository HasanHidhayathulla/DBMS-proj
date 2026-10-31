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
│  │  /api/reporting     /api/security        /api/housekeeping  │  │
│  │  /api/services/requests                  /api/customer/reviews│
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
│ Feature 2: Reservation   │  │ │ Shared Models:           ││
│ Feature 3: Transactions  │  │ │ ├─ Room, User            ││
│ Feature 4: Check-In/Out  │  │ │ ├─ Reservation, Payment  ││
│ Feature 5: Billing       │  │ │ ├─ Invoice               ││
│ Feature 6: Reporting     │  │ │ ├─ GuestService          ││
│ Feature 7: Security      │  │ │ ├─ HousekeepingTask      ││
│ Feature 8: Guest Services│  │ │ └─ GuestReview           ││
│ ├─ GuestServices.js      │  │ └──────────────────────────┘│
│ ├─ HousekeepingMgmt.js   │  └──────────────────────────────┘
│ └─ GuestReviews.js       │
└──────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│         DATA LAYER (SQLite Database / Persistent DB)         │
└──────────────────────────────────────────────────────────────┘
```

## File Organization

```
FeaturesImplementation/
│
├─ public/                    (Frontend)
│  ├─ index.html             (Staff Dashboard UI)
│  ├─ customer.html          (Customer Online Booking UI)
│  ├─ portal.html            (Portal Selector UI)
│  ├─ styles.css             (Styling)
│  ├─ app.js                 (Staff Frontend logic)
│  └─ customer.js            (Customer Frontend logic)
│
├─ api/                       (Backend)
│  ├─ server.js              (Express API endpoints)
│  └─ db.js                  (SQLite database initialization)
│
├─ Feature1_Inventory/       (Business Logic Modules)
├─ Feature2_Reservation/
├─ Feature3_Transaction/
├─ Feature4_CheckInOut/
├─ Feature5_Billing/
├─ Feature6_Reporting/
├─ Feature7_Security/
├─ Feature8_GuestServices/
│  ├─ GuestServices.js
│  ├─ HousekeepingManagement.js
│  └─ GuestReviews.js
│
├─ Shared/                    (Shared Resources)
│  └─ DatabaseModels.js
│
├─ package.json              (Dependencies)
├─ SRS.md                    (Software Requirements Specification)
└─ README.md                 (Documentation)
```
