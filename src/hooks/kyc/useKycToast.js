'use client';

import { useKycToastContext } from '@/contexts/KycToastContext';

/**
 * Transient status messages for the KYC flow.
 *
 * Returns `showToast({ tone, title, message, duration })` and `dismissToast(id)`.
 * Thin wrapper so components import from `@/hooks/kyc/...`, matching the
 * feature-hook convention used elsewhere in the app.
 */
export function useKycToast() {
  return useKycToastContext();
}

export default useKycToast;
