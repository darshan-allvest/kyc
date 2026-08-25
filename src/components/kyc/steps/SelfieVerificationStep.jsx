'use client';

import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, ScanFace } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Spinner from '@/components/ui/Spinner';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO, PERMISSION_STATE } from '@/constants/kycConstants';
import { submitSelfie } from '@/services/kyc/mockKycService';
import useKycCamera from '@/hooks/kyc/useKycCamera';
import useFaceCheck, { FACE_STATUS } from '@/hooks/kyc/useFaceCheck';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const INSTRUCTIONS = [
  'Keep your face inside the frame',
  'Make sure your face is clearly visible',
  'Use good lighting — avoid strong backlight',
  'Remove sunglasses, caps or masks',
];

/**
 * Step 13 — live selfie. The captured frame stays in React state; it is never
 * uploaded anywhere.
 */
export default function SelfieVerificationStep() {
  const { goToStep, updateFlow, selfie } = useKycFlow();
  const { videoRef, permission, error, isMock, start, stop, capture } = useKycCamera();
  const [preview, setPreview] = useState(selfie);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => stop(), [stop]);

  const isLive = permission === PERMISSION_STATE.GRANTED && !preview;
  const isBlocked =
    permission === PERMISSION_STATE.DENIED || permission === PERMISSION_STATE.UNAVAILABLE;

  // A selfie can only be taken once a single, well-framed face is in view.
  const { status: faceStatus, message: faceMessage, isFaceReady } = useFaceCheck(videoRef, {
    active: isLive && !isMock,
    bypass: isMock,
  });

  const handleCapture = () => {
    if (!isFaceReady) return;
    const image = capture();
    if (!image) return;
    setPreview(image);
    stop();
  };

  const handleRetake = async () => {
    setPreview(null);
    await start();
  };

  const handleUse = async () => {
    setSubmitting(true);
    const result = await submitSelfie();
    setSubmitting(false);
    if (!result.success) return;

    updateFlow({ selfie: preview });
    goToStep(KYC_STEP.SIGNATURE);
  };

  return (
    <KycLayout
      title="Take a selfie"
      subtitle="A live photo confirms you are the one opening this account."
      showStepper
      currentStep={KYC_STEP.SELFIE}
      onBack={() => goToStep(KYC_STEP.VERIFICATION)}
    >
      {/* Camera / preview surface */}
      <div
        aria-live="polite"
        className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-black"
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          aria-label="Camera preview"
          className={cn(
            'size-full scale-x-[-1] object-cover',
            (!isLive || isMock || Boolean(preview)) && 'hidden'
          )}
        />

        {preview && (
          // Data URL from the local canvas — next/image would add no value here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your captured selfie" className="size-full object-cover" />
        )}

        {isLive && isMock && (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
            <Camera className="size-8 text-brand-500" aria-hidden="true" />
            <Text className={KYC_TYPO.subtitle} color="text-white">
              Demo camera
            </Text>
            <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
              Capturing uses a placeholder image — switch &quot;Use real device
              camera&quot; on in the test panel to use your webcam.
            </Text>
          </div>
        )}

        {!preview && !isLive && (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
            {permission === PERMISSION_STATE.PROMPTING ? (
              <>
                <Spinner className="size-6 text-brand-500" />
                <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-lightWhite">
                  Starting your camera...
                </Text>
              </>
            ) : (
              <>
                <Camera className="size-8 text-gray-400 dark:text-homepage-darkGrey" aria-hidden="true" />
                <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-lightWhite">
                  {isBlocked ? 'Camera unavailable' : 'Camera is off'}
                </Text>
              </>
            )}
          </div>
        )}

        {/* Face guide — turns solid once the face passes the check */}
        {isLive && !isMock && (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute left-1/2 top-1/2 size-[68%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2',
              isFaceReady
                ? 'border-solid border-brand-500'
                : 'border-dashed border-white/50'
            )}
          />
        )}

        {/* Live face-check verdict */}
        {isLive && !isMock && (
          <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-center">
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-center backdrop-blur',
                isFaceReady ? 'bg-brand-500/20' : 'bg-black/60'
              )}
            >
              {isFaceReady ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              ) : (
                <ScanFace className="size-3.5 shrink-0 text-white/80" aria-hidden="true" />
              )}
              <Text
                className={KYC_TYPO.body}
                color={isFaceReady ? 'text-brand-500' : 'text-white'}
              >
                {faceMessage}
              </Text>
            </span>
          </div>
        )}
      </div>

      {error && (
        <KycAlert tone="error" className="mt-4">
          {error}
        </KycAlert>
      )}

      {/* Actions */}
      <div className="mt-5">
        {preview ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              weight="semibold"
              className="text-[14px]"
              onClick={handleRetake}
            >
              Retake
            </Button>
            <Button
              variant="authSubmit"
              size="lg"
              fullWidth
              weight="bold"
              loading={submitting}
              className="text-[14px]"
              onClick={handleUse}
            >
              {submitting ? 'Saving selfie...' : 'Use This Selfie'}
            </Button>
          </div>
        ) : isLive ? (
          <>
            <Button
              variant="authSubmit"
              size="lg"
              fullWidth
              weight="bold"
              leftIcon={Camera}
              disabled={!isFaceReady}
              className="text-[14px]"
              onClick={handleCapture}
            >
              Take Selfie
            </Button>
            {!isFaceReady && (
              <Text
                className={cn(KYC_TYPO.body, 'mt-2')}
                align="center"
                color={
                  faceStatus === FACE_STATUS.SEARCHING
                    ? 'text-gray-500 dark:text-homepage-darkGrey'
                    : 'text-brandRed-loss'
                }
              >
                {faceMessage}
              </Text>
            )}
          </>
        ) : (
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            leftIcon={Camera}
            loading={permission === PERMISSION_STATE.PROMPTING}
            className="text-[14px]"
            onClick={start}
          >
            {isBlocked ? 'Try camera again' : 'Enable camera'}
          </Button>
        )}
      </div>

      {/* Instructions */}
      <ul className="mt-5 space-y-2">
        {INSTRUCTIONS.map((instruction) => (
          <li key={instruction} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
            <Text className={KYC_TYPO.body} color="text-gray-700 dark:text-homepage-lightWhite">
              {instruction}
            </Text>
          </li>
        ))}
      </ul>

      <KycDemoHint className="mt-3">
        Your selfie stays in this browser tab — it is never uploaded.
      </KycDemoHint>
    </KycLayout>
  );
}
