'use client';

import { useState } from 'react';
import Button from '@/components/common/button/Button';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import KycPanCard from '@/components/kyc/KycPanCard';
import { KYC_STEP } from '@/constants/kycConstants';
import { cn } from '@/lib/utils';
import { resolvePanDetails } from '@/services/kyc/mockKycService';
import { PAN_REGEX } from '@/utils/formValidators';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step — PAN. The number is prefilled from the verified mobile/email and can
 * be corrected until Continue; Continue reveals the PAN card and locks the
 * field, Submit moves on. Verification is simulated — no PAN service is called.
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

  const identity = { accountId, mobile: mobileNumber, email: account?.email };

  // Prefill from whatever is already on file, else from the record resolved
  // against the verified mobile/email; the applicant may correct it.
  const [pan, setPan] = useState(() => {
    const onFile = existingKyc?.pan || panDetails?.pan;
    if (onFile) return onFile.toUpperCase();
    const resolved = resolvePanDetails(identity);
    return resolved.success ? resolved.data.pan : '';
  });
  // Continue reveals the PAN card below and locks the field; Submit moves on.
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');

  const locked = Boolean(details);

  /** The card prints what a PAN card prints — fill any gap from the profile. */
  const withCardFields = (record) => ({
    ...record,
    name: record.name || panDetails?.name || personalDetails?.fullName,
    fathersName:
      record.fathersName || panDetails?.fathersName || personalDetails?.fathersName,
    dateOfBirth:
      record.dateOfBirth || panDetails?.dateOfBirth || personalDetails?.dateOfBirth,
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (locked) {
      // With a record on file the details can be fetched straight away; a new
      // applicant shares documents through DigiLocker.
      goToStep(kycCompleted ? KYC_STEP.GOVERNMENT_FETCH : KYC_STEP.DIGILOCKER);
      return;
    }

    if (!PAN_REGEX.test(pan)) {
      setError('Enter a valid PAN, e.g. ABCDE1234F.');
      return;
    }

    const result = resolvePanDetails(identity, { existingPan: pan });
    if (!result.success) {
      setError(result.error);
      return;
    }

    const record = withCardFields(result.data);
    setDetails(record);
    setError('');
    updateFlow({ panVerified: true, panDetails: record });
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
          placeholder="Enter PAN number"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          required
          readOnly={locked}
          aria-readonly={locked || undefined}
          tabIndex={locked ? -1 : undefined}
          value={pan}
          onChange={(event) => {
            setPan(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            setError('');
          }}
          error={error}
          hint={
            locked
              ? 'Verified — this can no longer be changed.'
              : 'Prefilled from your verified mobile number and email — edit it if it is wrong.'
          }
          className={cn(
            'uppercase tracking-[0.15em]',
            locked && 'cursor-default focus:border-homepage-borderColor focus:ring-0'
          )}
        />

        {locked && <KycPanCard details={details} className="mt-5" />}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          disabled={pan.length !== 10}
          className="mt-5 text-[14px]"
        >
          {locked ? 'Submit' : 'Continue'}
        </Button>
      </form>

      <KycDemoHint className="mt-5">
        Simulated verification — nothing leaves your browser.
      </KycDemoHint>
    </KycLayout>
  );
}
