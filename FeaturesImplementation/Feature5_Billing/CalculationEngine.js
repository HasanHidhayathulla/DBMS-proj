// Calculation Engine

// Function to calculate billing totals
function calculateTotals(subtotal, taxRate) {
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  console.log(`Subtotal: ${subtotal}, Tax: ${tax}, Total: ${total}`);
  return { subtotal, tax, total };
}

module.exports = { calculateTotals };