'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycPinInput from '@/components/kyc/KycPinInput';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO, MPIN_LENGTH } from '@/constants/kycConstants';
import { verifyMpin } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step — confirm the MPIN just set by entering it once more, exactly as the
 * app will ask for it on every sign-in.
 */
export default function MpinVerifyStep() {
  const { goToStep, updateFlow, mpin } = useKycFlow();
  const [entered, setEntered] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (value = entered) => {
    if (value.length !== MPIN_LENGTH) {
      setError(`Enter your ${MPIN_LENGTH}-digit MPIN.`);
      return;
    }

    setError('');
    setLoading(true);
    const result = await verifyMpin({ mpin, entered: value });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setEntered('');
      return;
    }

    updateFlow({ mpinVerified: true });
    goToStep(KYC_STEP.KYC_STATUS);
  };

  return (
    <KycLayout
      title="Verify your MPIN"
      subtitle="Enter the MPIN you just set — this is how you will unlock the app."
      showStepper
      currentStep={KYC_STEP.MPIN_VERIFY}
      onBack={loading ? undefined : () => goToStep(KYC_STEP.MPIN)}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleVerify();
        }}
        noValidate
      >
        <KycPinInput
          value={entered}
          maxLength={MPIN_LENGTH}
          disabled={loading}
          hasError={Boolean(error)}
          ariaLabel="Your MPIN"
          onChange={(value) => {
            setEntered(value);
            if (error) setError('');
          }}
          onComplete={(value) => handleVerify(value)}
        />

        {error && (
          <KycAlert tone="error" className="mt-3">
            {error}
          </KycAlert>
        )}

        <div className="mt-4 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
          <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
            Never share your MPIN with anyone.
          </Text>
        </div>

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={entered.length !== MPIN_LENGTH}
          className={cn('mt-5 text-[14px]')}
        >
          {loading ? 'Verifying MPIN...' : 'Verify & Continue'}
        </Button>

        <button
          type="button"
          onClick={() => goToStep(KYC_STEP.MPIN)}
          className="mt-3 inline-flex min-h-11 items-center rounded-full px-2 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Forgot it? Set a new MPIN
        </button>
      </form>

      <KycDemoHint className="mt-4">
        Enter the same MPIN you set on the previous screen.
      </KycDemoHint>
    </KycLayout>
  );
}
