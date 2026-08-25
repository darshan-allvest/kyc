// ─────────────────────────────────────────────────────────────────────────────
// KYC demo switchboard — the ONE place to flip every test scenario.
//
// Edit DEFAULT_KYC_TEST_CONFIG below and reload, or flip the same switches at
// runtime from the on-screen test panel (bottom-right beaker button, dev only).
// Nothing here reaches a backend; it only steers the mock service layer.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_KYC_TEST_CONFIG = {
  // ── Scenario A vs B ──────────────────────────────────────────────────────
  // 'auto'     → follow the signed-in demo account (see MOCK_ACCOUNTS):
  //              9876543210 / rahul.sharma@example.com has KYC,
  //              9123456780 / priya.mehta@example.com does not
  // 'existing' → force Scenario A (fetch & review an existing record)
  // 'new'      → force Scenario B (DigiLocker)
  kycScenario: 'auto',

  // ── Simulated API latency (ms) ───────────────────────────────────────────
  delay: 900,

  // ── Negative cases ───────────────────────────────────────────────────────
  failSendOtp: false, // "Sending OTP..." → failure
  failOtp: false, // any OTP is rejected (otherwise only MOCK_OTP passes)
  expireOtp: false, // OTP reported as expired
  failAccount: false, // email/password sign-in fails
  failKycStatus: false, // KYC status lookup fails
  failDigiLockerOtp: false, // DigiLocker OTP send/verify fails
  failDigiLockerPin: false, // DigiLocker security PIN is rejected
  failDigiLocker: false, // DigiLocker document fetch fails
  failPan: false, // PAN verification fails (valid format, records not found)
  failGovernmentFetch: false, // fetching PAN/personal/bank details fails
  failPersonalDetailsUpdate: false, // editing the fetched profile fields fails
  failNominee: false, // saving the nomination fails
  failConsent: false, // recording consent fails
  failBankVerification: false, // ₹1 penny-drop verification fails
  bankNameMismatch: false, // bank holder name ≠ PAN name
  failPayment: false, // account-opening payment fails
  failEsign: false, // e-sign verification fails
  failAadhaarOtp: false, // Aadhaar OTP for the final e-sign cannot be sent
  failAadhaarEsign: false, // the Aadhaar e-sign is rejected
  locationOutcome: 'GRANTED', // GRANTED | DENIED | UNAVAILABLE
  cameraOutcome: 'GRANTED', // GRANTED | DENIED | UNAVAILABLE
  useRealDeviceCamera: true, // false → skip getUserMedia, use mock capture
  failDocumentGeneration: false, // final document generation fails
};

let config = { ...DEFAULT_KYC_TEST_CONFIG };
const listeners = new Set();

export const getKycTestConfig = () => config;

export const setKycTestConfig = (patch) => {
  config = { ...config, ...patch };
  listeners.forEach((listener) => listener(config));
};

export const resetKycTestConfig = () => setKycTestConfig(DEFAULT_KYC_TEST_CONFIG);

export const subscribeKycTestConfig = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
