'use client';

import { useState } from 'react';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycPinInput from '@/components/kyc/KycPinInput';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO, MPIN_LENGTH } from '@/constants/kycConstants';
import { setMpin as saveMpin } from '@/services/kyc/mockKycService';
import { DEMO_MPIN } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step 6 — set the 6-digit MPIN used to unlock the app. The next screen asks
 * for it again to confirm it was remembered.
 */
export default function MpinStep() {
  const { goToStep, updateFlow, passwordSet, mpin: savedMpin } = useKycFlow();
  // Coming back from the verify screen restores what was set.
  const [mpin, setMpinValue] = useState(savedMpin || '');
  const [confirmMpin, setConfirmMpin] = useState(savedMpin || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const complete = mpin.length === MPIN_LENGTH && confirmMpin.length === MPIN_LENGTH;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!complete) {
      setError(`Enter and confirm your ${MPIN_LENGTH}-digit MPIN.`);
      return;
    }

    setError('');
    setLoading(true);
    const result = await saveMpin({ mpin, confirmMpin });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setConfirmMpin('');
      return;
    }

    updateFlow({ mpinSet: true, mpin, mpinVerified: false });
    goToStep(KYC_STEP.MPIN_VERIFY);
  };

  // Google sign-in skips the password screen, so back goes where we came from.
  const backStep = passwordSet ? KYC_STEP.PASSWORD : KYC_STEP.EMAIL;

  return (
    <KycLayout
      title="Set your MPIN"
      subtitle={`Choose a ${MPIN_LENGTH}-digit MPIN to unlock the app quickly.`}
      showStepper
      currentStep={KYC_STEP.MPIN}
      onBack={loading ? undefined : () => goToStep(backStep)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Text className={KYC_TYPO.label} color="text-gray-700 dark:text-white">
            New MPIN
          </Text>
          <div className="mt-2">
            <KycPinInput
              value={mpin}
              maxLength={MPIN_LENGTH}
              disabled={loading}
              hasError={Boolean(error)}
              ariaLabel="New MPIN"
              onChange={(value) => {
                setMpinValue(value);
                if (error) setError('');
              }}
            />
          </div>
        </div>

        <div>
          <Text className={KYC_TYPO.label} color="text-gray-700 dark:text-white">
            Confirm MPIN
          </Text>
          <div className="mt-2">
            <KycPinInput
              value={confirmMpin}
              maxLength={MPIN_LENGTH}
              disabled={loading}
              hasError={Boolean(error)}
              autoFocus={false}
              ariaLabel="Confirm MPIN"
              onChange={(value) => {
                setConfirmMpin(value);
                if (error) setError('');
              }}
            />
          </div>
        </div>

        {error && <KycAlert tone="error">{error}</KycAlert>}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={!complete}
          className="text-[14px]"
        >
          {loading ? 'Setting MPIN...' : 'Set MPIN & Continue'}
        </Button>
      </form>

      <KycDemoHint className="mt-4">
        Use this MPIN{' '}
        <span className="font-semibold text-brand-500">{DEMO_MPIN}</span>
      </KycDemoHint>
    </KycLayout>
  );
}
