'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import KycLayout from '@/components/kyc/KycLayout';
import KycDetailCard from '@/components/kyc/KycDetailCard';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { formatMobile } from '@/lib/kyc/kycFormatters';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Final screen — account setup complete.
 */
export default function KycSuccessStep() {
  const { finalDocument, mobileNumber, fnoSelected, aadhaarEsign, resetFlow } = useKycFlow();

  return (
    <KycLayout
      showStepper
      currentStep={KYC_STEP.SUCCESS}
      footer={
        <>
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="text-[14px]"
            href="/dashboard"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            weight="semibold"
            className="mt-2 text-[12px]"
            onClick={resetFlow}
          >
            Run the demo again
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center py-2 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-brand-500/15">
          <CheckCircle2 className="size-9 text-brand-500" aria-hidden="true" />
        </span>

        <Heading as="h1" size="base" font="sora" weight="semibold" className={cn(KYC_TYPO.title, 'md:text-[16px]')}>
          Your account setup is complete
        </Heading>
        <Text className={cn(KYC_TYPO.subtitle, 'mt-2')} color="text-gray-600 dark:text-homepage-lightWhite">
          Your KYC and verification process has been completed successfully.
        </Text>
      </div>

      <KycDetailCard
        className="mt-4"
        items={[
          { label: 'Registered mobile', value: formatMobile(mobileNumber) },
          { label: 'Document', value: finalDocument?.documentId || '-' },
          { label: 'E-Sign reference', value: aadhaarEsign?.reference || '-' },
          { label: 'Equity & MF', value: 'Activated' },
          { label: 'Futures & Options', value: fnoSelected ? 'Activated' : 'Not activated' },
        ]}
      />

      <Text className={cn(KYC_TYPO.body, 'mt-4')} align="center" color="text-gray-500 dark:text-homepage-darkGrey">
        Demo complete — nothing was submitted anywhere.
      </Text>
    </KycLayout>
  );
}
