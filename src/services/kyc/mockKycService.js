// ─────────────────────────────────────────────────────────────────────────────
// Mock KYC service — the only "API" the onboarding flow talks to.
//
// Every function resolves to { success, data, error } after a simulated delay.
// No network call is made anywhere in this file: there is no DigiLocker, PAN,
// bank, e-sign or OTP provider behind it. Behaviour (success vs each failure
// case) is driven entirely by src/services/kyc/kycTestConfig.js.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PAN_REGEX,
  INDIAN_MOBILE_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  INDIAN_NAME_REGEX,
  hasAllSameDigits,
  validateEmailFormat,
} from '@/utils/formValidators';
import {
  IFSC_REGEX,
  ACCOUNT_NUMBER_REGEX,
  MPIN_LENGTH,
  MAX_NOMINEES,
  NOMINEE_STATEMENT_FLAG_VALUES,
  NOMINEE_STATEMENT_OPTIONS,
  PROFILE_FIELD_KEYS,
  PERMISSION_STATE,
} from '@/constants/kycConstants';
import { getKycTestConfig } from '@/services/kyc/kycTestConfig';
import {
  MOCK_OTP,
  MOCK_DIGILOCKER,
  MOCK_AADHAAR,
  MOCK_ACCOUNTS,
  findAccountByEmail,
  findAccountByMobile,
  resolveAccount,
  mockConsents,
  mockPayment,
  mockBankStatement,
  mockEsign,
  mockLocation,
  mockFinalDocument,
} from '@/services/kyc/mockKycData';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const wait = async (multiplier = 1) => {
  const { delay: base } = getKycTestConfig();
  await delay(Math.round(base * multiplier));
};

// 'auto' → whatever the signed-in demo account has; the other two force it.
const hasCompletedKyc = (identity) => {
  const { kycScenario } = getKycTestConfig();
  if (kycScenario === 'existing') return true;
  if (kycScenario === 'new') return false;
  return Boolean(resolveAccount(identity).kycCompleted);
};

const ok = (data = null) => ({ success: true, data, error: null });
const fail = (error, code = 'MOCK_ERROR') => ({ success: false, data: null, error, code });

// ─── Step 1 — mobile number ──────────────────────────────────────────────────
export async function sendOtp(mobile) {
  await wait();
  const digits = (mobile || '').replace(/\D/g, '');

  if (!digits) return fail('Enter your mobile number to continue.');
  if (!INDIAN_MOBILE_REGEX.test(digits) || hasAllSameDigits(digits))
    return fail('Enter a valid 10-digit Indian mobile number.');
  if (getKycTestConfig().failSendOtp)
    return fail('We could not send the OTP right now. Please try again.');

  const account = findAccountByMobile(digits);

  return ok({
    mobile: digits,
    accountId: account?.id ?? null,
    otpLength: MOCK_OTP.length,
    resendAfter: 30,
  });
}

// ─── Step 2 — OTP ────────────────────────────────────────────────────────────
export async function verifyOtp(mobile, otp) {
  await wait();
  const { failOtp, expireOtp } = getKycTestConfig();

  if (!otp || otp.length !== MOCK_OTP.length)
    return fail(`Enter the ${MOCK_OTP.length}-digit OTP.`);
  if (expireOtp) return fail('This OTP has expired. Request a new one.', 'OTP_EXPIRED');
  if (failOtp || otp !== MOCK_OTP)
    return fail('Incorrect OTP. Please check and try again.', 'OTP_INVALID');

  return ok({ mobile, otpVerified: true });
}

