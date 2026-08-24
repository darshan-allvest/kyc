'use client';

// ─────────────────────────────────────────────────────────────────────────────
// KYC onboarding flow — orchestrator.
//
// Frontend only. Every "API" call goes through src/services/kyc/mockKycService
// and resolves from dummy data after a simulated delay; there is no backend,
// no DigiLocker, no PAN/bank/e-sign/OTP provider anywhere in this flow.
// Flow state lives in KycFlowContext (React context + reducer) and is never
// persisted — a refresh starts the journey over by design.
// ─────────────────────────────────────────────────────────────────────────────

import { KycFlowProvider } from '@/contexts/KycFlowContext';
import { KYC_STEP } from '@/constants/kycConstants';
import useKycFlow from '@/hooks/kyc/useKycFlow';
import KycTestPanel from '@/components/kyc/KycTestPanel';
import MobileNumberStep from '@/components/kyc/steps/MobileNumberStep';
import OtpVerificationStep from '@/components/kyc/steps/OtpVerificationStep';
import AccountDetailsStep from '@/components/kyc/steps/AccountDetailsStep';
import KycStatusStep from '@/components/kyc/steps/KycStatusStep';
import KycMethodStep from '@/components/kyc/steps/KycMethodStep';
import DocumentUploadStep from '@/components/kyc/steps/DocumentUploadStep';
import DigiLockerStep from '@/components/kyc/steps/DigiLockerStep';
import PanVerificationStep from '@/components/kyc/steps/PanVerificationStep';
import GovernmentDataFetchStep from '@/components/kyc/steps/GovernmentDataFetchStep';
import ConfirmDetailsStep from '@/components/kyc/steps/ConfirmDetailsStep';
import PaymentStep from '@/components/kyc/steps/PaymentStep';
import BankDetailsStep from '@/components/kyc/steps/BankDetailsStep';
import NomineeStep from '@/components/kyc/steps/NomineeStep';
import VerificationStep from '@/components/kyc/steps/VerificationStep';
import SelfieVerificationStep from '@/components/kyc/steps/SelfieVerificationStep';
import SignatureStep from '@/components/kyc/steps/SignatureStep';
import DocumentPreviewStep from '@/components/kyc/steps/DocumentPreviewStep';
import AadhaarEsignStep from '@/components/kyc/steps/AadhaarEsignStep';
import KycSuccessStep from '@/components/kyc/steps/KycSuccessStep';

const STEP_COMPONENTS = {
  [KYC_STEP.MOBILE]: MobileNumberStep,
  [KYC_STEP.OTP]: OtpVerificationStep,
  [KYC_STEP.ACCOUNT]: AccountDetailsStep,
  [KYC_STEP.KYC_STATUS]: KycStatusStep,
  [KYC_STEP.METHOD_CHOICE]: KycMethodStep,
  [KYC_STEP.DOCUMENT_UPLOAD]: DocumentUploadStep,
  [KYC_STEP.DIGILOCKER]: DigiLockerStep,
  [KYC_STEP.PAN]: PanVerificationStep,
  [KYC_STEP.GOVERNMENT_FETCH]: GovernmentDataFetchStep,
  [KYC_STEP.CONFIRM_DETAILS]: ConfirmDetailsStep,
  [KYC_STEP.PAYMENT]: PaymentStep,
  [KYC_STEP.BANK_DETAILS]: BankDetailsStep,
  [KYC_STEP.NOMINEE]: NomineeStep,
  [KYC_STEP.VERIFICATION]: VerificationStep,
  [KYC_STEP.SELFIE]: SelfieVerificationStep,
  [KYC_STEP.SIGNATURE]: SignatureStep,
  [KYC_STEP.DOCUMENT]: DocumentPreviewStep,
  [KYC_STEP.AADHAAR_ESIGN]: AadhaarEsignStep,
  [KYC_STEP.SUCCESS]: KycSuccessStep,
};

function KycFlowRouter() {
  const { currentStep } = useKycFlow();
  const StepComponent = STEP_COMPONENTS[currentStep] ?? MobileNumberStep;

  return (
    <>
      <StepComponent />
      <KycTestPanel />
    </>
  );
}

export default function KycOnboardingFlow() {
  return (
    <KycFlowProvider>
      <KycFlowRouter />
    </KycFlowProvider>
  );
}
