// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Session Management Variables
let currentUser = null;
let authToken = null;

// Session Management Functions
function setAuthToken(token, user) {
    authToken = token;
    currentUser = user;
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    updateUIForLoggedInUser();
    // Redirect to dashboard after login
    if (typeof switchTab === 'function') switchTab('dashboard');
}

function getAuthToken() {
    if (!authToken) {
        authToken = sessionStorage.getItem('authToken');
    }
    return authToken;
}

function clearAuthToken() {
    authToken = null;
    currentUser = null;
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
    // Redirect to login tab after logout
    if (typeof switchTab === 'function') switchTab('login');
}

function loadSessionFromStorage() {
    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
        return true;
    }
    return false;
}

function updateUIForLoggedInUser() {
    if (currentUser) {
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            userDisplay.textContent = `Logged in as: ${currentUser.username} (${currentUser.role})`;
            userDisplay.style.display = 'block';
        }
        // Show all auth-required nav buttons
        document.querySelectorAll('.auth-required').forEach(btn => btn.style.display = 'inline-block');
        const loginTab = document.getElementById('login');
        if (loginTab) loginTab.style.display = 'none';
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    }
}

function updateUIForLoggedOutUser() {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) userDisplay.style.display = 'none';
    // Hide all auth-required nav buttons
    document.querySelectorAll('.auth-required').forEach(btn => btn.style.display = 'none');
    const loginTab = document.getElementById('login');
    if (loginTab) loginTab.style.display = 'block';
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    // Redirect to login tab
    if (typeof switchTab === 'function') switchTab('login');
}

// Utility: Show notification message
function showNotification(message, type = 'info') {
    const resultDiv = document.getElementById('result-message');
    resultDiv.textContent = message;
    resultDiv.className = `result-message ${type}`;
    setTimeout(() => {
        resultDiv.className = 'result-message';
    }, 4000);
}

// Utility: Make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
        };
        
        // Add authorization token if available
        const token = getAuthToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
            clearAuthToken();
            showNotification('Session expired. Please login again.', 'error');
            switchTab('login');
            return { success: false, error: 'Unauthorized' };
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

// Tab switching function
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        if (tabName === 'housekeeping') {
            loadHousekeeping();
        }
    }

    // Add active class to clicked button if event provided
    try {
        if (event && event.target) event.target.classList.add('active');
    } catch (e) {
        // ignore when called programmatically
    }
}

// ========== DASHBOARD FUNCTIONS ==========

function loadOccupancy() {
    apiCall('/reporting/occupancy').then(data => {
        if (data.success) {
            const html = `
                <p><strong>Total Rooms:</strong> ${data.totalRooms}</p>
                <p><strong>Occupied:</strong> ${data.occupiedRooms}</p>
                <p><strong>Available:</strong> ${data.availableRooms}</p>
                <p><strong>Occupancy Rate:</strong> ${data.occupancyRate}%</p>
            `;
            document.getElementById('occupancy-data').innerHTML = html;
            document.getElementById('occupancy-report').innerHTML = html;
        }
    });
}

function loadRevenue() {
    apiCall('/reporting/revenue?timeframe=daily').then(data => {
        if (data.success) {
            document.getElementById('revenue-data').innerHTML = `<p>Total Revenue: $${data.totalRevenue.toFixed(2)}</p>`;
        }
    });
}

