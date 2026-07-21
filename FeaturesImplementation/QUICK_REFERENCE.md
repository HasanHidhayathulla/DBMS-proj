# Quick Reference Guide

## Getting Started (30 seconds)

```bash
cd "e:\DBMS proj\FeaturesImplementation"
npm install
npm start
# Open http://localhost:3000 in browser
```

---

## Main Features at a Glance

### 🏨 Dashboard Tab

- **View**: Occupancy status, revenue, total rooms
- **Action**: Refresh data with buttons

### 📦 Inventory Tab

- **Add Room**: Type, Floor, Base Rate
- **Price Calculator**: Subtotal + Tax calculation
- **Room List**: View all rooms with status

### 🛏️ Reservations Tab

- **Search**: Find available rooms by dates
- **Create**: Make a new reservation
- **Update**: Change reservation status

### 💳 Payments Tab

- **Process**: Take payment from guest
- **Authorize**: Hold funds temporarily
- **Refund**: Return money to guest

### 🚪 Check-In/Out Tab

- **Check-In**: Register guest arrival
- **Check-Out**: Register guest departure
- **Charges**: Add extra fees (room service, etc.)

### 💰 Billing Tab

- **Calculate**: Figure out total with taxes
- **Invoice**: Generate bill for guest

### 📊 Reports Tab

- **Occupancy**: How many rooms are filled
- **Revenue**: How much money made today
- **Audit Logs**: History of all actions

### 🔒 Security Tab

- **Login**: Authenticate user
- **Backup**: Save database data
- **Recovery**: Test backup restoration

---

## Common Workflows

### Workflow 1: Book a Room (3 steps)

1. Go to **Reservations** → Search dates → Select room
2. Go to **Payments** → Enter amount → Process payment
3. Done! Reservation created

### Workflow 2: Guest Arrival (2 steps)

1. Go to **Check-In/Out** → Enter room & reservation ID → Check-In
2. (Optional) Post any charges (room service, etc.)

### Workflow 3: Guest Departure (3 steps)

1. Go to **Check-In/Out** → Enter room ID → Check-Out
2. Go to **Billing** → Enter amount & tax → Generate invoice
3. Done! Guest billed and room ready for cleaning

### Workflow 4: Add New Room (1 step)

1. Go to **Inventory** → Enter room details → Add Room
2. Done! Room added to inventory

---

## API Quick Reference

| Action              | Endpoint                            | Method |
| ------------------- | ----------------------------------- | ------ |
| List rooms          | `/api/rooms`                        | GET    |
| Add room            | `/api/rooms`                        | POST   |
| Update room         | `/api/rooms/:id`                    | PUT    |
| Delete room         | `/api/rooms/:id`                    | DELETE |
| Search availability | `/api/reservations/available-rooms` | GET    |
| Create reservation  | `/api/reservations`                 | POST   |
| Process payment     | `/api/payments`                     | POST   |
| Authorize payment   | `/api/payments/authorize`           | POST   |
| Refund              | `/api/payments/:id/refund`          | POST   |
| Check-in            | `/api/check-in`                     | POST   |
| Check-out           | `/api/check-out`                    | POST   |
| Generate invoice    | `/api/invoices`                     | POST   |
| Occupancy           | `/api/reporting/occupancy`          | GET    |
| Revenue             | `/api/reporting/revenue`            | GET    |

---

## File Locations

| What               | Where                   |
| ------------------ | ----------------------- |
| Website            | `public/index.html`     |
| Styling            | `public/styles.css`     |
| Frontend code      | `public/app.js`         |
| Backend server     | `api/server.js`         |
| Room logic         | `Feature1_Inventory/`   |
| Reservation logic  | `Feature2_Reservation/` |
| Payment logic      | `Feature3_Transaction/` |
| Check-in/out logic | `Feature4_CheckInOut/`  |
| Billing logic      | `Feature5_Billing/`     |
| Reports logic      | `Feature6_Reporting/`   |
| Security logic     | `Feature7_Security/`    |

