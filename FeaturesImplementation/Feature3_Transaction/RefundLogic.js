// Refund Logic

// Function to process a refund
function processRefund(payment, refundPercentage) {
  try {
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    if (payment.status === 'Refunded') {
      return { success: false, message: 'Payment already refunded' };
    }

    if (payment.status !== 'Authorized') {
      return { success: false, message: 'Only authorized payments can be refunded' };
    }

    // Calculate refund amount
    const refundAmount = (payment.amount * refundPercentage) / 100;
    const amountRetained = payment.amount - refundAmount;

    // Create refund record
    const refundRecord = {
      originalPaymentId: payment.id,
      refundAmount: parseFloat(refundAmount.toFixed(2)),
      amountRetained: parseFloat(amountRetained.toFixed(2)),
      refundPercentage,
      originalAmount: payment.amount,
      status: 'Processed',
      processedAt: new Date(),
      transactionId: 'REFUND_' + Date.now(),
      reason: 'Reservation Cancellation'
    };

    return {
      success: true,
      message: 'Refund processed successfully',
      refund: refundRecord
    };
  } catch (error) {
    return { success: false, message: 'Error processing refund: ' + error.message };
  }
}

// Function to validate refund eligibility
function validateRefundEligibility(payment, reservation) {
  if (!payment) {
    return { eligible: false, reason: 'Payment not found' };
  }

  if (!reservation) {
    return { eligible: false, reason: 'Reservation not found' };
  }

  const reservationStatuses = ['Confirmed', 'Cancelled', 'Modified'];
  if (!reservationStatuses.includes(reservation.status)) {
    return { eligible: false, reason: `Cannot refund ${reservation.status} reservations` };
  }

  return { eligible: true, reason: 'Refund is eligible' };
}

module.exports = { processRefund, validateRefundEligibility };