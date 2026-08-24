// ─── Raw regex constants ──────────────────────────────────────────────────────
// Use in react-hook-form: pattern: { value: REGEX, message: t('...') }

export const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s])[^\s]{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const INDIAN_NAME_REGEX = /^[A-Za-z\s'-]+$/;
export const WATCHLIST_NAME_REGEX = /^[A-Za-z0-9 ]+$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// ─── Standalone validators ────────────────────────────────────────────────────
// Use in react-hook-form: validate: { key: (v) => validateFn(v) || t('...') }
// Or call directly outside of forms.

export const validatePAN = (pan) => PAN_REGEX.test(pan);
export const validateIndianMobile = (mobile) => INDIAN_MOBILE_REGEX.test(mobile);
export const validateEmail = (email) => EMAIL_REGEX.test(email);
export const validatePassword = (password) => PASSWORD_REGEX.test(password);
export const validateIndianName = (name) => INDIAN_NAME_REGEX.test(name);
export const validateWatchlistName = (name) => WATCHLIST_NAME_REGEX.test(name);
export const validateRequiredField = (value) =>
  value !== null && value !== undefined && value.toString().trim() !== '';
export const validateNumericField = (value) =>
  !isNaN(value) && value !== null && value !== undefined && value !== '';

// Returns true if all 10 digits of a Phone number are identical (e.g. 9999999999).
export const hasAllSameDigits = (value) => /^(\d)\1{9}$/.test(value);

// Deep email format check — validates TLD length and rejects trivially repeated local parts.
// Use alongside EMAIL_REGEX for stricter signup validation.
export const validateEmailFormat = (value) => {
  const [localPart, domain] = (value || '').split('@');
  if (!localPart || localPart.length < 1 || !domain || domain.length < 3) return false;
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) return false;
  if (/^(.)\1+$/.test(localPart) && localPart.length < 3) return false;
  return true;
};
