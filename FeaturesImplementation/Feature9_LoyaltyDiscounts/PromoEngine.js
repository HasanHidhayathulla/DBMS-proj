/**
 * PromoEngine
 * Validates promo codes, checks restrictions, and applies discounts.
 * Supports:
 * - Percentage discounts (e.g., 10% off)
 * - Fixed/Flat amount discounts (e.g., $50 off)
 * - Minimum spend requirements
 * - Expiration dates and active status checks
 */

class PromoEngine {
  validatePromo(promoRecord, orderAmount) {
    if (!promoRecord) {
      return { isValid: false, message: 'Invalid promo code' };
    }

    if (!promoRecord.isActive) {
      return { isValid: false, message: 'This promo code is inactive' };
    }

    const now = new Date();
    if (promoRecord.validUntil && new Date(promoRecord.validUntil) < now) {
      return { isValid: false, message: 'This promo code has expired' };
    }

    const amount = parseFloat(orderAmount) || 0;
    const minSpend = parseFloat(promoRecord.minSpend) || 0;
    if (amount < minSpend) {
      return {
        isValid: false,
        message: `Order total $${amount.toFixed(2)} does not meet the minimum requirement of $${minSpend.toFixed(2)}`
      };
    }

    return { isValid: true };
  }

  calculateDiscount(promoRecord, orderAmount) {
    const valResult = this.validatePromo(promoRecord, orderAmount);
    if (!valResult.isValid) {
      return {
        success: false,
        discountAmount: 0,
        finalTotal: parseFloat(orderAmount) || 0,
        message: valResult.message
      };
    }

    const amount = parseFloat(orderAmount) || 0;
    let discount = 0;

    if (promoRecord.discountType === 'PERCENT') {
      const pct = parseFloat(promoRecord.discountValue) || 0;
      discount = (amount * pct) / 100;
    } else if (promoRecord.discountType === 'FLAT') {
      discount = parseFloat(promoRecord.discountValue) || 0;
    }

    // Do not exceed total amount
    discount = Math.min(discount, amount);
    const finalTotal = Math.max(0, amount - discount);

    return {
      success: true,
      promoCode: promoRecord.code,
      discountType: promoRecord.discountType,
      discountValue: promoRecord.discountValue,
      discountAmount: parseFloat(discount.toFixed(2)),
      originalTotal: parseFloat(amount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
      message: `Promo code ${promoRecord.code} applied successfully!`
    };
  }
}

module.exports = new PromoEngine();
