'use client';

import { useRef, useState } from 'react';
import { Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import SignaturePad from '@/components/kyc/SignaturePad';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { submitSignature } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step 14 — digital signature. Stored as a data URL in flow state only.
 */
export default function SignatureStep() {
  const { goToStep, updateFlow } = useKycFlow();
  const padRef = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClear = () => {
    padRef.current?.clear();
    setError('');
  };

  const handleSubmit = async () => {
    if (padRef.current?.isEmpty()) {
      setError('Draw your signature before submitting.');
      return;
    }

    setError('');
    setSubmitting(true);
    const image = padRef.current?.toDataURL();
    const result = await submitSignature();
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ signature: image });
    goToStep(KYC_STEP.DOCUMENT);
  };

  return (
    <KycLayout
      title="Add your signature"
      subtitle="Sign inside the box using your mouse, finger or stylus."
      showStepper
      currentStep={KYC_STEP.SIGNATURE}
      onBack={() => goToStep(KYC_STEP.SELFIE)}
    >
      <SignaturePad ref={padRef} onChange={setHasInk} height={200} />

      <div className="mt-2 flex items-center justify-between gap-2">
        <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
          Sign as you would on paper.
        </Text>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Eraser className="size-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>

      {error && (
        <KycAlert tone="error" className="mt-3">
          {error}
        </KycAlert>
      )}

      <Button
        variant="authSubmit"
        size="lg"
        fullWidth
        weight="bold"
        loading={submitting}
        className={cn('mt-5 text-[14px]')}
        onClick={handleSubmit}
      >
        {submitting ? 'Saving signature...' : 'Submit Signature'}
      </Button>

      {!hasInk && !error && (
        <Text
          className={cn(KYC_TYPO.body, 'mt-2')}
          align="center"
          color="text-gray-500 dark:text-homepage-darkGrey"
        >
          The box is empty — draw your signature to continue.
        </Text>
      )}
    </KycLayout>
  );
}
