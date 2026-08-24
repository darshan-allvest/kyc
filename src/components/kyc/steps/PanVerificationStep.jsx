'use client';

import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { verifyPan } from '@/services/kyc/mockKycService';
import { resolveAccount } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step 6 — PAN verification (simulated; no PAN service is called).
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
  } = useKycFlow();

  // Only an existing KYC record can pre-fill the PAN — DigiLocker comes later
  // in the journey now.
  const prefilled = existingKyc?.pan ? { pan: existingKyc.pan } : null;
  const demoPan = resolveAccount({ accountId, mobile: mobileNumber, email: account?.email })
    .panDetails.pan;
  const [pan, setPan] = useState(prefilled?.pan || '');
  const [edited, setEdited] = useState(false);

  // The prefill can land after this screen mounts (DigiLocker resolving, an
  // existing record arriving), so adopt it as long as the applicant has not
  // started typing their own.
  useEffect(() => {
    if (edited || !prefilled?.pan || pan) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (active) setPan(prefilled.pan);
    });
    return () => {
      active = false;
    };
  }, [edited, pan, prefilled?.pan]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyPan(pan, { accountId, mobile: mobileNumber, email: account?.email });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ panVerified: true, panDetails: result.data });
    // With a record on file the details can be fetched straight away; a new
    // applicant first chooses how to share documents.
    goToStep(kycCompleted ? KYC_STEP.GOVERNMENT_FETCH : KYC_STEP.METHOD_CHOICE);
  };

  const backStep = KYC_STEP.ACCOUNT;

  return (
    <KycLayout
      title="Basic details"
      subtitle="Please provide your basic information to complete KYC."
      showStepper
      currentStep={KYC_STEP.PAN}
      onBack={loading ? undefined : () => goToStep(backStep)}
    >
      <form onSubmit={handleSubmit} noValidate>
        <KycTextField
          label="PAN number"
          placeholder="Enter PAN number"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          required
          value={pan}
          error={error}
          hint="Enter your 10-character PAN number (e.g. ABCDE1234F)"
          className="uppercase tracking-[0.15em]"
          onChange={(event) => {
            setEdited(true);
            setPan(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
            if (error) setError('');
          }}
        />

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={!pan}
          className="mt-5 text-[14px]"
        >
          {loading ? 'Verifying...' : 'Submit & Continue'}
        </Button>
      </form>

      {loading && (
        <div className="mt-4 flex items-center gap-2" role="status" aria-live="polite">
          <Spinner className="size-4 text-brand-500" />
          <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-lightWhite">
            Verifying your PAN details...
          </Text>
        </div>
      )}

      {prefilled ? (
        <KycDemoHint className="mt-5">
          Simulated verification — nothing leaves your browser.
        </KycDemoHint>
      ) : (
        <KycDemoHint className="mt-5">
          Use {demoPan} — simulated verification, nothing leaves your browser.
        </KycDemoHint>
      )}
    </KycLayout>
  );
}
