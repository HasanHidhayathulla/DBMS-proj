// Customer Portal JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
const TAX_RATE = 0.08; // 8% tax

// State Management
let currentUser = null;
let selectedRoom = null;
let selectedPaymentMethod = null;
let pendingCancellation = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('searchCheckIn').min = today;
    document.getElementById('searchCheckOut').min = today;
    
    // Load initial data
    loadMyBookings();
});

// ========== TAB SWITCHING ==========
function switchCustomerTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.customer-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.customer-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
        event.target.classList.add('active');
    }
}

// ========== MESSAGE DISPLAY ==========
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// ========== ROOM SEARCH & BROWSE ==========
function searchRooms() {
    const checkIn = document.getElementById('searchCheckIn').value;
    const checkOut = document.getElementById('searchCheckOut').value;
    const roomType = document.getElementById('searchRoomType').value;
    
    if (!checkIn || !checkOut) {
        showMessage('Please select check-in and check-out dates', 'error');
        return;
    }
    
    // Validate dates
    if (new Date(checkIn) >= new Date(checkOut)) {
        showMessage('Check-out date must be after check-in date', 'error');
        return;
    }
    
    // Fetch available rooms
    const query = `?checkInDate=${checkIn}&checkOutDate=${checkOut}${roomType ? '&roomType=' + roomType : ''}`;
    
    fetch(`${API_BASE_URL}/reservations/available-rooms${query}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.availableRooms) {
                displayRooms(data.availableRooms, checkIn, checkOut);
            } else {
                showMessage('No available rooms for selected dates', 'info');
                document.getElementById('roomsList').innerHTML = '<p style="text-align: center; color: #666;">No rooms available</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error searching rooms', 'error');
        });
}

function displayRooms(rooms, checkIn, checkOut) {
    const roomsList = document.getElementById('roomsList');
    roomsList.innerHTML = '';
    
    if (rooms.length === 0) {
        roomsList.innerHTML = '<p style="text-align: center; color: #666;">No available rooms found</p>';
        return;
    }
    
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    
    rooms.forEach(room => {
        const totalPrice = room.baseRate * nights;
        const tax = totalPrice * TAX_RATE;
        const finalPrice = totalPrice + tax;
        
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.innerHTML = `
            <div class="room-image">
                ${getRoomEmoji(room.type)}
            </div>
            <div class="room-info">
                <div class="room-title">${room.type} Room</div>
                <div class="room-details">
                    <div>🛏️ Floor ${room.floor}</div>
                    <div>${nights} night${nights > 1 ? 's' : ''}</div>
                </div>
                <div class="room-amenities">
                    <span class="amenity-tag">WiFi</span>
                    <span class="amenity-tag">AC</span>
                    <span class="amenity-tag">TV</span>
                </div>
                <div class="room-pricing">
                    <div>
                        <div style="font-size: 12px; color: #666;">$${room.baseRate}/night</div>
                        <div class="price">$${finalPrice.toFixed(2)}</div>
                        <div style="font-size: 12px; color: #999;">Incl. tax</div>
                    </div>
                    <button class="book-btn" onclick="openBookingModal(${room.id}, '${room.type}', ${room.baseRate}, '${checkIn}', '${checkOut}', ${nights})">Book Now</button>
                </div>
            </div>
        `;
        roomsList.appendChild(roomCard);
    });
}

function getRoomEmoji(roomType) {
    const emojis = {
        'Single': '🛏️',
        'Double': '🛏️🛏️',
        'Suite': '👑',
        'Deluxe': '💎'
    };
    return emojis[roomType] || '🏠';
}

// ========== BOOKING MODAL ==========
function openBookingModal(roomId, roomType, baseRate, checkIn, checkOut, nights) {
    selectedRoom = { id: roomId, type: roomType, baseRate: baseRate };
    
    // Populate form
    document.getElementById('bookingRoomType').value = roomType;
    document.getElementById('bookingCheckIn').value = checkIn;
    document.getElementById('bookingCheckOut').value = checkOut;
    
    // Calculate pricing
    updateBookingPrice(baseRate, nights);
    
    // Reset payment method
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('onlinePaymentForm').classList.remove('show');
    
    // Show modal
    document.getElementById('bookingModal').classList.add('show');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('show');
    selectedRoom = null;
    document.getElementById('bookingModal').querySelector('form').reset();
}

function updateBookingPrice(baseRate, nights) {
    const subtotal = baseRate * nights;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    document.getElementById('pricePerNight').textContent = `$${baseRate.toFixed(2)}`;
    document.getElementById('numberOfNights').textContent = nights;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.getElementById('option-online').classList.toggle('selected', method === 'online');
    document.getElementById('option-cash').classList.toggle('selected', method === 'cash');
    
    // Show/hide payment form
    const form = document.getElementById('onlinePaymentForm');
    if (method === 'online') {
        form.classList.add('show');
    } else {
        form.classList.remove('show');
    }
}

function submitBooking(event) {
    event.preventDefault();
    
    if (!selectedPaymentMethod) {
        showMessage('Please select a payment method', 'error');
        return;
    }
    
    // Validate required fields
    const name = document.getElementById('bookingName').value;
    const email = document.getElementById('bookingEmail').value;
    const phone = document.getElementById('bookingPhone').value;
    
    if (!name || !email || !phone) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // If online payment, validate card details
    if (selectedPaymentMethod === 'online') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        
        if (!cardNumber || !cardExpiry || !cardCVV) {
            showMessage('Please enter complete card details', 'error');
            return;
        }
    }
    
    // Create booking
    createBooking(name, email, phone);
}

function createBooking(name, email, phone) {
    const checkIn = document.getElementById('bookingCheckIn').value;
    const checkOut = document.getElementById('bookingCheckOut').value;
    const totalPriceText = document.getElementById('totalPrice').textContent;
    const totalPrice = parseFloat(totalPriceText.replace('$', ''));
    
    const bookingData = {
        roomId: selectedRoom.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: totalPrice,
        paymentMethod: selectedPaymentMethod,
        cardNumber: selectedPaymentMethod === 'online' ? document.getElementById('cardNumber').value : null,
        cardExpiry: selectedPaymentMethod === 'online' ? document.getElementById('cardExpiry').value : null,
        cardCVV: selectedPaymentMethod === 'online' ? document.getElementById('cardCVV').value : null
    };
    
    // Show loading
    showMessage('Processing your booking...', 'info');
    
    fetch(`${API_BASE_URL}/customer/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage(`✓ Booking successful! Confirmation #: ${data.confirmation}`, 'success');
            closeBookingModal();
            
            // Show booking details
            setTimeout(() => {
                alert(`
Booking Confirmed!

Confirmation Number: ${data.confirmation}
Room: ${selectedRoom.type}
Check-in: ${checkIn}
Check-out: ${checkOut}
Total Price: $${totalPrice.toFixed(2)}
Payment: ${selectedPaymentMethod === 'online' ? 'Online' : 'Cash at Hotel'}

A confirmation email has been sent to ${email}
                `);
                
                // Refresh bookings
                loadMyBookings();
                switchCustomerTab('mybookings');
            }, 1000);
        } else {
            showMessage(data.message || 'Booking failed. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error creating booking', 'error');
    });
}

