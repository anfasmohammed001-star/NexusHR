/**
 * Shared currency formatting helper (Indian Rupees - INR).
 */
export function formatCurrency(amount, fractionDigits = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount || 0);
}

