'use client';

import { useState } from 'react';
import KycLayout from '@/components/kyc/KycLayout';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import KycMethodSelection from '@/components/kyc/KycMethodSelection';
import { KYC_METHOD, KYC_STEP } from '@/constants/kycConstants';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step — how to share documents. Comes after PAN: the PAN is already verified,
 * so all that is left is choosing between a manual upload and DigiLocker.
 */
export default function KycMethodStep() {
  const { goToStep, updateFlow, kycMethod } = useKycFlow();
  const [selected, setSelected] = useState(kycMethod || KYC_METHOD.DIGILOCKER);

  const handleContinue = (method) => {
    updateFlow({ kycMethod: method });
    goToStep(method === KYC_METHOD.UPLOAD ? KYC_STEP.DOCUMENT_UPLOAD : KYC_STEP.DIGILOCKER);
  };

  return (
    <KycLayout
      title="Complete your KYC"
      subtitle="No KYC record was found, so we need your documents once. Choose how to share them."
      showStepper
      currentStep={KYC_STEP.METHOD_CHOICE}
      maxWidth="max-w-[30rem]"
      onBack={() => goToStep(KYC_STEP.PAN)}
    >
      <KycMethodSelection
        selected={selected}
        onSelect={setSelected}
        onContinue={handleContinue}
      />

      <KycDemoHint className="mt-4">
        Both options are simulated — no document is uploaded and DigiLocker is
        never contacted.
      </KycDemoHint>
    </KycLayout>
  );
}
