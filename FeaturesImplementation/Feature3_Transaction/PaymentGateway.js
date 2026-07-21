// Payment Gateway Integration

// Function to process payment
function processPayment(reservationId, amount) {
  // Logic to integrate with a payment gateway
  console.log(`Processing payment for Reservation ID=${reservationId}, Amount=${amount}`);
}

// Function to authorize payment
function authorizePayment(reservationId, amount) {
  // Logic to authorize payment
  console.log(`Authorizing payment for Reservation ID=${reservationId}, Amount=${amount}`);
}

module.exports = { processPayment, authorizePayment };