'use client';

import { MapPin } from 'lucide-react';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
import Text from '@/components/common/Text';
import Spinner from '@/components/ui/Spinner';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_TYPO, PERMISSION_STATE } from '@/constants/kycConstants';

/**
 * LocationPermissionModal — location capture step.
 *
 * @param {string} permission — PERMISSION_STATE value
 * @param {string} error      — message for denied / unavailable
 */
export default function LocationPermissionModal({
  open,
  permission,
  error,
  onAllow,
  onSkip,
  onClose,
}) {
  const loading = permission === PERMISSION_STATE.PROMPTING;
  const blocked =
    permission === PERMISSION_STATE.DENIED || permission === PERMISSION_STATE.UNAVAILABLE;

  return (
    <KycModal
      open={open}
      onClose={onClose}
      preventClose={loading}
      icon={MapPin}
      title="Enable location access"
      description="Regulations require us to record where the account is being opened from. Your location is captured once, only for this verification."
      footer={
        <KycModalActions
          secondary="Not Now"
          onSecondary={onSkip}
          primary={
            loading ? 'Fetching location...' : blocked ? 'Try again' : 'Allow Location'
          }
          onPrimary={onAllow}
          primaryProps={{ loading }}
        />
      }
    >
      {loading && (
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <Spinner className="size-4 text-brand-500" />
          <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
            Fetching your location...
          </Text>
        </div>
      )}

      {error && <KycAlert tone="error">{error}</KycAlert>}
    </KycModal>
  );
}