// ─── Step 3 — email ──────────────────────────────────────────────────────────
// The email screen only sends an OTP; the password and MPIN are set on their
// own screens once the address is verified.
export async function sendEmailOtp(email, { mobile } = {}) {
  await wait();
  const value = (email || '').trim().toLowerCase();

  if (!value) return fail('Enter your email address to continue.');
  if (!EMAIL_REGEX.test(value) || !validateEmailFormat(value))
    return fail('Enter a valid email address.');
  if (getKycTestConfig().failAccount)
    return fail('We could not send the OTP to this email. Please try again.');

  const account = findAccountByEmail(value);
  if (!account)
    return fail('This email is not part of the demo. Use one of the logins shown below.');

  // Both demo accounts exist, so a mismatched pair is a likely tester slip
  // rather than a real failure — name the right email instead of a dead end.
  const byMobile = findAccountByMobile(mobile);
  if (byMobile && byMobile.id !== account.id)
    return fail(
      `${account.email} is registered to another mobile number. For +91 ${byMobile.mobile}, continue with ${byMobile.email}.`
    );

  return ok({
    email: account.email,
    accountId: account.id,
    otpLength: MOCK_OTP.length,
    resendAfter: 30,
  });
}

// ─── Step 4 — email OTP ──────────────────────────────────────────────────────
export async function verifyEmailOtp(email, otp) {
  await wait();
  const { failOtp, expireOtp } = getKycTestConfig();

  if (!otp || otp.length !== MOCK_OTP.length)
    return fail(`Enter the ${MOCK_OTP.length}-digit OTP.`);
  if (expireOtp) return fail('This OTP has expired. Request a new one.', 'OTP_EXPIRED');
  if (failOtp || otp !== MOCK_OTP)
    return fail('Incorrect OTP. Please check and try again.', 'OTP_INVALID');

  const account = findAccountByEmail(email);

  return ok({
    accountId: account?.id ?? null,
    email: account?.email ?? email,
    name: account?.name ?? null,
    emailOtpVerified: true,
    accountVerified: true,
  });
}

// ─── Step 5 — set password ───────────────────────────────────────────────────
export async function setAccountPassword({ password, confirmPassword } = {}) {
  await wait(0.7);

  if (!password) return fail('Enter a password.');
  if (!PASSWORD_REGEX.test(password))
    return fail(
      'Use at least 8 characters with an uppercase, a lowercase, a number and a symbol.'
    );
  if (password !== confirmPassword) return fail('Both passwords must match.');
  if (getKycTestConfig().failAccount)
    return fail('We could not save your password. Please try again.');

  return ok({ passwordSet: true });
}

// ─── Step 6 — set MPIN ───────────────────────────────────────────────────────
export async function setMpin({ mpin, confirmMpin } = {}) {
  await wait(0.7);
  const digits = (mpin || '').replace(/\D/g, '');

  if (digits.length !== MPIN_LENGTH) return fail(`Enter a ${MPIN_LENGTH}-digit MPIN.`);
  if (/^(\d)\1+$/.test(digits)) return fail('Your MPIN cannot be the same digit repeated.');
  if (digits !== confirmMpin) return fail('Both MPINs must match.');
  if (getKycTestConfig().failAccount)
    return fail('We could not set your MPIN. Please try again.');

  return ok({ mpinSet: true });
}

// Google sign-in is simulated: it stands in for email + OTP + password, so the
// journey continues at the MPIN screen.
export async function verifyAccountWithGoogle({ mobile } = {}) {
  await wait(0.7);
  if (getKycTestConfig().failAccount)
    return fail('Google sign-in could not be completed. Please try again.');

  const account = resolveAccount({ mobile });

  return ok({
    accountId: account.id,
    email: account.email,
    name: account.name,
    provider: 'Google',
    accountVerified: true,
    emailOtpVerified: true,
    passwordSet: true,
  });
}

// ─── Step — verify the MPIN just set ────────────────────────────────────────
export async function verifyMpin({ mpin, entered } = {}) {
  await wait(0.6);
  const digits = (entered || '').replace(/\D/g, '');

  if (digits.length !== MPIN_LENGTH) return fail(`Enter your ${MPIN_LENGTH}-digit MPIN.`);
  if (!mpin) return fail('Set your MPIN again to continue.', 'MPIN_MISSING');
  if (digits !== mpin) return fail('Incorrect MPIN. Try again.', 'MPIN_INVALID');

  return ok({ mpinVerified: true });
}