function loadRooms() {
    apiCall('/rooms').then(data => {
        if (data.success) {
            const tableBody = document.getElementById('rooms-list');
            tableBody.innerHTML = '';
            data.rooms.forEach(room => {
                const row = `
                    <tr>
                        <td>${room.id}</td>
                        <td>${room.type}</td>
                        <td>${room.floor}</td>
                        <td>$${room.baseRate}</td>
                        <td><span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span></td>
                        <td>
                            <div class="action-cell">
                                <button onclick="deleteRoom(${room.id})" class="btn btn-danger">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Update total rooms card
            document.getElementById('total-rooms').innerHTML = `<p>Total: ${data.rooms.length} rooms</p>`;
        }
    });
}

// ========== FEATURE 1: INVENTORY ==========

function addRoom(event) {
    event.preventDefault();
    const type = document.getElementById('roomType').value;
    const floor = document.getElementById('roomFloor').value;
    const baseRate = parseFloat(document.getElementById('roomRate').value);

    apiCall('/rooms', 'POST', { type, floor, baseRate }).then(data => {
        if (data.success) {
            showNotification(`Room added successfully! (ID: ${data.room.id})`, 'success');
            event.target.reset();
            loadRooms();
        }
    });
}

function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room?')) {
        apiCall(`/rooms/${roomId}`, 'DELETE').then(data => {
            if (data.success) {
                showNotification('Room deleted successfully!', 'success');
                loadRooms();
            }
        });
    }
}

function calculatePrice(event) {
    event.preventDefault();
    const baseRate = parseFloat(document.getElementById('baseRate').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value);

    apiCall('/pricing/calculate', 'POST', { baseRate, taxRate }).then(data => {
        if (data.success) {
            const result = `
                <p>Base Rate: $${data.result}</p>
                <p>Tax Rate: ${taxRate}%</p>
            `;
            document.getElementById('pricing-result').innerHTML = result;
        }
    });
}

// ========== FEATURE 2: RESERVATIONS ==========

function searchAvailableRooms(event) {
    event.preventDefault();
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    apiCall(`/reservations/available-rooms?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`).then(data => {
        if (data.success) {
            let html = '<table class="table"><thead><tr><th>Room ID</th><th>Type</th><th>Floor</th><th>Rate</th></tr></thead><tbody>';
            data.availableRooms.forEach(room => {
                html += `<tr><td>${room.id}</td><td>${room.type}</td><td>${room.floor}</td><td>$${room.baseRate}</td></tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('available-rooms-result').innerHTML = html;
        }
    });
}

function createReservation(event) {
    event.preventDefault();
    const roomId = parseInt(document.getElementById('reservationRoomId').value);
    const userId = parseInt(document.getElementById('reservationUserId').value);
    const checkInDate = document.getElementById('reservationCheckIn').value;
    const checkOutDate = document.getElementById('reservationCheckOut').value;

    apiCall('/reservations', 'POST', { roomId, userId, checkInDate, checkOutDate }).then(data => {
        if (data.success) {
            showNotification(`Reservation created! (ID: ${data.reservation.id})`, 'success');
            event.target.reset();
            loadReservations();
        }
    });
}

function loadReservations() {
    apiCall('/reservations').then(data => {
        if (data.success) {
            const tableBody = document.getElementById('reservations-list');
            tableBody.innerHTML = '';
            data.reservations.forEach(reservation => {
                const canCancel = ['Pending', 'Confirmed'].includes(reservation.status);
                const cancelBtn = canCancel ? `<button onclick="cancelReservation(${reservation.id})" class="btn btn-warning" style="margin-left: 5px;">Cancel</button>` : '';
                const row = `
                    <tr>
                        <td>${reservation.id}</td>
                        <td>${reservation.roomId}</td>
                        <td>${reservation.userId}</td>
                        <td>${reservation.checkInDate}</td>
                        <td>${reservation.checkOutDate}</td>
                        <td><span class="status-badge status-${reservation.status.toLowerCase()}">${reservation.status}</span></td>
                        <td>
                            <div class="action-cell">
                                <button onclick="updateReservationStatus(${reservation.id})" class="btn btn-primary">Update</button>
                                ${cancelBtn}
                            </div>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    });
}

function updateReservationStatus(reservationId) {
    const newStatus = prompt('Enter new status (Confirmed/Cancelled/Completed/No-Show):');
    if (newStatus) {
        apiCall(`/reservations/${reservationId}/status`, 'PUT', { status: newStatus }).then(data => {
            if (data.success) {
                showNotification('Reservation status updated!', 'success');
                loadReservations();
            }
        });
    }
}

function cancelReservation(reservationId) {
    if (confirm('Are you sure you want to cancel this reservation? This action cannot be undone.')) {
        apiCall(`/reservations/${reservationId}`, 'DELETE').then(data => {
            if (data.success) {
                showNotification('Reservation cancelled successfully!', 'success');
                if (data.refund) {
                    showNotification(`Refund of ${data.reservation.refundPolicy} will be processed.`, 'info');
                }
                loadReservations();
            } else {
                showNotification(data.message || 'Failed to cancel reservation', 'error');
            }
        }).catch(error => {
            showNotification('Error cancelling reservation: ' + error.message, 'error');
        });
    }
}

// ========== FEATURE 3: PAYMENTS ==========

function processPayment(event) {
    event.preventDefault();
    const reservationId = parseInt(document.getElementById('paymentReservationId').value);
    const amount = parseFloat(document.getElementById('paymentAmount').value);

    apiCall('/payments', 'POST', { reservationId, amount }).then(data => {
        if (data.success) {
            showNotification(`Payment processed! (Token: ${data.payment.gatewayAuthToken})`, 'success');
            event.target.reset();
        }
    });
}

function authorizePayment(event) {
    event.preventDefault();
    const reservationId = parseInt(document.getElementById('authorizeReservationId').value);
    const amount = parseFloat(document.getElementById('authorizeAmount').value);

    apiCall('/payments/authorize', 'POST', { reservationId, amount }).then(data => {
        if (data.success) {
            showNotification('Payment authorized successfully!', 'success');
            event.target.reset();
        }
    });
}

function processRefund(event) {
    event.preventDefault();
    const paymentId = parseInt(document.getElementById('refundPaymentId').value);
    const amount = parseFloat(document.getElementById('refundAmount').value);

    apiCall(`/payments/${paymentId}/refund`, 'POST', { amount }).then(data => {
        if (data.success) {
            showNotification('Refund processed successfully!', 'success');
            event.target.reset();
        }
    });
}

// ========== FEATURE 4: CHECK-IN/OUT ==========

function checkIn(event) {
    event.preventDefault();
    const roomId = parseInt(document.getElementById('checkInRoomId').value);
    const reservationId = parseInt(document.getElementById('checkInReservationId').value);

    // First assign room
    apiCall('/check-in/assign-room', 'POST', { reservationId, roomId }).then(data => {
        if (data.success) {
            // Then check-in
            apiCall('/check-in', 'POST', { roomId }).then(checkInData => {
                if (checkInData.success) {
                    showNotification('Guest checked in successfully!', 'success');
                    event.target.reset();
                    loadRooms();
                }
            });
        }
    });
}

function checkOut(event) {
    event.preventDefault();
    const roomId = parseInt(document.getElementById('checkOutRoomId').value);

    apiCall('/check-out', 'POST', { roomId }).then(data => {
        if (data.success) {
            showNotification('Guest checked out successfully! Room now in cleaning status.', 'success');
            event.target.reset();
            loadRooms();
        }
    });
}

function postCharge(event) {
    event.preventDefault();
    const reservationId = parseInt(document.getElementById('chargeReservationId').value);
    const chargeDescription = document.getElementById('chargeDescription').value;
    const amount = parseFloat(document.getElementById('chargeAmount').value);

    apiCall('/charges', 'POST', { reservationId, chargeDescription, amount }).then(data => {
        if (data.success) {
            showNotification('Charge posted successfully!', 'success');
            event.target.reset();
        }
    });
}

// ========== FEATURE 8: HOUSEKEEPING & MAINTENANCE ==========

function loadHousekeeping() {
    // Load room stats
    apiCall('/housekeeping/rooms').then(data => {
        if (data.success && data.stats) {
            document.getElementById('hk-cleaning-count').textContent = data.stats.cleaning;
            document.getElementById('hk-maintenance-count').textContent = data.stats.maintenance;
            document.getElementById('hk-available-count').textContent = data.stats.available;
        }
    });

    // Load tasks
    apiCall('/housekeeping/tasks').then(data => {
        if (data.success) {
            const tbody = document.getElementById('housekeeping-tasks-list');
            tbody.innerHTML = '';
            if (data.tasks.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No housekeeping tasks found</td></tr>';
                return;
            }
            data.tasks.forEach(task => {
                const isCompleted = task.status === 'Completed';
                const actionBtn = isCompleted
                    ? '<span style="color:#2ecc71; font-weight:bold;">Done</span>'
                    : `<button onclick="quickCleanRoom(${task.roomId})" class="btn btn-success" style="font-size:12px; padding:4px 8px;">Mark Done</button>
                       <button onclick="reassignTask(${task.id})" class="btn btn-primary" style="font-size:12px; padding:4px 8px; margin-left:4px;">Assign</button>`;

                const row = `
                    <tr>
                        <td>${task.id}</td>
                        <td>Room ${task.roomId}</td>
                        <td>${task.taskType}</td>
                        <td>${task.assignedTo || 'Unassigned'}</td>
                        <td><span class="status-badge priority-${(task.priority || 'medium').toLowerCase()}">${task.priority}</span></td>
                        <td><span class="status-badge status-${(task.status || 'pending').toLowerCase()}">${task.status}</span></td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    });

    loadMaintenanceRequests();
}

function quickCleanRoom(roomId) {
    document.getElementById('hkCleanRoomId').value = roomId;
    document.getElementById('hkCleanNotes').value = 'Cleaned and sanitized';
    markRoomCleaned(new Event('submit'));
}

function reassignTask(taskId) {
    const staffName = prompt('Enter staff member name to assign:');
    if (staffName) {
        apiCall('/housekeeping/assign', 'POST', { taskId, assignedTo: staffName }).then(data => {
            if (data.success) {
                showNotification('Housekeeping task assigned successfully!', 'success');
                loadHousekeeping();
            } else {
                showNotification(data.message || 'Failed to assign task', 'error');
            }
        });
    }
}

function markRoomCleaned(event) {
    if (event && event.preventDefault) event.preventDefault();
    const roomId = parseInt(document.getElementById('hkCleanRoomId').value);
    const notes = document.getElementById('hkCleanNotes').value;

    apiCall('/housekeeping/clean', 'POST', { roomId, notes }).then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            document.getElementById('hkCleanRoomId').value = '';
            document.getElementById('hkCleanNotes').value = '';
            loadHousekeeping();
            loadRooms();
            loadOccupancy();
        } else {
            showNotification(data.message || 'Failed to mark room cleaned', 'error');
        }
    });
}

function reportMaintenance(event) {
    if (event && event.preventDefault) event.preventDefault();
    const roomId = parseInt(document.getElementById('maintRoomId').value);
    const issueCategory = document.getElementById('maintCategory').value;
    const priority = document.getElementById('maintPriority').value;
    const description = document.getElementById('maintDescription').value;

    apiCall('/maintenance', 'POST', { roomId, issueCategory, priority, description }).then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            document.getElementById('maintRoomId').value = '';
            document.getElementById('maintDescription').value = '';
            loadHousekeeping();
            loadRooms();
            loadOccupancy();
        } else {
            showNotification(data.message || 'Failed to report maintenance issue', 'error');
        }
    });
}

