# Software Requirements Specification

## Hotel Management System

**IEEE Style SRS for FeaturesImplementation**

**Document Type:** Software Requirements Specification

**Version:** 1.0

**Date:** 2026-07-21

This document follows an IEEE-style SRS structure based on the standard organization of introduction, overall description, specific requirements, external interfaces, and nonfunctional requirements.

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and nonfunctional requirements for the Hotel Management System implemented in the `FeaturesImplementation` workspace. It describes the behavior of the backend API, the staff-facing dashboard, and the customer booking portal, along with the data, security, and operational constraints that apply to the system.

### 1.2 Document Conventions

The requirements in this document use the keyword **shall** to indicate mandatory system behavior.

### 1.3 Scope

The system is a hotel management platform that supports room inventory administration, reservations, payments, check-in/check-out operations, billing, reporting, security controls, and customer self-service booking. The current implementation uses a Node.js and Express.js backend, SQLite-backed persistence, and a browser-based frontend built with HTML, CSS, and JavaScript.

The system is intended to support the following user groups:

- Hotel administrators who manage inventory, users, configuration, security, and reporting.
- Managers who supervise rooms, reservations, pricing, and reports.
- Front desk or staff users who perform operational tasks such as check-in, check-out, and charge posting.
- Customers who search for rooms, create bookings, view bookings, and cancel eligible reservations.

### 1.4 Definitions, Acronyms, and Abbreviations

- **API**: Application Programming Interface
- **RBAC**: Role-Based Access Control
- **SRS**: Software Requirements Specification
- **JWT**: JSON Web Token
- **SQLite**: Lightweight relational database used by the backend
- **Booking**: A customer reservation record created through the customer portal
- **Reservation**: A system record representing a room booking or hotel stay
- **Check-in**: The process of marking a guest as arrived and a room as occupied
- **Check-out**: The process of marking a guest as departed and a room as cleaning

### 1.5 References

- `README.md`
- `ARCHITECTURE.md`
- `CUSTOMER_BOOKING_SYSTEM.md`
- `TEST_SCENARIOS.js`
- `api/server.js`
- `Shared/DatabaseModels.js`
- `public/app.js`
- `public/customer.js`

### 1.6 Document Overview

Section 2 describes the overall product context. Section 3 defines the functional requirements. Section 4 lists external interface requirements. Section 5 covers data requirements and business rules. Section 6 defines nonfunctional requirements. Section 7 describes assumptions and constraints.

## 2. Overall Description

### 2.1 Product Perspective

The system is a single-hotel management application composed of:

- A backend API server that exposes REST endpoints.
- A staff/admin web interface for operational management.
- A customer web portal for online booking and booking self-service.
- Feature modules organized by business domain.

The backend persists data in SQLite and also uses in-memory/session-based structures for authentication state and runtime coordination. The API provides both protected staff endpoints and public customer booking endpoints.

### 2.2 Product Functions

At a high level, the system shall:

- Manage room inventory, room status, and pricing configuration.
- Manage users and roles.
- Search availability and create reservations.
- Process payments, refunds, and financial records.
- Support front desk check-in, check-out, room assignment, and additional charges.
- Generate billing totals, invoices, and invoice exports.
- Provide occupancy, revenue, and audit reporting.
- Authenticate users, manage sessions and tokens, and support backup and recovery routines.
- Allow customers to browse rooms, book rooms online, view reservations, and cancel eligible bookings.

### 2.3 User Classes and Characteristics

- **Administrator**: Full access to system configuration, user management, backups, recovery, and reports.
- **Manager**: Access to room, pricing, reservation, reporting, and operational data.
- **Staff/Receptionist**: Access to day-to-day operations such as reservation handling, check-in, check-out, charges, and invoicing.
- **Customer/Guest**: Access to browsing rooms, booking, viewing bookings, and cancellation through the customer portal.

### 2.4 Operating Environment

- Server runtime: Node.js
- Web framework: Express.js
- Database: SQLite-backed persistence
- Client environment: Modern browser with JavaScript enabled
- Target deployment: Local or intranet-hosted web application

### 2.5 Design and Implementation Constraints

- The backend shall expose REST-style JSON endpoints.
- Authentication shall support session-based access and token-based fallback.
- Role-based authorization shall gate protected administrative and reporting features.
- Customer booking functions shall remain accessible without staff login.
- The current implementation relies on local filesystem and SQLite-backed data storage rather than a distributed cloud database.

### 2.6 Assumptions and Dependencies

- Room inventory data exists before reservations are created.
- The browser client can reach the backend at `http://localhost:3000` in the current development setup.
- Email-based lookup is used for customer booking retrieval.
- Payment gateway and backup/recovery functions are implemented as internal workflow operations rather than integrations with external third-party services in the current version.

