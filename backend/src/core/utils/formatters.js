/**
 * Currency & Formatting Utilities
 * All financial amounts in Shiri Mandir are stored as integer PAISE to eliminate floating-point inaccuracies.
 */

export function paiseToInr(paise) {
  if (paise === null || paise === undefined) return 0;
  return Number(paise) / 100;
}

export function inrToPaise(inr) {
  if (inr === null || inr === undefined) return 0;
  return Math.round(Number(inr) * 100);
}

/**
 * Mask sensitive devotee information if consent_data_sharing is false
 */
export function maskDevoteeData(devotee) {
  if (!devotee) return devotee;
  if (devotee.consent_data_sharing) return devotee;

  const masked = { ...devotee };
  if (masked.phone) {
    masked.phone = masked.phone.replace(/(\d{2})\d+(\d{2})/, '$1******$2');
  }
  if (masked.email) {
    const parts = masked.email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      masked.email = `${name.slice(0, 2)}***@${parts[1]}`;
    }
  }
  if (masked.sankalp_gotra && !masked.consent_data_sharing) {
    // Keep gotra if devotee explicitly entered for puja, but mask personal identifier if requested
  }
  return masked;
}
