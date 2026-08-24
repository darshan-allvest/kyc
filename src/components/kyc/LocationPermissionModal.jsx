'use client';

import { MapPin } from 'lucide-react';
import CommonModal from '@/components/common/CommonModal';
import Button from '@/components/common/button/Button';
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
    <CommonModal
      open={open}
      onClose={onClose}
      preventClose={loading}
      hideClose={loading}
      title="Enable location access"
      maxWidth="max-w-md"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            loading={loading}
            className="text-[14px]"
            onClick={onAllow}
          >
            {loading ? 'Fetching location...' : blocked ? 'Try again' : 'Allow Location'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            weight="semibold"
            className="text-[14px]"
            onClick={onSkip}
          >
            Not Now
          </Button>
        </div>
      }
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-500/15">
        <MapPin className="size-5 text-brand-500" aria-hidden="true" />
      </span>

      <Text className={KYC_TYPO.subtitle} color="text-homepage-lightWhite">
        Regulations require us to record where the account is being opened from.
        Your location is captured once, only for this verification.
      </Text>

      {loading && (
        <div className="mt-4 flex items-center gap-2" role="status" aria-live="polite">
          <Spinner className="size-4 text-brand-500" />
          <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
            Fetching your location...
          </Text>
        </div>
      )}

      {error && (
        <KycAlert tone="error" className="mt-4">
          {error}
        </KycAlert>
      )}
    </CommonModal>
  );
}