// ========== MY BOOKINGS ==========
function loadMyBookings() {
    // Get email from localStorage
    let email = localStorage.getItem('customerEmail');
    
    if (!email) {
        document.getElementById('bookingsList').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Complete a booking to view your reservations here.</p>';
        return;
    }
    
    fetch(`${API_BASE_URL}/customer/bookings?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.bookings) {
                displayMyBookings(data.bookings, email);
            } else {
                document.getElementById('bookingsList').innerHTML = '<p style="text-align: center; color: #666;">No bookings found</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error loading bookings', 'error');
        });
}

function displayMyBookings(bookings, email) {
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p style="text-align: center; color: #666;">No bookings yet</p>';
        return;
    }
    
    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'reservation-card';
        
        const canCancel = (booking.status === 'Confirmed' || booking.status === 'Pending') && 
                         new Date(booking.checkInDate) > new Date();
        
        card.innerHTML = `
            <div class="reservation-header">
                <div class="confirmation-number">#${booking.confirmationNumber}</div>
                <span class="status-badge ${booking.status.toLowerCase()}">${booking.status}</span>
            </div>
            
            <div class="reservation-details">
                <div class="detail-row">
                    <span class="detail-label">Room Type:</span>
                    <span class="detail-value">${booking.roomType}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guest Name:</span>
                    <span class="detail-value">${booking.customerName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-in:</span>
                    <span class="detail-value">${new Date(booking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-out:</span>
                    <span class="detail-value">${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Price:</span>
                    <span class="detail-value">$${parseFloat(booking.totalPrice).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment:</span>
                    <span class="detail-value">${booking.paymentMethod === 'online' ? '💳 Online' : '💵 Cash'}</span>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="view-btn" onclick="viewBookingDetails('${booking.confirmationNumber}')">View Details</button>
                ${canCancel ? `<button class="cancel-btn" onclick="initiateCancellation('${booking.confirmationNumber}', '${booking.paymentMethod}', ${booking.totalPrice})">Cancel Booking</button>` : ''}
            </div>
        `;
        bookingsList.appendChild(card);
    });
}

function viewBookingDetails(confirmationNumber) {
    alert(`Booking Details\n\nConfirmation #: ${confirmationNumber}\n\nFor full details, please check your email.`);
}

// ========== CANCELLATION ==========
function initiateCancellation(confirmationNumber, paymentMethod, totalPrice) {
    pendingCancellation = {
        confirmationNumber: confirmationNumber,
        paymentMethod: paymentMethod,
        totalPrice: totalPrice
    };
    
    // Calculate refund policy
    const daysUntilCheckIn = 7; // Placeholder - should come from backend
    const refundPercentage = daysUntilCheckIn >= 7 ? 100 : (daysUntilCheckIn >= 2 ? 50 : 0);
    const refundAmount = (totalPrice * refundPercentage) / 100;
    
    const cancellationMessage = document.getElementById('cancellationMessage');
    cancellationMessage.innerHTML = `
        <p><strong>Are you sure you want to cancel this booking?</strong></p>
        <p>Cancellation Number: ${confirmationNumber}</p>
    `;
    
    const refundInfo = document.getElementById('refundInfo');
    refundInfo.innerHTML = `
        <div class="detail-row">
            <span>Refund Policy:</span>
            <span><strong>${refundPercentage}%</strong></span>
        </div>
        <div class="detail-row">
            <span>Original Amount:</span>
            <span>$${totalPrice.toFixed(2)}</span>
        </div>
        <div class="detail-row">
            <span>Refund Amount:</span>
            <span><strong style="color: green;">$${refundAmount.toFixed(2)}</strong></span>
        </div>
        <div class="detail-row">
            <span>Processing Time:</span>
            <span>3-5 business days</span>
        </div>
    `;
    
    document.getElementById('cancellationModal').classList.add('show');
}

function confirmCancellation() {
    if (!pendingCancellation) return;
    
    showMessage('Processing cancellation...', 'info');
    
    fetch(`${API_BASE_URL}/customer/bookings/${pendingCancellation.confirmationNumber}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage('✓ Booking cancelled successfully. Refund will be processed within 3-5 business days.', 'success');
            closeCancellationModal();
            loadMyBookings();
        } else {
            showMessage(data.message || 'Cancellation failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error cancelling booking', 'error');
    });
}

function closeCancellationModal() {
    document.getElementById('cancellationModal').classList.remove('show');
    pendingCancellation = null;
}

// ========== LOGOUT ==========
function logout() {
    localStorage.removeItem('customerEmail');
    window.location.href = 'index.html';
}