// ─── Step 7 — KYC status ─────────────────────────────────────────────────────
export async function getKycStatus(identity) {
  await wait();
  const { failKycStatus } = getKycTestConfig();
  if (failKycStatus) return fail('We could not check your KYC status. Please retry.');

  return ok({ kycCompleted: hasCompletedKyc(identity), accountId: resolveAccount(identity).id });
}

export async function fetchExistingKyc(identity) {
  await wait();
  if (getKycTestConfig().failKycStatus)
    return fail('We could not fetch your KYC details. Please retry.');

  const account = resolveAccount(identity);
  // Forcing Scenario A on the no-KYC account still needs a record to show.
  const record = account.existingKyc ?? MOCK_ACCOUNTS[0].existingKyc;

  return ok(record);
}

// ─── DigiLocker portal auth: mobile → OTP → security PIN ─────────────────────
export async function sendDigiLockerOtp(aadhaar, identity) {
  await wait();
  const digits = (aadhaar || '').replace(/\D/g, '');

  if (digits.length !== 12)
    return fail('Enter the 12-digit Aadhaar number registered with DigiLocker.');
  if (/^(\d)\1{11}$/.test(digits)) return fail('Enter a valid Aadhaar number.');
  if (getKycTestConfig().failDigiLockerOtp)
    return fail('DigiLocker could not send an OTP right now. Please try again.');

  // The OTP goes to the mobile number UIDAI has on record for that Aadhaar.
  const { digiLocker } = resolveAccount(identity);

  return ok({ aadhaar: digits, sentTo: digiLocker.linkedMobile, resendAfter: 30 });
}

export async function verifyDigiLockerOtp(otp) {
  await wait();
  if (!otp || otp.length !== MOCK_DIGILOCKER.otp.length)
    return fail(`Enter the ${MOCK_DIGILOCKER.otp.length}-digit OTP.`);
  if (getKycTestConfig().failDigiLockerOtp || otp !== MOCK_DIGILOCKER.otp)
    return fail('Incorrect DigiLocker OTP. Please check and try again.', 'OTP_INVALID');

  return ok({ otpVerified: true });
}

export async function verifyDigiLockerPin(pin) {
  await wait();
  if (!pin || pin.length !== MOCK_DIGILOCKER.pin.length)
    return fail(`Enter your ${MOCK_DIGILOCKER.pin.length}-digit DigiLocker security PIN.`);
  if (getKycTestConfig().failDigiLockerPin || pin !== MOCK_DIGILOCKER.pin)
    return fail('Incorrect security PIN. Please try again.', 'PIN_INVALID');

  return ok({ pinVerified: true });
}

// ─── Step 8 — new KYC: DigiLocker ────────────────────────────────────────────
export async function fetchDigiLockerDetails(identity) {
  await wait(1.4);
  if (getKycTestConfig().failDigiLocker)
    return fail('DigiLocker could not be reached. Please try again.');

  return ok(resolveAccount(identity).digiLocker);
}

// ─── Step — edit the fetched profile fields ──────────────────────────────────
export async function updatePersonalDetails(details) {
  await wait(0.6);
  const fullName = (details?.fullName ?? '').trim();

  if ('fullName' in (details || {}) && !INDIAN_NAME_REGEX.test(fullName))
    return fail('Enter your name as it appears on your PAN.');
  if (getKycTestConfig().failPersonalDetailsUpdate)
    return fail('We could not save your changes. Please try again.');

  return ok(details);
}

