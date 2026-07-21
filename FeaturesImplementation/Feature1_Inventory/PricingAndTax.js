// Pricing and Tax Engine

// Function to calculate price per night with tax
function calculatePrice(baseRate, taxRate) {
  const tax = baseRate * (taxRate / 100);
  const total = baseRate + tax;
  console.log(`Base Rate: ${baseRate}, Tax: ${tax}, Total: ${total}`);
  return total;
}

// Function to update tax settings
function updateTaxSettings(newTaxRate) {
  // Logic to update tax rate in the system
  console.log(`Updating tax rate to ${newTaxRate}%`);
}

module.exports = { calculatePrice, updateTaxSettings };