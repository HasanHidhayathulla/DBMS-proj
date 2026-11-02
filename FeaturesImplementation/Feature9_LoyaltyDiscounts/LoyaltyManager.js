/**
 * LoyaltyManager
 * Manages guest loyalty tiers, points accumulation, and reward redemptions.
 * Tiers:
 * - Bronze: Base tier (10 pts per $1 spent, 0% bonus)
 * - Silver: $500+ spend or 5,000 pts (12 pts per $1 spent, 5% room discount)
 * - Gold: $1,500+ spend or 15,000 pts (15 pts per $1 spent, 10% room discount)
 * - Platinum: $3,000+ spend or 30,000 pts (20 pts per $1 spent, 15% room discount)
 */

class LoyaltyManager {
  constructor() {
    this.tierThresholds = [
      { tier: 'Platinum', minSpend: 3000, pointsMultiplier: 20, discountPercent: 15 },
      { tier: 'Gold', minSpend: 1500, pointsMultiplier: 15, discountPercent: 10 },
      { tier: 'Silver', minSpend: 500, pointsMultiplier: 12, discountPercent: 5 },
      { tier: 'Bronze', minSpend: 0, pointsMultiplier: 10, discountPercent: 0 }
    ];
    // 100 points = $1.00 redemption value
    this.pointsPerDollar = 100;
  }

  determineTier(totalSpent = 0) {
    const spend = Number(totalSpent) || 0;
    for (const rule of this.tierThresholds) {
      if (spend >= rule.minSpend) {
        return {
          tier: rule.tier,
          pointsMultiplier: rule.pointsMultiplier,
          discountPercent: rule.discountPercent
        };
      }
    }
    return { tier: 'Bronze', pointsMultiplier: 10, discountPercent: 0 };
  }

  calculatePointsEarned(spendAmount, currentTier = 'Bronze') {
    const spend = Number(spendAmount) || 0;
    const tierRule = this.tierThresholds.find(t => t.tier.toLowerCase() === currentTier.toLowerCase()) || this.tierThresholds[3];
    const points = Math.floor(spend * tierRule.pointsMultiplier);
    return {
      pointsEarned: points,
      tier: tierRule.tier,
      multiplier: tierRule.pointsMultiplier
    };
  }

  calculateRedemption(pointsAvailable, pointsToRedeem, billTotal) {
    const available = parseInt(pointsAvailable, 10) || 0;
    const redeem = parseInt(pointsToRedeem, 10) || 0;
    const total = parseFloat(billTotal) || 0;

    if (redeem <= 0) {
      return { success: false, message: 'Points to redeem must be greater than 0' };
    }

    if (redeem > available) {
      return { success: false, message: `Insufficient points. Available: ${available}, requested: ${redeem}` };
    }

    // Maximum discount cannot exceed bill total
    const potentialDiscount = redeem / this.pointsPerDollar;
    const actualDiscount = Math.min(potentialDiscount, total);
    const actualPointsUsed = Math.round(actualDiscount * this.pointsPerDollar);
    const finalAmount = Math.max(0, total - actualDiscount);

    return {
      success: true,
      pointsRedeemed: actualPointsUsed,
      discountAmount: parseFloat(actualDiscount.toFixed(2)),
      remainingPoints: available - actualPointsUsed,
      finalBillAmount: parseFloat(finalAmount.toFixed(2))
    };
  }

  calculateTierDiscount(baseRate, tierName = 'Bronze') {
    const rate = parseFloat(baseRate) || 0;
    const rule = this.tierThresholds.find(t => t.tier.toLowerCase() === (tierName || 'Bronze').toLowerCase()) || this.tierThresholds[3];
    const discountAmount = (rate * rule.discountPercent) / 100;
    return {
      tier: rule.tier,
      discountPercent: rule.discountPercent,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      discountedRate: parseFloat((rate - discountAmount).toFixed(2))
    };
  }
}

module.exports = new LoyaltyManager();
