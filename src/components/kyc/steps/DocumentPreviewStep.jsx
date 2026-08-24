'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronUp, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Spinner from '@/components/ui/Spinner';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import DocumentPreview from '@/components/kyc/DocumentPreview';
import DocumentCover from '@/components/kyc/DocumentCover';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { generateFinalDocument } from '@/services/kyc/mockKycService';
import { buildKycDocument } from '@/lib/kyc/buildKycDocument';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step 15 — final document. Built entirely client-side from flow state: a cover
 * sheet, with the full form available on demand.
 */
export default function DocumentPreviewStep() {
  const flow = useKycFlow();
  const { goToStep, updateFlow, signature, selfie } = flow;
  const [preparing, setPreparing] = useState(true);
  const [error, setError] = useState('');
  // The document opens on its cover; the long scroll is opt-in.
  const [expanded, setExpanded] = useState(false);

  const document = useMemo(() => buildKycDocument(flow), [flow]);

  const prepare = useCallback(async () => {
    setError('');
    setPreparing(true);

    const result = await generateFinalDocument();
    setPreparing(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    updateFlow({ documentGenerated: true, finalDocument: result.data });
  }, [updateFlow]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) prepare();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => goToStep(KYC_STEP.AADHAAR_ESIGN);

  if (preparing) {
    return (
      <KycLayout
        title="Preparing your documents"
        subtitle="We are putting your account opening form together."
        showStepper
        currentStep={KYC_STEP.DOCUMENT}
        maxWidth="max-w-md"
      >
        <div className="flex items-center gap-3 py-6" role="status" aria-live="polite">
          <Spinner className="size-5 text-brand-500" />
          <Text className={KYC_TYPO.subtitle} color="text-gray-700 dark:text-homepage-lightWhite">
            Preparing your documents...
          </Text>
        </div>
      </KycLayout>
    );
  }

  if (error) {
    return (
      <KycLayout
        title="Document generation failed"
        subtitle="Nothing is lost — you can try again."
        showStepper
        currentStep={KYC_STEP.DOCUMENT}
        maxWidth="max-w-md"
      >
        <KycAlert tone="error">{error}</KycAlert>
        <Button
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          className="mt-5 text-[14px]"
          onClick={prepare}
        >
          Try again
        </Button>
      </KycLayout>
    );
  }

  return (
    <KycLayout
      title="Your documents are ready"
      subtitle="Review the form, then finish setting up your account."
      showStepper
      currentStep={KYC_STEP.DOCUMENT}
      maxWidth="max-w-[38rem]"
      footer={
        <Button
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          className="text-[14px]"
          onClick={handleContinue}
        >
          Continue
        </Button>
      }
    >
      {expanded ? (
        <>
          <DocumentPreview document={document} signature={signature} selfie={selfie} />
          <Button
            size="sm"
            variant="ghost"
            leftIcon={ChevronUp}
            className="mt-2 min-h-11 text-[12px]"
            onClick={() => setExpanded(false)}
          >
            Hide full document
          </Button>
        </>
      ) : (
        <>
          <DocumentCover />
          <Button
            variant="outline"
            size="lg"
            fullWidth
            weight="semibold"
            leftIcon={ScrollText}
            className="mt-3 text-[14px]"
            onClick={() => setExpanded(true)}
          >
            View full document
          </Button>
        </>
      )}

      <Text className={cn(KYC_TYPO.body, 'mt-3')} color="text-gray-500 dark:text-homepage-darkGrey">
        This document is assembled in your browser — no backend is involved.
      </Text>
    </KycLayout>
  );
}
