// Display helpers for the KYC flow. Sensitive-looking values are masked in the
// UI even though every value in this demo is dummy test data.

/** 123456789012 → XXXX XXXX 9012 */
export const maskAccountNumber = (accountNumber) => {
  const digits = (accountNumber || '').replace(/\s/g, '');
  if (digits.length <= 4) return digits;
  const last4 = digits.slice(-4);
  const hiddenGroups = Math.min(2, Math.ceil((digits.length - 4) / 4));
  return `${'XXXX '.repeat(hiddenGroups)}${last4}`.trim();
};

/** ABCDE1234F → ABCXXXXX4F */
export const maskPan = (pan) => {
  const value = (pan || '').toUpperCase();
  if (value.length !== 10) return value;
  return `${value.slice(0, 3)}XXXXX${value.slice(8)}`;
};

/** 9876543210 → +91 98765 43210 (display only) */
export const formatMobile = (mobile) => {
  const digits = (mobile || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return mobile || '';
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

/** 9876543210 → +91 98XXX XXX10 (masked, used on the OTP screen) */
export const maskMobile = (mobile) => {
  const digits = (mobile || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return mobile || '';
  return `+91 ${digits.slice(0, 2)}XXX XXX${digits.slice(8)}`;
};