function loadMaintenanceRequests() {
    apiCall('/maintenance').then(data => {
        if (data.success) {
            const tbody = document.getElementById('maintenance-tickets-list');
            tbody.innerHTML = '';
            if (data.requests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No maintenance tickets found</td></tr>';
                return;
            }
            data.requests.forEach(ticket => {
                const isResolved = ticket.status === 'Resolved';
                const actionBtn = isResolved
                    ? '<span style="color:#2ecc71; font-weight:bold;">Resolved</span>'
                    : `<button onclick="resolveMaintenanceTicket(${ticket.id})" class="btn btn-warning" style="font-size:12px; padding:4px 8px;">Resolve</button>`;

                const row = `
                    <tr>
                        <td>#${ticket.id}</td>
                        <td>Room ${ticket.roomId}</td>
                        <td>${ticket.issueCategory}</td>
                        <td>${ticket.description}</td>
                        <td><span class="status-badge priority-${(ticket.priority || 'medium').toLowerCase()}">${ticket.priority}</span></td>
                        <td><span class="status-badge status-${(ticket.status || 'reported').toLowerCase()}">${ticket.status}</span></td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    });
}

function resolveMaintenanceTicket(ticketId) {
    const notes = prompt('Enter resolution notes:', 'Repairs completed and tested');
    if (notes) {
        apiCall(`/maintenance/${ticketId}/resolve`, 'PUT', { resolutionNotes: notes }).then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                loadHousekeeping();
                loadRooms();
                loadOccupancy();
            } else {
                showNotification(data.message || 'Failed to resolve ticket', 'error');
            }
        });
    }
}

// ========== FEATURE 5: BILLING ==========

function calculateBilling(event) {
    event.preventDefault();
    const subtotal = parseFloat(document.getElementById('billingSubtotal').value);
    const taxRate = parseFloat(document.getElementById('billingTaxRate').value);

    apiCall('/billing/calculate', 'POST', { subtotal, taxRate }).then(data => {
        if (data.success) {
            const html = `
                <p><strong>Subtotal:</strong> $${data.result.subtotal.toFixed(2)}</p>
                <p><strong>Tax:</strong> $${data.result.tax.toFixed(2)}</p>
                <p><strong>Total:</strong> $${data.result.total.toFixed(2)}</p>
            `;
            document.getElementById('billing-result').innerHTML = html;
        }
    });
}

function generateInvoice(event) {
    event.preventDefault();
    const reservationId = parseInt(document.getElementById('invoiceReservationId').value);
    const totalAmount = parseFloat(document.getElementById('invoiceTotalAmount').value);
    const tax = parseFloat(document.getElementById('invoiceTax').value);

    const billingDetails = { totalAmount, tax };

    apiCall('/invoices', 'POST', { reservationId, billingDetails }).then(data => {
        if (data.success) {
            showNotification(`Invoice generated! (ID: ${data.invoice.id})`, 'success');
            event.target.reset();
        }
    });
}

// ========== FEATURE 6: REPORTING ==========

function loadRevenueReport(event) {
    event.preventDefault();
    const timeframe = document.getElementById('revenueTimeframe').value;

    apiCall(`/reporting/revenue?timeframe=${timeframe}`).then(data => {
        if (data.success) {
            const html = `
                <p><strong>Timeframe:</strong> ${timeframe}</p>
                <p><strong>Total Revenue:</strong> $${data.totalRevenue.toFixed(2)}</p>
            `;
            document.getElementById('revenue-report').innerHTML = html;
        }
    });
}

function viewAuditLogs() {
    apiCall('/reporting/audit-logs').then(data => {
        if (data.success) {
            document.getElementById('audit-logs').innerHTML = '<p>Audit logs retrieved successfully. No entries to display.</p>';
            showNotification('Audit logs loaded!', 'info');
        }
    });
}

// ========== FEATURE 7: SECURITY ==========

function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }

    apiCall('/auth/login', 'POST', { username, password }).then(data => {
        if (data.success) {
            // Store token and user info
            setAuthToken(data.token, data.user);
            showNotification(`Welcome, ${data.user.username}!`, 'success');
            event.target.reset();
            
            // Switch to a different tab
            switchTab('dashboard');
        } else {
            showNotification(data.message || 'Invalid credentials!', 'error');
        }
    });
}

function logoutUser() {
    apiCall('/auth/logout', 'POST').then(data => {
        if (data.success) {
            clearAuthToken();
            showNotification('You have been logged out successfully', 'success');
            switchTab('login');
        }
    });
}

function performDailyBackup() {
    apiCall('/backup/daily', 'POST').then(data => {
        if (data.success) {
            showNotification('Daily backup completed successfully!', 'success');
        }
    });
}

function performWeeklySnapshot() {
    apiCall('/backup/weekly', 'POST').then(data => {
        if (data.success) {
            showNotification('Weekly snapshot completed successfully!', 'success');
        }
    });
}

function testDatabaseRecovery() {
    apiCall('/recovery/test', 'POST').then(data => {
        if (data.success) {
            showNotification('Database recovery test completed successfully!', 'success');
        }
    });
}

// Load initial data when page loads
window.addEventListener('load', () => {
    // Try to restore session from storage
    if (!loadSessionFromStorage()) {
        // No client-side stored session — check server-side session
        apiCall('/auth/me').then(me => {
            if (me && me.success && me.user) {
                // restore user from server session (no token)
                currentUser = me.user;
                updateUIForLoggedInUser();
                loadRooms();
                loadOccupancy();
                loadRevenue();
            } else {
                // No session, show login tab
                switchTab('login');
            }
        }).catch(() => switchTab('login'));
    } else {
        // Session restored, load initial data
        loadRooms();
        loadOccupancy();
        loadRevenue();
    }
});