// ─── Step — nominee ──────────────────────────────────────────────────────────
export async function saveNominee({
  nominees = [],
  optOut = false,
  optOutAcknowledged = false,
  statementPreferences = [],
  statementFlag = null,
}) {
  await wait();
  if (getKycTestConfig().failNominee)
    return fail('We could not save the nomination. Please try again.');

  if (optOut) {
    // Opting out is only valid with the Annexure-B declaration accepted.
    if (!optOutAcknowledged)
      return fail('Accept the opt-out declaration to continue without a nominee.');
    return ok({
      nominees: [],
      optOut: true,
      optOutAcknowledged: true,
      statementPreferences: [],
      statementFlag: null,
    });
  }

  if (!nominees.length) return fail('Add a nominee or choose to opt out.');
  if (nominees.length > MAX_NOMINEES)
    return fail(`You can add up to ${MAX_NOMINEES} nominees.`);

  const incomplete = nominees.some(
    (nominee) => !nominee.name?.trim() || !nominee.relationship || !nominee.dateOfBirth
  );
  if (incomplete) return fail('Complete every nominee before continuing.');

  // Optional details are only checked when they were filled in.
  const badContact = nominees.find(
    (nominee) =>
      (nominee.mobile && !INDIAN_MOBILE_REGEX.test(nominee.mobile)) ||
      (nominee.email && !EMAIL_REGEX.test(nominee.email))
  );
  if (badContact)
    return fail('Check the optional mobile or email you entered for a nominee.');

  const total = nominees.reduce((sum, nominee) => sum + Number(nominee.sharePercentage || 0), 0);
  if (total !== 100) return fail(`Nominee shares must add up to 100% (currently ${total}%).`);

  // One or both boxes may be ticked, but not neither.
  const preferences = statementPreferences.filter((id) =>
    NOMINEE_STATEMENT_OPTIONS.some((option) => option.id === id)
  );
  if (!preferences.length)
    return fail('Choose what should be printed in your account holding statements.');
  // Printing only the flag needs the answer that goes with it.
  const flag = preferences.includes('FLAG') ? statementFlag : null;
  if (preferences.includes('FLAG') && !NOMINEE_STATEMENT_FLAG_VALUES.includes(flag))
    return fail('Choose Yes or No for whether nomination is given.');

  return ok({
    nominees: nominees.map((nominee) => ({
      ...nominee,
      name: nominee.name.trim(),
      sharePercentage: String(nominee.sharePercentage),
    })),
    optOut: false,
    optOutAcknowledged: false,
    statementPreferences: preferences,
    statementFlag: flag,
  });
}


// ─── Step — consent ──────────────────────────────────────────────────────────
export async function saveConsent({ accepted = [] }) {
  await wait();
  if (getKycTestConfig().failConsent)
    return fail('We could not record your consent. Please try again.');

  const missing = mockConsents
    .filter((consent) => consent.required && !accepted.includes(consent.id))
    .map((consent) => consent.label);
  if (missing.length) return fail(`Accept the required items: ${missing.join(', ')}.`);

  return ok({ accepted, recordedAt: 'Captured during onboarding' });
}

// ─── Step 9 — PAN ────────────────────────────────────────────────────────────
// The PAN is never typed in this journey: it is resolved against the verified
// mobile/email (an existing KYC record wins when there is one). Resolution is
// synchronous — the screen shows the PAN as soon as it opens, with no wait.
export function resolvePanDetails(identity, { existingPan } = {}) {
  if (getKycTestConfig().failPan)
    return fail('We could not fetch your PAN details right now. Please try again.');

  const account = resolveAccount(identity);
  const pan = (existingPan || account.panDetails.pan || '').toUpperCase();
  if (!PAN_REGEX.test(pan))
    return fail('No PAN is linked to these details. Contact support to continue.');

  // The card view also shows what is printed on a PAN card itself.
  const { fathersName, dateOfBirth } = account.personalDetails ?? {};

  return ok({ ...account.panDetails, pan, fathersName, dateOfBirth, fetched: true });
}

// ─── Step 10 — "fetch details" simulation ────────────────────────────────────
/**
 * Simulated staged fetch. `onStage(stageId, status)` is called with
 * status 'loading' | 'done' so the UI can animate each stage.
 */
