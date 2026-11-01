// Feature 9: Promotion Engine
// Handles promotional discounts, coupon validation, and seasonal pricing adjustments

/**
 * Validates promo code and calculates discount amount.
 * @param {Object} promo Promotion object from DB or config
 * @param {number} subtotal Booking subtotal before discount
 * @param {string|Date} [bookingDate] Optional date of booking
 */
function applyPromotion(promo, subtotal) {
  if (!promo) {
    return { valid: false, message: 'Promotional code is invalid' };
  }

  if (promo.isActive === 0 || promo.isActive === false) {
    return { valid: false, message: 'This promotional code has expired or is inactive' };
  }

  const now = new Date();
  if (promo.validUntil && new Date(promo.validUntil) < now) {
    return { valid: false, message: 'This promotional code has expired' };
  }

  if (promo.validFrom && new Date(promo.validFrom) > now) {
    return { valid: false, message: 'This promotion is not yet active' };
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { valid: false, message: 'This promotion has reached its maximum usage limit' };
  }

  const amount = parseFloat(subtotal) || 0;
  if (promo.minSpend && amount < promo.minSpend) {
    return {
      valid: false,
      message: `Minimum spend of $${promo.minSpend.toFixed(2)} required for code ${promo.code}`
    };
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = (amount * parseFloat(promo.discountValue)) / 100;
  } else if (promo.discountType === 'fixed') {
    discount = Math.min(amount, parseFloat(promo.discountValue));
  } else {
    return { valid: false, message: 'Unsupported discount type' };
  }

  discount = Math.round(discount * 100) / 100;
  const finalSubtotal = Math.max(0, Math.round((amount - discount) * 100) / 100);

  return {
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount: discount,
    originalSubtotal: amount,
    finalSubtotal
  };
}

module.exports = {
  applyPromotion
};
