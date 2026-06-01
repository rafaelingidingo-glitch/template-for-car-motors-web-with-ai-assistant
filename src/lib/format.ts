// ─── Shared Formatting Utilities ───
// Cached Intl.NumberFormat instances for performance —
// creating these on every render is expensive, so we reuse them.

/** Cached number formatter for price display (no decimals, with TSH prefix) */
const priceNumberFormatter = new Intl.NumberFormat("en-TZ", {
  maximumFractionDigits: 0,
});

/** Cached number formatter for mileage */
const mileageFormatter = new Intl.NumberFormat("en-TZ");

/**
 * Format a number as TSH (Tanzanian Shillings) currency string.
 * Example: 85000000 → "TSH 85,000,000"
 */
export function formatPrice(price: number): string {
  return `TSH ${priceNumberFormatter.format(price)}`;
}

/**
 * Format a number with thousand separators.
 * Example: 18500 → "18,500"
 */
export function formatMileage(mileage: number): string {
  return mileageFormatter.format(mileage);
}
