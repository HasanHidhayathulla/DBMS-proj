// Customer Portal JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
const TAX_RATE = 0.08; // 8% tax

// State Management
let selectedRoom = null;
let selectedPaymentMethod = null;
let pendingCancellation = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const searchCheckIn = document.getElementById('searchCheckIn');
    const searchCheckOut = document.getElementById('searchCheckOut');
    if (searchCheckIn) searchCheckIn.min = today;
    if (searchCheckOut) searchCheckOut.min = today;
    
    loadMyBookings();
    loadCustomerReviews();
});

// ========== TAB SWITCHING ==========
function switchCustomerTab(tabName) {
    document.querySelectorAll('.customer-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.customer-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
        if (event && event.target) {
            event.target.classList.add('active');
        }
    }

    if (tabName === 'services-reviews') {
        loadCustomerReviews();
    }
}

// ========== MESSAGE DISPLAY ==========
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
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
    
    if (new Date(checkIn) >= new Date(checkOut)) {
        showMessage('Check-out date must be after check-in date', 'error');
        return;
    }
    
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
    
    document.getElementById('bookingRoomType').value = roomType;
    document.getElementById('bookingCheckIn').value = checkIn;
    document.getElementById('bookingCheckOut').value = checkOut;
    
    updateBookingPrice(baseRate, nights);
    
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('onlinePaymentForm').classList.remove('show');
    
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
    
    document.getElementById('option-online').classList.toggle('selected', method === 'online');
    document.getElementById('option-cash').classList.toggle('selected', method === 'cash');
    
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
    
    const name = document.getElementById('bookingName').value;
    const email = document.getElementById('bookingEmail').value;
    const phone = document.getElementById('bookingPhone').value;
    
    if (!name || !email || !phone) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (selectedPaymentMethod === 'online') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        
        if (!cardNumber || !cardExpiry || !cardCVV) {
            showMessage('Please enter complete card details', 'error');
            return;
        }
    }
    
    createBooking(name, email, phone);
}

function createBooking(name, email, phone) {
    const checkIn = document.getElementById('bookingCheckIn').value;
    const checkOut = document.getElementById('bookingCheckOut').value;
    const totalPriceText = document.getElementById('totalPrice').textContent;
    const totalPrice = parseFloat(totalPriceText.replace('$', ''));
    
    localStorage.setItem('customerEmail', email);

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
                
                loadMyBookings();
                switchCustomerTab('mybookings');
            }, 500);
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
    let email = localStorage.getItem('customerEmail');
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;
    
    if (!email) {
        bookingsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Complete a booking to view your reservations here.</p>';
        return;
    }
    
    fetch(`${API_BASE_URL}/customer/bookings?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.bookings) {
                displayMyBookings(data.bookings, email);
            } else {
                bookingsList.innerHTML = '<p style="text-align: center; color: #666;">No bookings found</p>';
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
                    <span class="detail-label">Room ID:</span>
                    <span class="detail-value">${booking.roomId || '-'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guest Email:</span>
                    <span class="detail-value">${booking.customerEmail}</span>
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
    
    const daysUntilCheckIn = 7;
    const refundPercentage = daysUntilCheckIn >= 7 ? 100 : (daysUntilCheckIn >= 2 ? 50 : 0);
    const refundAmount = (totalPrice * refundPercentage) / 100;
    
    const cancellationMessage = document.getElementById('cancellationMessage');
    cancellationMessage.innerHTML = `
        <p><strong>Are you sure you want to cancel this booking?</strong></p>
        <p>Confirmation Number: ${confirmationNumber}</p>
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
            showMessage('✓ Booking cancelled successfully.', 'success');
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

// ========== FEATURE 8: CUSTOMER ADD-ONS & REVIEWS ==========

function submitCustomerServiceRequest(event) {
    event.preventDefault();
    const confirmationNumber = document.getElementById('serviceConfNumber').value.trim();
    const serviceType = document.getElementById('serviceTypeSelect').value;
    const details = document.getElementById('serviceDetails').value.trim();

    const costs = {
        'Airport Transfer': 40,
        'Extra Bed': 30,
        'Late Check-Out': 25,
        'Breakfast Package': 15,
        'Special Request': 0
    };
    const cost = costs[serviceType] || 0;

    fetch(`${API_BASE_URL}/customer/bookings/${encodeURIComponent(confirmationNumber)}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, details, cost })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage('✓ Service add-on requested successfully!', 'success');
            event.target.reset();
        } else {
            showMessage(data.message || 'Failed to request service add-on', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error submitting service request', 'error');
    });
}

function submitCustomerReview(event) {
    event.preventDefault();
    const confirmationNumber = document.getElementById('reviewConfNumber').value.trim();
    const rating = document.getElementById('reviewRatingSelect').value;
    const comment = document.getElementById('reviewComment').value.trim();

    fetch(`${API_BASE_URL}/customer/bookings/${encodeURIComponent(confirmationNumber)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage('✓ Thank you! Your review has been submitted.', 'success');
            event.target.reset();
            loadCustomerReviews();
        } else {
            showMessage(data.message || 'Failed to submit review', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error submitting review', 'error');
    });
}

function loadCustomerReviews() {
    fetch(`${API_BASE_URL}/customer/reviews`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const header = document.getElementById('customer-reviews-header');
                if (header && data.metrics) {
                    header.textContent = `Overall Rating: ⭐ ${data.metrics.averageRating} / 5 (${data.metrics.totalReviews} guest reviews)`;
                }

                const reviewsList = document.getElementById('customer-reviews-list');
                if (!reviewsList) return;
                reviewsList.innerHTML = '';

                if (data.reviews.length === 0) {
                    reviewsList.innerHTML = '<p style="color: #666;">No reviews submitted yet.</p>';
                    return;
                }

                data.reviews.forEach(rev => {
                    const stars = '⭐'.repeat(rev.rating);
                    const revDiv = document.createElement('div');
                    revDiv.style.background = '#f8f9fa';
                    revDiv.style.padding = '15px';
                    revDiv.style.borderRadius = '5px';
                    revDiv.style.marginBottom = '10px';
                    revDiv.style.borderLeft = '4px solid #667eea';

                    revDiv.innerHTML = `
                        <div style="font-weight: bold; color: #333;">${stars} (${rev.rating}/5) - Confirmation #${rev.confirmationNumber}</div>
                        <div style="color: #555; margin-top: 5px;">"${rev.comment || 'No written comment'}"</div>
                        <div style="font-size: 12px; color: #999; margin-top: 5px;">${new Date(rev.createdAt).toLocaleDateString()}</div>
                    `;
                    reviewsList.appendChild(revDiv);
                });
            }
        })
        .catch(error => console.error('Error loading reviews:', error));
}

// ========== LOGOUT ==========
function logout() {
    localStorage.removeItem('customerEmail');
    window.location.href = 'index.html';
}