export async function fetchGovernmentDetails({ onStage, identity } = {}) {
  // Only the stages the UI shows are stepped through; the bank record still
  // comes back in the payload below.
  const stages = ['pan', 'personal'];
  const { failGovernmentFetch } = getKycTestConfig();

  for (let i = 0; i < stages.length; i += 1) {
    onStage?.(stages[i], 'loading');
    await wait(0.8);
    if (failGovernmentFetch && i === 1) {
      onStage?.(stages[i], 'error');
      return fail('We could not fetch your details. Please retry.');
    }
    onStage?.(stages[i], 'done');
  }

  const account = resolveAccount(identity);
  // Government records carry identity data only. With no KYC record on file
  // there is nothing to fall back on for the profile fields, so they come back
  // blank and the applicant fills them in on the profile step.
  const personalDetails = hasCompletedKyc(identity)
    ? account.personalDetails
    : PROFILE_FIELD_KEYS.reduce(
        (acc, key) => ({ ...acc, [key]: '' }),
        { ...account.personalDetails }
      );

  return ok({
    panDetails: account.panDetails,
    personalDetails,
    bankDetails: account.bankDetails,
  });
}

// ─── Step 10 — bank account ──────────────────────────────────────────────────
export async function verifyBankAccount(
  { accountNumber, confirmAccountNumber, ifsc, accountType },
  identity
) {
  await wait(1.6);
  const { failBankVerification, bankNameMismatch } = getKycTestConfig();

  if (!ACCOUNT_NUMBER_REGEX.test(accountNumber || ''))
    return fail('Enter a valid account number (9-18 digits).');
  if (accountNumber !== confirmAccountNumber)
    return fail('Account numbers do not match.', 'ACCOUNT_MISMATCH');
  if (!IFSC_REGEX.test((ifsc || '').toUpperCase()))
    return fail('Enter a valid IFSC code (e.g. TEST0001234).');
  if (bankNameMismatch)
    return fail(
      'The name on this bank account does not match your PAN records.',
      'NAME_MISMATCH'
    );
  if (failBankVerification)
    return fail('Bank account verification failed. Please re-check your details.');

  return ok({
    ...resolveAccount(identity).bankDetails,
    accountNumber,
    ifsc: (ifsc || '').toUpperCase(),
    accountType: accountType || resolveAccount(identity).bankDetails.accountType,
    verified: true,
    pennyDropAmount: 1,
  });
}

// ─── Step — account opening payment ──────────────────────────────────────────
// ─── Step — bank statement (income proof for F&O) ────────────────────────────
export async function fetchBankStatement({ accountNumber, ifsc } = {}, identity) {
  await wait(1.4);
  if (!ACCOUNT_NUMBER_REGEX.test(accountNumber || ''))
    return fail('Enter a valid account number before fetching the statement.');
  if (!IFSC_REGEX.test(ifsc || ''))
    return fail('Enter a valid IFSC before fetching the statement.');
  if (getKycTestConfig().failBankStatement)
    return fail('We could not fetch your bank statement. Please try again.');

  const account = resolveAccount(identity);

  return ok({
    ...mockBankStatement,
    bankName: account.bankDetails?.bankName ?? 'Test Bank',
    accountNumber,
    fetchedAt: 'Fetched just now',
  });
}

export async function payAccountOpeningFee({ method, app, bank } = {}) {
  await wait(1.6);
  if (getKycTestConfig().failPayment)
    return fail('The payment could not be completed. Try another method.', 'PAYMENT_FAILED');
  if (!method) return fail('Choose how you would like to pay.');

  return ok({
    method,
    app: app ?? null,
    bank: bank ?? null,
    amount: mockPayment.total,
    reference: 'PAY-TEST-58120',
    paidAt: 'Captured during onboarding',
  });
}

