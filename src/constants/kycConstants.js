// Frontend-only KYC onboarding flow — shared constants.
// Nothing here talks to a backend; the whole journey runs on mock data
// (src/services/kyc/*). See docs note in KycOnboardingFlow.jsx.

// ─── Flow steps ───────────────────────────────────────────────────────────────
// Every screen of the journey. `currentStep` in KycFlowContext holds one of these.
export const KYC_STEP = Object.freeze({
  MOBILE: 'MOBILE',
  OTP: 'OTP',
  EMAIL: 'EMAIL',
  EMAIL_OTP: 'EMAIL_OTP',
  PASSWORD: 'PASSWORD',
  MPIN: 'MPIN',
  MPIN_VERIFY: 'MPIN_VERIFY',
  KYC_STATUS: 'KYC_STATUS',
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
  [KYC_STEP.EMAIL]: 'BASIC',
  [KYC_STEP.EMAIL_OTP]: 'BASIC',
  [KYC_STEP.PASSWORD]: 'BASIC',
  [KYC_STEP.MPIN]: 'BASIC',
  [KYC_STEP.MPIN_VERIFY]: 'BASIC',
  [KYC_STEP.KYC_STATUS]: 'BASIC',
  [KYC_STEP.PAN]: 'BASIC',
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
// DigiLocker is the only way to share documents — the manual upload journey was
// removed, so an applicant without a KYC record always goes through DigiLocker.
export const KYC_METHOD = Object.freeze({
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

// Login credentials set during onboarding.
export const MPIN_LENGTH = 4;

// The OTPs we issue ourselves — mobile, email, DigiLocker portal sign-in.
export const OTP_LENGTH = 4;
// UIDAI issues its own OTP for the Aadhaar e-sign and that one is 6 digits.
export const AADHAAR_OTP_LENGTH = 6;

export const ACCOUNT_TYPES = Object.freeze(['Savings', 'Current']);

// ─── Nominee (Step: Nominee) ─────────────────────────────────────────────────
// SEBI allows up to three nominees; their shares must add up to 100%.
export const MAX_NOMINEES = 3;

// "I want the following nomination details to be printed in the account holding
// statements" — exactly one of these is ticked.
export const NOMINEE_STATEMENT_OPTIONS = Object.freeze([
  { id: 'NAMES', label: 'Name of the Nominee(s)' },
  { id: 'FLAG', label: 'Whether nomination given: Yes / No (not the name of the nominee)' },
]);

// SEBI Annexure-B — the declaration an applicant signs when opting out of
// nomination. Shown in full on the Nominee step before the opt-out is accepted.
export const NOMINEE_OPT_OUT_DECLARATION = Object.freeze({
  title: 'Declaration for Opting-out of Nomination',
  intro:
    'I hereby confirm that I do not wish to appoint any nominee(s) to my demat account / mutual fund folio at this point of time.',
  understandingLabel: 'I understand that —',
  points: Object.freeze([
    'the nomination helps to quickly identify the person for transfer of securities and helps in faster and smoother transmission of my securities to my legal heir(s) after my demise.',
    'in the absence of a nomination, my legal heir(s) may require the submission of certain additional legal or court-issued documents which may delay the process of transmission of securities to my legal heir(s).',
    'if no claim is made on the account / folio for a prolonged period after my demise, the holdings may be treated as unclaimed assets and they may be transferred to Investor Education and Protection Fund Authority (IEPF) in accordance with the applicable regulatory framework.',
  ]),
  confirmation:
    'I confirm that I have understood the above implications and that my decision to opt out of nomination is voluntary.',
});

// Optional per-nominee identifier document (SEBI nomination form, part 3d).
export const NOMINEE_ID_DOCUMENTS = Object.freeze([
  'Aadhaar (last 4)',
  'PAN',
  'Driving Licence',
  'Passport',
]);

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

// ─── Profile fields (Step: Profile Details / Confirm Details) ────────────────
// The government fetch does not return these, so an applicant without a KYC
// record fills them in; they are also the fields Edit Details may correct.
export const PROFILE_FIELDS = Object.freeze([
  {
    key: 'occupation',
    label: 'Occupation',
    options: Object.freeze([
      'Private Sector',
      'Public Sector',
      'Government Service',
      'Business',
      'Professional',
      'Student',
      'Retired',
      'Housewife',
      'Agriculturist',
    ]),
  },
  {
    key: 'maritalStatus',
    label: 'Marital Status',
    options: Object.freeze(['Single', 'Married']),
  },
  {
    key: 'incomeRange',
    label: 'Gross Annual Income',
    options: Object.freeze([
      'Below ₹1 lakh',
      '₹1 - 5 lakh',
      '₹5 - 10 lakh',
      '₹10 - 25 lakh',
      'Above ₹25 lakh',
    ]),
  },
  {
    key: 'sourceOfWealth',
    label: 'Source Of Income',
    options: Object.freeze(['Salary', 'Business income', 'Investments', 'Ancestral', 'Other']),
  },
  {
    key: 'tradingExperience',
    label: 'Trading Experience',
    options: Object.freeze(['No experience', 'Less than 1 Year', '1 - 5 Years', 'More than 5 Years']),
  },
]);

export const PROFILE_FIELD_KEYS = Object.freeze(PROFILE_FIELDS.map((field) => field.key));

// ─── Declarations (Step: Verify Details) ─────────────────────────────────────
// Running-account settlement periods a broker may offer.
export const RUNNING_ACCOUNT_SETTLEMENT = Object.freeze(['90 days', '30 days', 'Daily']);

// ─── Signature (Step: Signature) ─────────────────────────────────────────────
// Both a drawn signature and an uploaded image of it are required.
export const SIGNATURE_UPLOAD = Object.freeze({
  acceptedTypes: Object.freeze(['image/png', 'image/jpeg']),
  maxBytes: 2 * 1024 * 1024,
});

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
