'use client';

import { useKycFlowContext } from '@/contexts/KycFlowContext';

/**
 * Flow state + navigation for the KYC onboarding journey.
 *
 * Returns everything in KycFlowContext plus `goToStep`, `updateFlow` and
 * `resetFlow`. Thin wrapper so components import from `@/hooks/kyc/...`,
 * matching the feature-hook convention used elsewhere in the app.
 */
export function useKycFlow() {
  return useKycFlowContext();
}

export default useKycFlow;
