'use client';

import { useEffect, useState } from 'react';
import { Camera, FileSignature, MapPin, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import LocationPermissionModal from '@/components/kyc/LocationPermissionModal';
import { KYC_STEP, KYC_TYPO, PERMISSION_STATE } from '@/constants/kycConstants';
import { saveConsent, verifyEsign, verifyLocation } from '@/services/kyc/mockKycService';
import { mockConsents } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

// The kit is signed as part of the e-sign hand-off; there is no separate
// consent screen to tick it on.
const REQUIRED_CONSENTS = mockConsents.filter((consent) => consent.required).map((c) => c.id);

const CHECKS = [
  { id: 'esign', icon: FileSignature, label: 'E-Sign verification', hint: 'Consent for the account opening form' },
  { id: 'location', icon: MapPin, label: 'Location access', hint: 'Recorded once for compliance' },
  { id: 'selfie', icon: Camera, label: 'Live selfie', hint: 'Confirms you are present' },
  { id: 'signature', icon: PenTool, label: 'Digital signature', hint: 'Drawn on screen' },
];

/**
 * Step 11/12 — verification hub. E-sign starts as soon as the step opens, then
 * location, then the selfie screen.
 */
export default function VerificationStep() {
  const { goToStep, updateFlow, esignVerified, locationPermission } = useKycFlow();
  const [esignLoading, setEsignLoading] = useState(false);
  const [esignError, setEsignError] = useState('');

  const [showLocation, setShowLocation] = useState(false);
  const [permission, setPermission] = useState(locationPermission);
  const [locationError, setLocationError] = useState('');

  const handleEsign = async (acceptedConsents = REQUIRED_CONSENTS) => {
    setEsignError('');
    setEsignLoading(true);

    // The kit acknowledgement is recorded first — it is what is being signed.
    const consent = await saveConsent({ accepted: acceptedConsents });
    if (!consent.success) {
      setEsignLoading(false);
      setEsignError(consent.error);
      return;
    }

    const result = await verifyEsign();
    setEsignLoading(false);

    if (!result.success) {
      setEsignError(result.error);
      return;
    }

    updateFlow({ esignVerified: true, consents: consent.data.accepted });
    setShowLocation(true);
  };

  // No intermediate screen: e-sign runs on arrival and the location prompt
  // follows straight after.
  useEffect(() => {
    if (esignVerified || esignLoading || esignError) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (active) handleEsign();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esignVerified]);

  const handleLocation = async () => {
    setLocationError('');
    setPermission(PERMISSION_STATE.PROMPTING);

    const result = await verifyLocation();
    if (!result.success) {
      setPermission(result.code || PERMISSION_STATE.DENIED);
      setLocationError(result.error);
      updateFlow({ locationPermission: result.code || PERMISSION_STATE.DENIED });
      return;
    }

    setPermission(PERMISSION_STATE.GRANTED);
    updateFlow({ locationPermission: PERMISSION_STATE.GRANTED, location: result.data });
    setShowLocation(false);
    goToStep(KYC_STEP.SELFIE);
  };

  const statusFor = (id) => {
    if (id === 'esign') return esignVerified ? 'Verified' : 'Pending';
    if (id === 'location')
      return permission === PERMISSION_STATE.GRANTED
        ? 'Captured'
        : permission === PERMISSION_STATE.DENIED
          ? 'Denied'
          : 'Pending';
    return 'Pending';
  };

  return (
    <>
      <KycLayout
        title="Verify it's really you"
        subtitle="Four quick checks and your account is ready."
        showStepper
        currentStep={KYC_STEP.VERIFICATION}
        maxWidth="max-w-[30rem]"
        onBack={() => goToStep(KYC_STEP.NOMINEE)}
        footer={
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            loading={esignLoading}
            className="text-[14px]"
            onClick={() => {
              if (!esignVerified) {
                handleEsign();
                return;
              }
              if (permission !== PERMISSION_STATE.GRANTED) {
                setShowLocation(true);
                return;
              }
              goToStep(KYC_STEP.SELFIE);
            }}
          >
            {!esignVerified
              ? esignLoading
                ? 'Preparing e-sign...'
                : 'Retry e-sign verification'
              : permission !== PERMISSION_STATE.GRANTED
                ? 'Enable location access'
                : 'Continue to selfie'}
          </Button>
        }
      >
        <ul className="space-y-2.5">
          {CHECKS.map((check) => {
            const Icon = check.icon;
            const status = statusFor(check.id);
            const done = status === 'Verified' || status === 'Captured';
            const failed = status === 'Denied';

            return (
              <li
                key={check.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-homepage-borderColor dark:bg-homepage-cardBgDark"
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    done
                      ? 'bg-brand-500 text-black'
                      : failed
                        ? 'bg-brandRed-loss/15 text-brandRed-loss'
                        : 'bg-gray-100 text-gray-600 dark:bg-homepage-iconBackground dark:text-white'
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <Text className={cn(KYC_TYPO.subtitle, 'font-medium')}>{check.label}</Text>
                  <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
                    {check.hint}
                  </Text>
                </div>
                <Text
                  as="span"
                  className={cn(KYC_TYPO.body, 'shrink-0 font-semibold')}
                  color={
                    done
                      ? 'text-brand-500'
                      : failed
                        ? 'text-brandRed-loss'
                        : 'text-gray-500 dark:text-homepage-darkGrey'
                  }
                >
                  {status}
                </Text>
              </li>
            );
          })}
        </ul>

        {esignError && (
          <KycAlert tone="error" className="mt-4" title="E-Sign failed">
            {esignError}
          </KycAlert>
        )}

        {permission === PERMISSION_STATE.DENIED && (
          <KycAlert tone="error" className="mt-4" title="Location required">
            Verification cannot be completed without location access. Enable it
            and try again.
          </KycAlert>
        )}
      </KycLayout>


      <LocationPermissionModal
        open={showLocation}
        permission={permission}
        error={locationError}
        onAllow={handleLocation}
        onSkip={() => setShowLocation(false)}
        onClose={() => setShowLocation(false)}
      />
    </>
  );
}