// ─── Step 11 — e-sign ────────────────────────────────────────────────────────
export async function verifyEsign() {
  await wait(1.4);
  if (getKycTestConfig().failEsign)
    return fail('E-Sign verification failed. Please try again.');

  return ok({ ...mockEsign, esignVerified: true });
}

// ─── Final step — Aadhaar e-sign on the account opening form ─────────────────
export async function sendAadhaarOtp(aadhaar) {
  await wait();
  const digits = (aadhaar || '').replace(/\D/g, '');

  if (digits.length !== 12) return fail('Enter your 12-digit Aadhaar number.');
  if (/^(\d)\1{11}$/.test(digits)) return fail('Enter a valid Aadhaar number.');
  if (getKycTestConfig().failAadhaarOtp)
    return fail('UIDAI could not send an OTP right now. Please try again.');

  return ok({ aadhaar: digits, otpLength: MOCK_AADHAAR.otp.length, resendAfter: 30 });
}

export async function verifyAadhaarEsign(otp) {
  await wait(1.4);
  if (!otp || otp.length !== MOCK_AADHAAR.otp.length)
    return fail(`Enter the ${MOCK_AADHAAR.otp.length}-digit Aadhaar OTP.`);
  if (getKycTestConfig().failAadhaarEsign || otp !== MOCK_AADHAAR.otp)
    return fail('Incorrect Aadhaar OTP. The document was not signed.', 'OTP_INVALID');

  return ok({
    esp: MOCK_AADHAAR.esp,
    reference: MOCK_AADHAAR.signatureReference,
    signedAt: 'Signed during onboarding',
  });
}

// ─── Step 12 — location ──────────────────────────────────────────────────────
export async function verifyLocation() {
  await wait(0.9);
  const { locationOutcome } = getKycTestConfig();

  if (locationOutcome === PERMISSION_STATE.DENIED)
    return fail('Location access was denied. Enable it to continue verification.', PERMISSION_STATE.DENIED);
  if (locationOutcome === PERMISSION_STATE.UNAVAILABLE)
    return fail('Location is unavailable on this device.', PERMISSION_STATE.UNAVAILABLE);

  return ok(mockLocation);
}

// ─── Step 13/14 — selfie + signature (kept in React state only) ─────────────
export async function submitSelfie() {
  await wait(0.8);
  return ok({ selfieVerified: true });
}

export async function submitSignature({ drawn, uploaded } = {}) {
  await wait(0.8);
  // Either way of signing is accepted, but one of them is required.
  if (!drawn && !uploaded?.dataUrl)
    return fail('Sign in the box or upload a picture of your signature.');

  return ok({
    signatureCaptured: Boolean(drawn),
    signatureUploaded: Boolean(uploaded?.dataUrl),
  });
}

// ─── Step 15 — final document ────────────────────────────────────────────────
export async function generateFinalDocument() {
  await wait(1.8);
  if (getKycTestConfig().failDocumentGeneration)
    return fail('We could not prepare your documents. Please try again.');

  return ok(mockFinalDocument);
}

export async function completeKyc() {
  await wait();
  return ok({ kycCompleted: true, applicationId: 'APP-TEST-77120' });
}

const mockKycService = {
  delay,
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  verifyEmailOtp,
  setAccountPassword,
  setMpin,
  verifyMpin,
  verifyAccountWithGoogle,
  getKycStatus,
  fetchExistingKyc,
  sendDigiLockerOtp,
  verifyDigiLockerOtp,
  verifyDigiLockerPin,
  fetchDigiLockerDetails,
  updatePersonalDetails,
  saveNominee,
  saveConsent,
  resolvePanDetails,
  fetchGovernmentDetails,
  verifyBankAccount,
  fetchBankStatement,
  payAccountOpeningFee,
  verifyEsign,
  sendAadhaarOtp,
  verifyAadhaarEsign,
  verifyLocation,
  submitSelfie,
  submitSignature,
  generateFinalDocument,
  completeKyc,
};

export default mockKycService;
