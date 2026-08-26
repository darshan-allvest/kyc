'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ScanSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import KycProgressStages from '@/components/kyc/KycProgressStages';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { mockFetchStages } from '@/services/kyc/mockKycData';
import { fetchGovernmentDetails } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const initialStatuses = () =>
  mockFetchStages.reduce((acc, stage) => ({ ...acc, [stage.id]: 'pending' }), {});

/**
 * Step 7 — simulated staged fetch of PAN, personal and bank details.
 */
export default function GovernmentDataFetchStep() {
  const { goToStep, updateFlow, panVerified, accountId, mobileNumber, account } = useKycFlow();
  const [statuses, setStatuses] = useState(initialStatuses);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const doneCount = Object.values(statuses).filter((status) => status === 'done').length;
  const progress = Math.round((doneCount / mockFetchStages.length) * 100);

  const run = useCallback(async () => {
    setError('');
    setStatuses(initialStatuses());
    setRunning(true);

    const result = await fetchGovernmentDetails({
      identity: { accountId, mobile: mobileNumber, email: account?.email },
      onStage: (stageId, status) =>
        setStatuses((prev) => ({ ...prev, [stageId]: status })),
    });

    setRunning(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({
      panDetails: result.data.panDetails,
      personalDetails: result.data.personalDetails,
      bankDetails: result.data.bankDetails,
    });
    // Anything the fetch could not supply (occupation, income, …) is filled in
    // through Edit Details on the Confirm screen.
    goToStep(KYC_STEP.CONFIRM_DETAILS);
  }, [goToStep, updateFlow, accountId, mobileNumber, account?.email]);

  useEffect(() => {
    let active = true;
    // Deferred a microtask so the first state update happens after the effect
    // body, not synchronously inside it.
    Promise.resolve().then(() => {
      if (active) run();
    });
    return () => {
      active = false;
    };
  }, [run]);

  return (
    <KycLayout showStepper currentStep={KYC_STEP.GOVERNMENT_FETCH}>
      {panVerified && !error && (
        <div className="mb-4 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="size-4 text-brand-500" aria-hidden="true" />
          <Text className={KYC_TYPO.body} color="text-brand-500" weight="semibold">
            PAN verified successfully
          </Text>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-500/15">
          <ScanSearch className="size-7 text-brand-500" aria-hidden="true" />
        </span>
        <Heading
          as="h1"
          size="base"
          font="sora"
          weight="semibold"
          className={cn(KYC_TYPO.title, 'md:text-[16px]')}
        >
          Getting your details from Govt. Database
        </Heading>
      </div>

      <Progress
        value={progress}
        aria-label="Fetch progress"
        className="my-5 h-1 bg-gray-200 dark:bg-white/10 [&>div]:bg-brand-500"
      />

      <KycProgressStages stages={mockFetchStages} statuses={statuses} />

      {error ? (
        <>
          <KycAlert tone="error" className="mt-5">
            {error}
          </KycAlert>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="authSubmit"
              size="lg"
              fullWidth
              weight="bold"
              className="text-[14px]"
              onClick={run}
            >
              Retry
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              weight="semibold"
              className="text-[14px]"
              onClick={() => goToStep(KYC_STEP.PAN)}
            >
              Change PAN
            </Button>
          </div>
        </>
      ) : (
        <Text
          className={cn(KYC_TYPO.body, 'mt-5')}
          align="center"
          color="text-gray-500 dark:text-homepage-darkGrey"
        >
          {running
            ? 'This usually takes a few seconds. Please keep this screen open.'
            : 'Finishing up...'}
        </Text>
      )}

      <KycDemoHint className="mt-4">
        Simulated fetch — no government database is accessed.
      </KycDemoHint>
    </KycLayout>
  );
}