## 3. Specific Requirements

### 3.1 Feature 1: Inventory and System Configuration

#### 3.1.1 Room Management

- **FR-1.1** The system shall allow authorized users to add a room with room type, floor, base rate, and default availability status.
- **FR-1.2** The system shall allow authorized users to list all rooms.
- **FR-1.3** The system shall allow authorized users to update an existing room’s type, floor, and base rate.
- **FR-1.4** The system shall allow authorized users to delete a room.
- **FR-1.5** The system shall prevent room management actions by unauthorized users.

#### 3.1.2 Pricing and Tax

- **FR-1.6** The system shall calculate pricing totals using base rate and tax rate inputs.
- **FR-1.7** The system shall allow authorized users to update tax settings.

#### 3.1.3 User and Role Management

- **FR-1.8** The system shall allow administrators to create users with username, password, and role.
- **FR-1.9** The system shall prevent duplicate usernames.
- **FR-1.10** The system shall validate passwords against the configured password policy before user creation.
- **FR-1.11** The system shall list users for administrators.

#### 3.1.4 System Verification

- **FR-1.12** The system shall provide a system verification action that checks core configurations.

### 3.2 Feature 2: Reservation Engine

- **FR-2.1** The system shall allow users to search available rooms by check-in and check-out dates.
- **FR-2.2** The system shall return rooms currently available for reservation.
- **FR-2.3** The system shall allow authenticated staff users to place a temporary hold on a room.
- **FR-2.4** The system shall allow authenticated users to create a reservation for a room and date range.
- **FR-2.5** The system shall store reservation status and timestamps.
- **FR-2.6** The system shall allow authorized users to list all reservations.
- **FR-2.7** The system shall allow authorized users to update reservation status.
- **FR-2.8** The system shall allow authorized users to cancel reservations.
- **FR-2.9** The system shall process refunds for eligible payments when a reservation is cancelled.

### 3.3 Feature 3: Transaction and Payment Processing

- **FR-3.1** The system shall allow authenticated users to process a payment for a reservation.
- **FR-3.2** The system shall allow payment authorization using a generated gateway token.
- **FR-3.3** The system shall store financial records for transactions.
- **FR-3.4** The system shall allow refunds for authorized or completed payments according to business rules.
- **FR-3.5** The system shall persist payment status, amount, and refund information.

### 3.4 Feature 4: Check-In and Check-Out

- **FR-4.1** The system shall allow staff users to assign a room to a reservation during check-in preparation.
- **FR-4.2** The system shall mark a room as occupied during check-in.
- **FR-4.3** The system shall mark a room as cleaning during check-out.
- **FR-4.4** The system shall allow staff users to post additional charges to a reservation.
- **FR-4.5** The system shall synchronize room status changes with the backend data store.

### 3.5 Feature 5: Billing and Invoicing

- **FR-5.1** The system shall calculate billing totals from subtotal and tax rate values.
- **FR-5.2** The system shall generate an invoice for a reservation.
- **FR-5.3** The system shall store invoice records with reservation reference, total amount, tax, and creation timestamp.
- **FR-5.4** The system shall allow invoice export for authorized users.

### 3.6 Feature 6: Reporting and Analytics

- **FR-6.1** The system shall provide an occupancy dashboard showing total rooms, occupied rooms, available rooms, and occupancy rate.
- **FR-6.2** The system shall provide revenue reporting with a selectable timeframe parameter.
- **FR-6.3** The system shall provide an audit log viewer for authorized users.
- **FR-6.4** The system shall restrict reporting access to authorized roles only.

### 3.7 Feature 7: Security and Infrastructure

- **FR-7.1** The system shall support user login with username and password.
- **FR-7.2** The system shall generate an authentication token on successful login.
- **FR-7.3** The system shall support server-side sessions.
- **FR-7.4** The system shall allow authenticated users to query the current authenticated identity.
- **FR-7.5** The system shall allow logout and session destruction.
- **FR-7.6** The system shall restrict protected endpoints using authentication and role checks.
- **FR-7.7** The system shall support daily backup, weekly backup snapshot, and database recovery test actions for administrators.

### 3.8 Feature 8: Housekeeping and Room Maintenance Management

- **FR-8.1** The system shall automatically generate a housekeeping cleaning task upon guest check-out.
- **FR-8.2** The system shall allow authorized staff to assign cleaning tasks to personnel with priority and type specifications.
- **FR-8.3** The system shall allow authorized users to mark a cleaned and inspected room as "Available".
- **FR-8.4** The system shall allow authorized users to report room maintenance defects across categories (Plumbing, Electrical, HVAC, Furniture, Other) and set the room status to "Maintenance".
- **FR-8.5** The system shall allow authorized users to resolve maintenance requests and return the room status to "Available".
- **FR-8.6** The system shall provide real-time housekeeping statistics including rooms pending cleaning, under maintenance, and ready for occupancy.

