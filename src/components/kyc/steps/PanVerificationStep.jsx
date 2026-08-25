'use client';

import { useCallback, useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { fetchPanDetails } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step — PAN. The PAN is fetched against the verified mobile/email (simulated;
 * no PAN service is called) and fills the field read-only: there is nothing to
 * type here, exactly as an existing KYC record already pre-filled it.
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
  } = useKycFlow();

  const [pan, setPan] = useState(panDetails?.pan || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!panDetails?.pan);

  const fetchPan = useCallback(async () => {
    setError('');
    setLoading(true);

    const result = await fetchPanDetails(
      { accountId, mobile: mobileNumber, email: account?.email },
      { existingPan: existingKyc?.pan }
    );
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setPan(result.data.pan);
    updateFlow({ panVerified: true, panDetails: result.data });
  }, [accountId, mobileNumber, account?.email, existingKyc?.pan, updateFlow]);

  useEffect(() => {
    if (pan) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchPan();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPan]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!pan) return;
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
      onBack={loading ? undefined : () => goToStep(KYC_STEP.MPIN)}
    >
      <form onSubmit={handleSubmit} noValidate>
        <KycTextField
          label="PAN number"
          placeholder={loading ? 'Fetching PAN...' : 'PAN number'}
          autoComplete="off"
          spellCheck={false}
          readOnly
          aria-readonly="true"
          tabIndex={-1}
          required
          value={pan}
          hint="Fetched from your verified mobile number and email — no typing needed."
          className="cursor-default uppercase tracking-[0.15em] focus:border-homepage-borderColor focus:ring-0"
          onChange={() => {}}
        />

        {error && (
          <KycAlert tone="error" className="mt-3">
            {error}
          </KycAlert>
        )}

        <Button
          type={error ? 'button' : 'submit'}
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={!error && !pan}
          className="mt-5 text-[14px]"
          onClick={error ? fetchPan : undefined}
        >
          {loading ? 'Fetching...' : error ? 'Try again' : 'Submit & Continue'}
        </Button>
      </form>

      {loading && (
        <div className="mt-4 flex items-center gap-2" role="status" aria-live="polite">
          <Spinner className="size-4 text-brand-500" />
          <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-lightWhite">
            Fetching your PAN details...
          </Text>
        </div>
      )}

      <KycDemoHint className="mt-5">
        Simulated fetch — nothing leaves your browser.
      </KycDemoHint>
    </KycLayout>
  );
}
