// Charge Posting Logic

// Function to post charges to a guest's account
function postCharge(reservationId, chargeDescription, amount) {
  // Logic to apply charges
  console.log(`Posting charge to Reservation ID=${reservationId}: ${chargeDescription}, Amount=${amount}`);
}

module.exports = { postCharge };