### 3.9 Customer Booking Portal

- **FR-8.1** The system shall allow customers to search rooms by check-in and check-out dates.
- **FR-8.2** The system shall allow customers to filter room selection by room type in the portal UI.
- **FR-8.3** The system shall display room information including type, floor, amenities, and calculated price.
- **FR-8.4** The system shall allow customers to create a booking with customer name, email, phone, stay dates, room selection, and payment method.
- **FR-8.5** The system shall generate a confirmation number for each booking.
- **FR-8.6** The system shall store customer bookings and related payment records.
- **FR-8.7** The system shall allow customers to retrieve bookings by email.
- **FR-8.8** The system shall allow customers to retrieve a booking by confirmation number.
- **FR-8.9** The system shall allow customers to cancel eligible bookings.
- **FR-8.10** The system shall calculate and display a refund amount based on cancellation timing.
- **FR-8.11** The system shall process refunds automatically for online payments when a booking is cancelled.

## 4. External Interface Requirements

### 4.1 User Interface Requirements

#### 4.1.1 Staff/Admin Web Interface

- The interface shall provide a dashboard-style layout for inventory, reservations, payments, check-in/check-out, billing, reporting, and security tasks.
- The interface shall support forms, tables, status badges, and notification messages.
- The interface shall be responsive for desktop and mobile browser widths.

#### 4.1.2 Customer Web Portal

- The interface shall provide a room browsing view.
- The interface shall provide a booking form and booking confirmation experience.
- The interface shall provide a bookings lookup and cancellation experience.
- The interface shall present price breakdowns including tax and totals.

### 4.2 Software Interface Requirements

The backend shall expose JSON endpoints consistent with the current implementation, including but not limited to:

