// Reservation Engine
const { Reservation, Room } = require('../Shared/DatabaseModels');

// Function to search for available rooms
function searchAvailableRooms(checkInDate, checkOutDate) {
  // Logic to query the Room table for availability
  console.log(`Searching for available rooms from ${checkInDate} to ${checkOutDate}`);
}

// Function to hold a room temporarily
function holdRoom(roomId, userId) {
  // Logic to mark a room as "Hold"
  console.log(`Holding room ID=${roomId} for user ID=${userId}`);
}

// CRUD operations for reservations
function createReservation(roomId, userId, checkInDate, checkOutDate) {
  // Logic to create a reservation
  console.log(`Creating reservation for Room ID=${roomId}, User ID=${userId}`);
}

function updateReservation(reservationId, updates) {
  // Logic to update reservation details
  console.log(`Updating reservation ID=${reservationId} with updates:`, updates);
}

function deleteReservation(reservationId) {
  // Logic to delete a reservation
  console.log(`Deleting reservation ID=${reservationId}`);
}

function getReservation(reservationId) {
  // Logic to fetch reservation details
  console.log(`Fetching reservation ID=${reservationId}`);
}

// Function to cancel a reservation and calculate refund
function cancelReservation(reservation) {
  try {
    if (!reservation) {
      return { success: false, message: 'Reservation not found' };
    }

    // Check if reservation can be cancelled
    if (reservation.status === 'Checked-In' || reservation.status === 'Completed') {
      return { success: false, message: `Cannot cancel ${reservation.status} reservations` };
    }

    if (reservation.status === 'Cancelled') {
      return { success: false, message: 'Reservation already cancelled' };
    }

    // Calculate refund based on cancellation timing
    const checkInDate = new Date(reservation.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    let refundPercentage = 100; // Default: full refund
    
    if (hoursUntilCheckIn < 24) {
      refundPercentage = 50; // 50% refund if cancelled within 24 hours
    }

    return {
      success: true,
      message: 'Reservation cancelled successfully',
      status: 'Cancelled',
      refundPercentage,
      hoursUntilCheckIn: Math.round(hoursUntilCheckIn)
    };
  } catch (error) {
    return { success: false, message: 'Error cancelling reservation: ' + error.message };
  }
}

// Function to calculate refund amount
function calculateRefund(paymentAmount, refundPercentage) {
  const refundAmount = (paymentAmount * refundPercentage) / 100;
  return {
    originalAmount: paymentAmount,
    refundPercentage,
    refundAmount: parseFloat(refundAmount.toFixed(2)),
    amountRetained: parseFloat((paymentAmount - refundAmount).toFixed(2))
  };
}

module.exports = { 
  searchAvailableRooms, 
  holdRoom, 
  createReservation, 
  updateReservation, 
  deleteReservation, 
  getReservation,
  cancelReservation,
  calculateRefund
};