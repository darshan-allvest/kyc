'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Centralised state for the KYC onboarding flow.
//
// Plain React context + reducer — no new state library, and deliberately no
// localStorage/sessionStorage: everything (selfie, signature, personal details)
// lives in memory for the lifetime of the flow only.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { KYC_STEP, PERMISSION_STATE } from '@/constants/kycConstants';

const initialState = {
  currentStep: KYC_STEP.MOBILE,
  visitedSteps: [KYC_STEP.MOBILE],

  mobileNumber: '',
  otpVerified: false,
  // Consent ticked on the first screen.
  termsAccepted: false,
  entityTermsAccepted: false,
  // Which demo account the journey runs as (see mockKycData MOCK_ACCOUNTS).
  accountId: null,

  account: null, // { email, name, provider }
  accountVerified: false,
  emailOtpVerified: false,
  passwordSet: false,
  mpinSet: false,
  // Demo only: the MPIN is held in memory so the next screen can verify it.
  // A real journey would never keep it client-side.
  mpin: null,
  mpinVerified: false,

  kycCompleted: null, // null = not checked yet
  existingKyc: null,
  kycMethod: null, // KYC_METHOD.DIGILOCKER
  digiLockerData: null,
  digiLockerSelection: [], // ids of the DigiLocker documents shared with us

  panVerified: false,
  panDetails: null,

  personalDetails: null,
  bankDetails: null, // fetched (read-only) bank info
  declarationAccepted: false,
  declarations: null, // accepted declaration ids from the Confirm screen
  optionalDeclarations: [],
  segments: null, // ['cashMf', 'fno']
  fnoSelected: false,

  riskDisclosureAccepted: false, // acknowledged when F&O is activated
  paymentMethod: null, // 'UPI' | 'BANK' — chosen on the payment screen
  payment: null, // { method, app, bank, amount, reference }
  nominees: [], // up to MAX_NOMINEES, shares adding up to 100%
  nomineeOptOut: false,
  nomineeOptOutAcknowledged: false, // SEBI Annexure-B declaration
  nomineeStatementPreferences: [], // NOMINEE_STATEMENT_OPTIONS ids — one or both
  nomineeStatementFlag: null, // 'Yes' | 'No' — printed when the FLAG option is ticked
  consents: [], // ids from mockConsents
  runningAccountSettlement: null, // '90 days' | '30 days'
  ddpiAccepted: false,

  bankStatement: null, // fetched statement — income proof for F&O
  submittedBankDetails: null, // what the user typed
  bankVerified: false,

  esignVerified: false,
  locationPermission: PERMISSION_STATE.IDLE,
  location: null,

  selfie: null, // data URL, in memory only
  signature: null, // drawn signature, data URL, in memory only
  signatureUpload: null, // { dataUrl, fileName, size } — uploaded signature image

  aadhaarEsign: null, // { esp, reference, signedAt } from the final e-sign
  documentGenerated: false,
  finalDocument: null,
};

const ACTION = {
  GO_TO_STEP: 'GO_TO_STEP',
  PATCH: 'PATCH',
  RESET: 'RESET',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION.GO_TO_STEP:
      return {
        ...state,
        currentStep: action.step,
        visitedSteps: state.visitedSteps.includes(action.step)
          ? state.visitedSteps
          : [...state.visitedSteps, action.step],
      };
    case ACTION.PATCH:
      return { ...state, ...action.patch };
    case ACTION.RESET:
      return { ...initialState };
    default:
      return state;
  }
}

const KycFlowContext = createContext(null);

export function KycFlowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goToStep = useCallback(
    (step) => dispatch({ type: ACTION.GO_TO_STEP, step }),
    []
  );
  const updateFlow = useCallback(
    (patch) => dispatch({ type: ACTION.PATCH, patch }),
    []
  );
  const resetFlow = useCallback(() => dispatch({ type: ACTION.RESET }), []);

  const value = useMemo(
    () => ({ ...state, goToStep, updateFlow, resetFlow }),
    [state, goToStep, updateFlow, resetFlow]
  );

  return <KycFlowContext.Provider value={value}>{children}</KycFlowContext.Provider>;
}

export function useKycFlowContext() {
  const context = useContext(KycFlowContext);
  if (!context)
    throw new Error('useKycFlowContext must be used inside <KycFlowProvider>');
  return context;
}

export { initialState as kycInitialState };
