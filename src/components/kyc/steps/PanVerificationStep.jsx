'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/button/Button';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import KycPanCard from '@/components/kyc/KycPanCard';
import { KYC_STEP } from '@/constants/kycConstants';
import { resolvePanDetails } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step — PAN. The PAN is resolved from the verified mobile/email (simulated; no
 * PAN service is called) and fills the field read-only the moment the screen
 * opens: there is nothing to type and nothing to wait for.
 */
export default function PanVerificationStep() {
  const {
    goToStep,
    updateFlow,
    existingKyc,
    kycCompleted,
    accountId,
    mobileNumber,
    account,
    panDetails,
    personalDetails,
  } = useKycFlow();

  // Always resolve: a PAN record already in flow state can come from the
  // government fetch, which does not carry what the card prints.
  const [resolved] = useState(() =>
    resolvePanDetails(
      { accountId, mobile: mobileNumber, email: account?.email },
      { existingPan: existingKyc?.pan || panDetails?.pan }
    )
  );

  const resolvedDetails = resolved.success ? resolved.data : null;
  // The card prints what a PAN card prints — fall back to anything already on
  // file for a field the PAN lookup itself did not carry.
  const details = resolvedDetails && {
    ...resolvedDetails,
    name: resolvedDetails.name || panDetails?.name || personalDetails?.fullName,
    fathersName:
      resolvedDetails.fathersName || panDetails?.fathersName || personalDetails?.fathersName,
    dateOfBirth:
      resolvedDetails.dateOfBirth || panDetails?.dateOfBirth || personalDetails?.dateOfBirth,
  };
  // Continue reveals the PAN card below; Submit then moves the journey on.
  const [showCard, setShowCard] = useState(false);

  // Record the PAN once, without holding up the render.
  useEffect(() => {
    if (!details || panDetails?.dateOfBirth === details.dateOfBirth) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (active) updateFlow({ panVerified: true, panDetails: details });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details?.pan, details?.dateOfBirth, panDetails?.dateOfBirth, updateFlow]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!details) return;

    if (!showCard) {
      setShowCard(true);
      return;
    }

    // With a record on file the details can be fetched straight away; a new
    // applicant shares documents through DigiLocker.
    goToStep(kycCompleted ? KYC_STEP.GOVERNMENT_FETCH : KYC_STEP.DIGILOCKER);
  };

  return (
    <KycLayout
      title="Basic details"
      subtitle="Please provide your basic information to complete KYC."
      showStepper
      currentStep={KYC_STEP.PAN}
      onBack={() => goToStep(KYC_STEP.MPIN_VERIFY)}
    >
      <form onSubmit={handleSubmit} noValidate>
        <KycTextField
          label="PAN number"
          placeholder="PAN number"
          autoComplete="off"
          spellCheck={false}
          readOnly
          aria-readonly="true"
          tabIndex={-1}
          required
          value={details?.pan ?? ''}
          hint="Fetched from your verified mobile number and email — no typing needed."
          className="cursor-default uppercase tracking-[0.15em] focus:border-homepage-borderColor focus:ring-0"
          onChange={() => {}}
        />

        {!details && (
          <KycAlert tone="error" className="mt-3">
            {resolved.error}
          </KycAlert>
        )}

        {showCard && details && <KycPanCard details={details} className="mt-5" />}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          disabled={!details}
          className="mt-5 text-[14px]"
        >
          {showCard ? 'Submit' : 'Continue'}
        </Button>
      </form>

      <KycDemoHint className="mt-5">
        Simulated fetch — nothing leaves your browser.
      </KycDemoHint>
    </KycLayout>
  );
}
