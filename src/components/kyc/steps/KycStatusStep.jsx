'use client';

import { useCallback, useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { fetchExistingKyc, getKycStatus } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step 5 — check whether the user already has KYC, then send them to PAN.
 *
 * Both journeys ask for PAN first: an existing record pre-fills it and goes
 * straight to the fetch, a new applicant picks how to share documents after.
 */
export default function KycStatusStep() {
  const { goToStep, updateFlow, accountId, mobileNumber, account } = useKycFlow();
  const identity = { accountId, mobile: mobileNumber, email: account?.email };
  const [error, setError] = useState('');

  const checkStatus = useCallback(async () => {
    setError('');

    const statusResult = await getKycStatus(identity);
    if (!statusResult.success) {
      setError(statusResult.error);
      return;
    }

    if (!statusResult.data.kycCompleted) {
      updateFlow({ kycCompleted: false });
      goToStep(KYC_STEP.PAN);
      return;
    }

    const existing = await fetchExistingKyc(identity);
    if (!existing.success) {
      setError(existing.error);
      return;
    }

    updateFlow({ kycCompleted: true, existingKyc: existing.data });
    goToStep(KYC_STEP.PAN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToStep, updateFlow, accountId, mobileNumber, account?.email]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) checkStatus();
    });
    return () => {
      active = false;
    };
  }, [checkStatus]);

  if (error) {
    return (
      <KycLayout
        title="We hit a snag"
        subtitle="Your KYC status could not be checked."
        showStepper
        currentStep={KYC_STEP.KYC_STATUS}
      >
        <KycAlert tone="error">{error}</KycAlert>
        <Button
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          className="mt-5 text-[14px]"
          onClick={checkStatus}
        >
          Try again
        </Button>
      </KycLayout>
    );
  }

  return (
    <KycLayout
      title="Checking your KYC status"
      subtitle="This takes just a moment."
      showStepper
      currentStep={KYC_STEP.KYC_STATUS}
    >
      <div className="flex items-center gap-3 py-6" role="status" aria-live="polite">
        <Spinner className="size-5 text-brand-500" />
        <Text className={KYC_TYPO.subtitle} color="text-gray-700 dark:text-homepage-lightWhite">
          Fetching KYC details...
        </Text>
      </div>
    </KycLayout>
  );
}
