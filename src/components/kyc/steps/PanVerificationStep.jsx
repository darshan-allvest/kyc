'use client';

import { useState } from 'react';
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
 * Step — PAN. The number is prefilled from the verified mobile/email and stays
 * editable until Continue; from then on the PAN card is shown and the field is
 * locked. Verification is simulated — no PAN service is called.
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
          aria-readonly={locked ? 'true' : undefined}
          tabIndex={locked ? -1 : undefined}
          value={pan}
          error={error}
          hint={
            locked
              ? 'Verified — this cannot be changed now.'
              : 'Prefilled from your verified mobile number and email. Edit it if it is wrong.'
          }
          className={
            locked
              ? 'cursor-default uppercase tracking-[0.15em] focus:border-homepage-borderColor focus:ring-0'
              : 'uppercase tracking-[0.15em]'
          }
          onChange={(event) => {
            if (locked) return;
            setPan(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
            if (error) setError('');
          }}
        />

        {locked && <KycPanCard details={details} className="mt-5" />}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          disabled={!pan}
          className="mt-5 text-[14px]"
        >
          {locked ? 'Submit' : 'Continue'}
        </Button>

        {locked && (
          <button
            type="button"
            onClick={() => {
              setDetails(null);
              setError('');
            }}
            className="mt-3 inline-flex min-h-11 items-center rounded-full px-2 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Edit PAN
          </button>
        )}
      </form>

      <KycDemoHint className="mt-5">
        Simulated verification — nothing leaves your browser.
      </KycDemoHint>
    </KycLayout>
  );
}
