// Feature 9: Loyalty Rewards Module
// Manages guest loyalty accounts, tiers (Silver, Gold, Platinum), points earning and redemption

const TIER_THRESHOLDS = {
  Silver: 0,
  Gold: 1000,
  Platinum: 2500
};

const POINTS_EARN_RATE = 10; // 10 points per $1 spent
const POINTS_REDEMPTION_VALUE = 0.01; // 100 points = $1.00 (1 pt = $0.01)

/**
 * Calculates member tier based on total qualifying spend.
 * @param {number} totalSpent
 * @returns {string} Silver | Gold | Platinum
 */
function calculateTier(totalSpent) {
  const spent = parseFloat(totalSpent) || 0;
  if (spent >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (spent >= TIER_THRESHOLDS.Gold) return 'Gold';
  return 'Silver';
}

/**
 * Calculates points earned from booking total.
 * Platinum gets 1.5x bonus, Gold gets 1.25x bonus.
 * @param {number} amount
 * @param {string} tier
 * @returns {number} Points earned
 */
function calculatePointsEarned(amount, tier = 'Silver') {
  const base = Math.floor((parseFloat(amount) || 0) * POINTS_EARN_RATE);
  let multiplier = 1.0;
  if (tier === 'Gold') multiplier = 1.25;
  if (tier === 'Platinum') multiplier = 1.5;
  return Math.floor(base * multiplier);
}

/**
 * Calculates discount dollar value from points.
 * @param {number} points
 * @returns {number} Discount amount
 */
function pointsToDiscount(points) {
  const pts = parseInt(points, 10) || 0;
  return Math.round(pts * POINTS_REDEMPTION_VALUE * 100) / 100;
}

/**
 * Validates point redemption against member balance and booking total.
 */
function validateRedemption(memberPoints, pointsToRedeem, bookingTotal) {
  const available = parseInt(memberPoints, 10) || 0;
  const redeem = parseInt(pointsToRedeem, 10) || 0;
  const total = parseFloat(bookingTotal) || 0;

  if (redeem <= 0) {
    return { valid: false, message: 'Points to redeem must be greater than 0' };
  }

  if (redeem > available) {
    return { valid: false, message: `Insufficient points. You have ${available} points available.` };
  }

  const discount = pointsToDiscount(redeem);
  if (discount > total) {
    return {
      valid: false,
      message: `Discount ($${discount.toFixed(2)}) cannot exceed total booking amount ($${total.toFixed(2)})`
    };
  }

  return {
    valid: true,
    pointsRedeemed: redeem,
    discountAmount: discount,
    remainingPoints: available - redeem,
    newTotal: Math.round((total - discount) * 100) / 100
  };
}

module.exports = {
  calculateTier,
  calculatePointsEarned,
  pointsToDiscount,
  validateRedemption,
  TIER_THRESHOLDS,
  POINTS_EARN_RATE,
  POINTS_REDEMPTION_VALUE
};
