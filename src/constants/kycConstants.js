// Frontend-only KYC onboarding flow — shared constants.
// Nothing here talks to a backend; the whole journey runs on mock data
// (src/services/kyc/*). See docs note in KycOnboardingFlow.jsx.

// ─── Flow steps ───────────────────────────────────────────────────────────────
// Every screen of the journey. `currentStep` in KycFlowContext holds one of these.
export const KYC_STEP = Object.freeze({
  MOBILE: 'MOBILE',
  OTP: 'OTP',
  ACCOUNT: 'ACCOUNT',
  KYC_STATUS: 'KYC_STATUS',
  METHOD_CHOICE: 'METHOD_CHOICE',
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DIGILOCKER: 'DIGILOCKER',
  // The PAN screen *is* the "Basic Details" milestone: PAN is the only thing
  // asked there, exactly as a broker's own journey does it.
  PAN: 'PAN',
  GOVERNMENT_FETCH: 'GOVERNMENT_FETCH',
  CONFIRM_DETAILS: 'CONFIRM_DETAILS',
  PAYMENT: 'PAYMENT',
  BANK_DETAILS: 'BANK_DETAILS',
  NOMINEE: 'NOMINEE',
  VERIFICATION: 'VERIFICATION',
  SELFIE: 'SELFIE',
  SIGNATURE: 'SIGNATURE',
  DOCUMENT: 'DOCUMENT',
  AADHAAR_ESIGN: 'AADHAAR_ESIGN',
  SUCCESS: 'SUCCESS',
});

// ─── Stepper ──────────────────────────────────────────────────────────────────
// The 7 user-facing milestones, matching the account-opening journey a broker
// runs: Basic Details → PAN → Verify Details → Additional → Bank → Nominee →
// Consent. Each flow step maps onto one milestone, so the stepper stays stable
// even though there are more screens than milestones.
export const KYC_STEPPER_STEPS = Object.freeze([
  { key: 'BASIC', label: 'Basic Details', shortLabel: 'Basic' },
  { key: 'PAN', label: 'PAN', shortLabel: 'PAN' },
  { key: 'VERIFY', label: 'Verify Details', shortLabel: 'Verify' },
  { key: 'PAYMENT', label: 'Payment', shortLabel: 'Payment' },
  { key: 'BANK', label: 'Bank', shortLabel: 'Bank' },
  { key: 'NOMINEE', label: 'Nominee', shortLabel: 'Nominee' },
  { key: 'CONSENT', label: 'Consent', shortLabel: 'Consent' },
]);

export const STEP_TO_STEPPER_KEY = Object.freeze({
  [KYC_STEP.MOBILE]: 'BASIC',
  [KYC_STEP.OTP]: 'BASIC',
  [KYC_STEP.ACCOUNT]: 'BASIC',
  [KYC_STEP.KYC_STATUS]: 'BASIC',
  [KYC_STEP.PAN]: 'BASIC',
  [KYC_STEP.METHOD_CHOICE]: 'PAN',
  [KYC_STEP.DOCUMENT_UPLOAD]: 'PAN',
  [KYC_STEP.DIGILOCKER]: 'PAN',
  [KYC_STEP.GOVERNMENT_FETCH]: 'VERIFY',
  [KYC_STEP.CONFIRM_DETAILS]: 'VERIFY',
  [KYC_STEP.PAYMENT]: 'PAYMENT',
  [KYC_STEP.BANK_DETAILS]: 'BANK',
  [KYC_STEP.NOMINEE]: 'NOMINEE',
  // Consent is captured inside the e-sign modal, so the whole signing phase
  // sits under that milestone.
  [KYC_STEP.VERIFICATION]: 'CONSENT',
  [KYC_STEP.SELFIE]: 'CONSENT',
  [KYC_STEP.SIGNATURE]: 'CONSENT',
  [KYC_STEP.DOCUMENT]: 'CONSENT',
  [KYC_STEP.AADHAAR_ESIGN]: 'CONSENT',
  [KYC_STEP.SUCCESS]: 'CONSENT',
});

// ─── KYC methods (Scenario B) ────────────────────────────────────────────────
export const KYC_METHOD = Object.freeze({
  UPLOAD: 'UPLOAD',
  DIGILOCKER: 'DIGILOCKER',
});

// ─── Permission states ───────────────────────────────────────────────────────
export const PERMISSION_STATE = Object.freeze({
  IDLE: 'IDLE',
  PROMPTING: 'PROMPTING',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  UNAVAILABLE: 'UNAVAILABLE',
});

// ─── Validation ──────────────────────────────────────────────────────────────
// PAN / mobile regexes already live in src/utils/formValidators.js and are
// reused from there. IFSC + account number are KYC-only, so they stay local.
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;

export const ACCOUNT_TYPES = Object.freeze(['Savings', 'Current']);

// ─── Nominee (Step: Nominee) ─────────────────────────────────────────────────
export const NOMINEE_RELATIONSHIPS = Object.freeze([
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Other',
]);

// ─── Declarations (Step: Verify Details) ─────────────────────────────────────
// Running-account settlement periods a broker may offer.
export const RUNNING_ACCOUNT_SETTLEMENT = Object.freeze(['90 days', '30 days']);

// ─── Assets ──────────────────────────────────────────────────────────────────
export const KYC_LOGO_SRC = '/assets/logo/allvest-horizontal-logo.avif';

// ─── Typography (spec: title 16 / subtitle 14 / body 12) ─────────────────────
// Pixel sizes are declared in tailwind.config.js with matching line-heights.
export const KYC_TYPO = Object.freeze({
  title: 'text-[16px] font-semibold',
  subtitle: 'text-[14px] font-normal',
  body: 'text-[12px] font-normal',
  label: 'text-[12px] font-medium',
});
