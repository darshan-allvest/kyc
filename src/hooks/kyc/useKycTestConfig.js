'use client';

import { useSyncExternalStore } from 'react';
import {
  getKycTestConfig,
  setKycTestConfig,
  resetKycTestConfig,
  subscribeKycTestConfig,
} from '@/services/kyc/kycTestConfig';

/**
 * Live view of the KYC demo switchboard (src/services/kyc/kycTestConfig.js).
 * Used by the on-screen test panel; the mock service reads the same store.
 */
export function useKycTestConfig() {
  const config = useSyncExternalStore(
    subscribeKycTestConfig,
    getKycTestConfig,
    getKycTestConfig
  );

  return { config, setConfig: setKycTestConfig, resetConfig: resetKycTestConfig };
}

export default useKycTestConfig;
