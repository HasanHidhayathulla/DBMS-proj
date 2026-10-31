# Software Requirements Specification

## Hotel Management System

**IEEE Style SRS for FeaturesImplementation**

**Document Type:** Software Requirements Specification

**Version:** 1.1

**Date:** 2026-07-21

This document follows an IEEE-style SRS structure based on the standard organization of introduction, overall description, specific requirements, external interfaces, and nonfunctional requirements.

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and nonfunctional requirements for the Hotel Management System implemented in the `FeaturesImplementation` workspace. It describes the behavior of the backend API, the staff-facing dashboard, and the customer booking portal, along with the data, security, and operational constraints that apply to the system.

### 1.2 Document Conventions

The requirements in this document use the keyword **shall** to indicate mandatory system behavior.

### 1.3 Scope

The system is a hotel management platform that supports room inventory administration, reservations, payments, check-in/check-out operations, billing, reporting, security controls, customer self-service booking, guest special add-ons, housekeeping task management, and post-stay guest reviews.

The system is intended to support the following user groups:

- Hotel administrators who manage inventory, users, configuration, security, and reporting.
- Managers who supervise rooms, reservations, pricing, and reports.
- Front desk or staff users who perform operational tasks such as check-in, check-out, charge posting, housekeeping management, and guest request fulfillment.
- Customers who search for rooms, create bookings, view bookings, request add-on services, and submit ratings and reviews.

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
- **Add-on / Special Request**: Extra guest service requested for a booking (e.g. Airport Transfer, Extra Bed)
- **Housekeeping Task**: Room cleaning, maintenance, or inspection assignment

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
- A customer web portal for online booking, add-on requests, and post-stay reviews.
- Feature modules organized by business domain.

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
- Allow customers to browse rooms, book rooms online, view reservations, request add-on services, and leave post-stay ratings and reviews.
- Manage housekeeping and maintenance tasks for rooms.

### 2.3 User Classes and Characteristics

- **Administrator**: Full access to system configuration, user management, backups, recovery, and reports.
- **Manager**: Access to room, pricing, reservation, reporting, and operational data.
- **Staff/Receptionist**: Access to day-to-day operations such as reservation handling, check-in, check-out, charges, housekeeping, guest service requests, and invoicing.
- **Customer/Guest**: Access to browsing rooms, booking, viewing bookings, requesting add-ons, and leaving reviews through the customer portal.

### 2.4 Operating Environment

- Server runtime: Node.js
- Web framework: Express.js
- Database: SQLite-backed persistence
- Client environment: Modern browser with JavaScript enabled
- Target deployment: Local or intranet-hosted web application

## 3. Specific Requirements

### 3.1 Feature 1: Inventory and System Configuration
- **FR-1.1** The system shall allow authorized users to add a room with room type, floor, base rate, and default availability status.
- **FR-1.2** The system shall allow authorized users to list all rooms.
- **FR-1.3** The system shall allow authorized users to update an existing room’s type, floor, and base rate.
- **FR-1.4** The system shall allow authorized users to delete a room.
- **FR-1.5** The system shall prevent room management actions by unauthorized users.
- **FR-1.6** The system shall calculate pricing totals using base rate and tax rate inputs.
- **FR-1.7** The system shall allow authorized users to update tax settings.
- **FR-1.8** The system shall allow administrators to create users with username, password, and role.
- **FR-1.9** The system shall prevent duplicate usernames.
- **FR-1.10** The system shall validate passwords against the configured password policy.

### 3.2 Feature 2: Reservation Engine
- **FR-2.1** Search available rooms by check-in and check-out dates.
- **FR-2.2** Hold rooms temporarily for staff workflows.
- **FR-2.3** Create and store reservation status and details.
- **FR-2.4** Support reservation cancellations and compute refunds based on policy.

### 3.3 Feature 3: Transaction and Payment Processing
- **FR-3.1** Process payments for reservations.
- **FR-3.2** Store gateway authorization tokens.
- **FR-3.3** Handle refunds and update payment records.

### 3.4 Feature 4: Check-In and Check-Out
- **FR-4.1** Assign room to reservation upon arrival.
- **FR-4.2** Mark room status as Occupied at check-in and Cleaning at check-out.
- **FR-4.3** Post additional charges to guest accounts.

### 3.5 Feature 5: Billing and Invoicing
- **FR-5.1** Calculate subtotals, tax, and final billing totals.
- **FR-5.2** Generate and export invoices.

### 3.6 Feature 6: Reporting and Analytics
- **FR-6.1** Provide occupancy dashboard metrics.
- **FR-6.2** Provide daily, weekly, or monthly revenue reports.
- **FR-6.3** Provide audit log tracking.

### 3.7 Feature 7: Security and Infrastructure
- **FR-7.1** Authenticate users with passwords and session/token support.
- **FR-7.2** Enforce RBAC permissions.
- **FR-7.3** Execute daily backups, weekly snapshots, and recovery testing.

### 3.8 Feature 8: Guest Services, Housekeeping & Feedback Management
- **FR-8.1** The system shall allow customers and staff to create special add-on service requests (Airport Transfer, Extra Bed, Late Check-Out, Breakfast Package) associated with a booking confirmation number.
- **FR-8.2** The system shall allow staff to view and update the status of guest service requests (Pending, Approved, Fulfilled, Rejected).
- **FR-8.3** The system shall allow staff users to create housekeeping and maintenance tasks for specific rooms with priority levels and notes.
- **FR-8.4** The system shall allow staff users to list and update housekeeping task statuses (Pending, In Progress, Completed, Cancelled).
- **FR-8.5** The system shall allow customers to submit post-stay ratings (1-5 stars) and review comments using their confirmation number.
- **FR-8.6** The system shall display aggregated guest review metrics (average star rating and total review count) and individual guest reviews.

## 4. External Interface Requirements

### 4.1 User Interface Requirements
- Staff portal shall include dedicated navigation for Guest Services, Housekeeping & Reviews.
- Customer portal shall provide dedicated views for requesting add-on services and submitting post-stay ratings/reviews.

### 4.2 Software Interface Requirements
The backend shall expose REST JSON endpoints for Feature 8:
- `POST /api/customer/bookings/:confirmationNumber/services`
- `GET /api/customer/bookings/:confirmationNumber/services`
- `GET /api/services/requests`
- `PUT /api/services/requests/:id/status`
- `GET /api/housekeeping/tasks`
- `POST /api/housekeeping/tasks`
- `PUT /api/housekeeping/tasks/:id`
- `POST /api/customer/bookings/:confirmationNumber/review`
- `GET /api/customer/reviews`

## 5. Nonfunctional Requirements and Data Rules

### 5.1 Core Data Entities
- Room, User, Reservation, Payment, Invoice, AuditLog, GuestService, HousekeepingTask, GuestReview.

## 6. Acceptance Summary
The system is functionally complete when staff and customer users can interact with all 8 features seamlessly.

### 3.9 Feature 9: Room Maintenance & Facility Defect Management
- **FR-9.1** The system shall allow authorized staff to report maintenance issues with category, description, and priority, setting the room status to "Maintenance".
- **FR-9.2** The system shall allow authorized staff to resolve maintenance tickets, restoring the room status to "Available".
- **FR-9.3** The system shall provide an operational dashboard showing cleaning queue, rooms in maintenance, and available ready rooms.