---

## Keyboard Shortcuts

| Shortcut           | Action                       |
| ------------------ | ---------------------------- |
| `F12`              | Open Developer Console       |
| `Ctrl + Shift + I` | Open Inspector               |
| `Ctrl + R`         | Refresh page                 |
| `Tab`              | Navigate between form fields |
| `Enter`            | Submit form                  |

---

## Error Messages & Solutions

| Error                          | Solution                                     |
| ------------------------------ | -------------------------------------------- |
| "Cannot GET /"                 | Make sure you're at http://localhost:3000    |
| "Port 3000 already in use"     | Kill the process or change port in server.js |
| "Cannot find module 'express'" | Run `npm install`                            |
| "API request failed"           | Check if server is running with `npm start`  |
| "Form won't submit"            | Check browser console for errors (F12)       |

---

## Form Fields Guide

### Room Form

- **Room Type**: Single, Double, Suite, Deluxe, etc.
- **Floor Number**: 1, 2, 3, 4, etc.
- **Base Rate**: Price per night (e.g., 150.00)

### Reservation Form

- **Room ID**: The ID of room to book
- **User ID**: The ID of person booking
- **Check-In**: Start date
- **Check-Out**: End date

### Payment Form

- **Reservation ID**: Which reservation to pay for
- **Amount**: How much to charge

### Billing Form

- **Subtotal**: Room charges total
- **Tax Rate**: Percentage (e.g., 8.5)

---

## Status Codes (Badges)

| Status    | Color  | Meaning               |
| --------- | ------ | --------------------- |
| Available | Green  | Room is ready         |
| Occupied  | Red    | Guest is in room      |
| Cleaning  | Orange | Room being prepared   |
| Confirmed | Blue   | Reservation confirmed |
| Cancelled | Red    | Reservation cancelled |

---

## Sample Test Data

### Sample Room

- Type: Deluxe Suite
- Floor: 3
- Rate: $250/night

### Sample Reservation

- Room ID: 1
- User ID: 1
- Check-in: 2026-05-10
- Check-out: 2026-05-15

### Sample Payment

- Reservation ID: 1
- Amount: $1,250.00

---

## Tips & Tricks

1. **Quick Room Search**: Use the Reservations tab to instantly see which rooms are available
2. **Bulk Pricing**: Use the Pricing tab to test prices before adding rooms
3. **Check Status**: The Dashboard always shows current occupancy rate
4. **Mobile Friendly**: Works on phones and tablets too
5. **Dark Mode**: Use browser's reader mode for easier reading

---

## Getting Help

### Check These First:

1. Is the server running? (`npm start`)
2. Is it on the right port? (3000)
3. Are there browser errors? (F12 console)
4. Is your data valid? (Check form fields)

### For More Info:

- Read `README.md` for detailed docs
- Check `ARCHITECTURE.md` for system design
- Review `SETUP.md` for setup instructions

---

## Performance Tips

1. **Clear old data**: Refresh page to start fresh
2. **Check reports**: Dashboard shows key metrics
3. **Monitor occupancy**: Check occupancy dashboard regularly
4. **Review revenue**: Check revenue reports daily
5. **Backup often**: Run backups weekly

---

## Common Questions

**Q: Can I access the system from another computer?**
A: Yes, but you need to change `localhost` to the server's IP address in browser.

**Q: Can I use a real database instead of mock data?**
A: Yes, modify `api/server.js` to use SQLite3 or PostgreSQL.

**Q: How do I add more users?**
A: Go to Inventory tab and use the user management form (coming soon in full version).

**Q: Can I export reports?**
A: Currently shows in-browser. Export functionality can be added.

**Q: Is data saved between sessions?**
A: No, mock database resets when server restarts. Use real DB for persistence.

---

## Useful Commands

```bash
# Start server
npm start

# Install dependencies
npm install

# Kill process on port 3000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Check if server is running
curl http://localhost:3000
```

---

**Last Updated**: May 2, 2026
**Version**: 1.0