- `/api/rooms`
- `/api/pricing/calculate`
- `/api/pricing/tax-settings`
- `/api/users`
- `/api/system/verify`
- `/api/reservations`
- `/api/reservations/available-rooms`
- `/api/reservations/hold-room`
- `/api/payments`
- `/api/payments/authorize`
- `/api/payments/:id/refund`
- `/api/check-in`
- `/api/check-out`
- `/api/check-in/assign-room`
- `/api/charges`
- `/api/billing/calculate`
- `/api/invoices`
- `/api/invoices/:id/export`
- `/api/reporting/occupancy`
- `/api/reporting/revenue`
- `/api/reporting/audit-logs`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/backup/daily`
- `/api/backup/weekly`
- `/api/recovery/test`
- `/api/customer/bookings`
- `/api/customer/bookings/:confirmationNumber`
- `/api/customer/bookings/:confirmationNumber/cancel`

### 4.3 Communication Interfaces

- The system shall communicate using HTTP over localhost in the current development setup.
- The system shall exchange JSON request and response bodies for API operations.
- The browser client shall use the Fetch API for API communication.

## 5. Other Nonfunctional Requirements and Data Rules

### 5.1 Core Data Entities

The system shall maintain records for at least the following entities:

- Rooms
- Users
- Reservations
- Payments
- Invoices
- Audit logs
- Housekeeping tasks
- Maintenance requests

### 5.2 Data Model Requirements

#### 5.2.1 Room

The room entity shall include room type, floor, base rate, and status.

#### 5.2.2 User

The user entity shall include username, password hash or stored password reference, and role.

#### 5.2.3 Reservation

The reservation entity shall include room reference, user reference where applicable, customer identity fields for customer bookings, check-in date, check-out date, status, timestamps, total price, payment method, and confirmation number where applicable.

#### 5.2.4 Payment

The payment entity shall include reservation reference, amount, status, method, transaction identifier, refund amount, and refund timestamps where applicable.

#### 5.2.5 Invoice

The invoice entity shall include reservation reference, total amount, tax amount, and creation timestamp.

#### 5.2.6 Audit Log

The audit log entity shall include action, details, and timestamp.

### 5.3 Business Rules

- **BR-1** Room types may include Single, Double, Suite, and Deluxe, or other types configured by administrators.
- **BR-2** Room status values shall represent operational state such as Available, Occupied, and Cleaning.
- **BR-3** User roles shall control access to protected features.
- **BR-4** Customer bookings shall require a valid email address for retrieval.
- **BR-5** Customer booking cancellations shall compute refund percentage based on days remaining before check-in.
- **BR-6** Refund logic shall follow the timing policy implemented in the customer portal and reservation cancellation workflow.
- **BR-7** Online payments shall generate payment records automatically at booking time.
- **BR-8** Cash-at-hotel bookings shall be recorded without an online payment capture workflow in the customer portal flow.
- **BR-9** Protected administrative and reporting endpoints shall require authentication.

### 5.4 Customer Cancellation Policy

The customer booking cancellation logic shall apply the following policy:

- 100% refund when cancellation occurs 7 or more days before check-in.
- 50% refund when cancellation occurs 2 to 6 days before check-in.
- 0% refund when cancellation occurs less than 2 days before check-in.

### 5.5 Security Requirements

- **NFR-1** Passwords shall be validated against policy before account creation.
- **NFR-2** Passwords shall not be stored in plaintext in the intended data model.
- **NFR-3** The system shall use session support and token validation for authenticated access.
- **NFR-4** The system shall restrict sensitive endpoints based on user role.
- **NFR-5** The system shall reject unauthorized access to protected pages and API routes.

### 5.6 Performance Requirements

- **NFR-6** Room search and booking lookup operations shall return promptly for typical hotel-sized datasets.
- **NFR-7** The UI shall update booking and room status information without requiring full-page refreshes for normal workflow actions.

### 5.7 Reliability and Availability Requirements

- **NFR-8** The system shall preserve reservation, payment, invoice, and audit data across server restarts through the database layer.
- **NFR-9** Backup and recovery functions shall be available to administrators.

### 5.8 Usability Requirements

- **NFR-10** The system shall provide clear labels, status indicators, and confirmation messages for operational tasks.
- **NFR-11** The customer portal shall support a simple booking flow with visible room pricing and refund information.

### 5.9 Maintainability Requirements

- **NFR-12** Business logic shall remain organized into feature-based modules.
- **NFR-13** The API layer shall remain separated from the frontend assets and feature modules.
- **NFR-14** Shared database models shall remain centralized for consistent schema expectations.

### 5.10 Compatibility Requirements

- **NFR-15** The system shall operate in modern desktop and mobile browsers with JavaScript enabled.
- **NFR-16** The system shall run on Node.js in the current implementation environment.

## 6. Assumptions, Dependencies, and Constraints

### 6.1 Assumptions

- The system is managed by a single hotel instance rather than a multi-property chain.
- The development deployment uses a local backend server on port 3000.
- Customer booking lookup is performed using email or confirmation number.

### 6.2 Dependencies

- Express.js for backend routing.
- SQLite for persistence.
- `express-session` for session handling.
- Browser Fetch API for frontend communication.

### 6.3 Constraints

- The current implementation is designed around a local development database and mock-runtime features rather than production-grade distributed infrastructure.
- External payment, email delivery, and document generation integrations are represented in workflow form and can be extended later.
- Protected pages such as the portal and documentation view require authentication in the backend routing layer.

## 7. Acceptance Summary

The system shall be considered functionally complete when the following conditions are met:

- Staff users can manage rooms, users, reservations, payments, check-in/out, billing, and reports.
- Customers can browse rooms, create bookings, view bookings, and cancel eligible bookings.
- Authentication and authorization protect staff/admin operations.
- Core records persist in the database and are available for reporting and audit workflows.
- Backup and recovery actions are available to administrators.

## 8. Appendix: Representative Endpoint Map

### 8.1 Inventory

- `GET /api/rooms`
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`

### 8.2 Reservations

- `GET /api/reservations/available-rooms`
- `POST /api/reservations/hold-room`
- `POST /api/reservations`
- `GET /api/reservations`
- `PUT /api/reservations/:id/status`
- `DELETE /api/reservations/:id`

### 8.3 Payments and Billing

- `POST /api/payments`
- `POST /api/payments/authorize`
- `POST /api/payments/:id/refund`
- `POST /api/billing/calculate`
- `POST /api/invoices`
- `GET /api/invoices/:id/export`

### 8.4 Reporting and Security

- `GET /api/reporting/occupancy`
- `GET /api/reporting/revenue`
- `GET /api/reporting/audit-logs`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/backup/daily`
- `POST /api/backup/weekly`
- `POST /api/recovery/test`

### 8.5 Housekeeping and Maintenance

- `GET /api/housekeeping/rooms`
- `GET /api/housekeeping/tasks`
- `POST /api/housekeeping/assign`
- `POST /api/housekeeping/clean`
- `POST /api/maintenance`
- `GET /api/maintenance`
- `PUT /api/maintenance/:id/resolve`

### 8.6 Customer Portal

- `POST /api/customer/bookings`
- `GET /api/customer/bookings`
- `GET /api/customer/bookings/:confirmationNumber`
- `POST /api/customer/bookings/:confirmationNumber/cancel`
