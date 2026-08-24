'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Fingerprint, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import Checkbox from '@/components/common/Checkbox';
import Spinner from '@/components/ui/Spinner';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import KycTextField from '@/components/kyc/KycTextField';
import KycOtpInput from '@/components/kyc/KycOtpInput';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import {
  completeKyc,
  sendAadhaarOtp,
  verifyAadhaarEsign,
} from '@/services/kyc/mockKycService';
import { MOCK_AADHAAR, mockEsign } from '@/services/kyc/mockKycData';
import { useResendTimer } from '@/hooks/kyc/useResendTimer';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const STAGE = { AADHAAR: 'AADHAAR', OTP: 'OTP', SIGNING: 'SIGNING', SIGNED: 'SIGNED' };

/**
 * Final step — Aadhaar e-sign. The account opening form is signed with an
 * Aadhaar OTP, the way an e-sign service provider does it. Simulated: UIDAI is
 * never contacted.
 */
export default function AadhaarEsignStep() {
  const { goToStep, updateFlow, finalDocument } = useKycFlow();

  const [stage, setStage] = useState(STAGE.AADHAAR);
  const [aadhaar, setAadhaar] = useState('');
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const resend = useResendTimer(30);

  useEffect(() => {
    if (stage === STAGE.OTP) resend.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const requestOtp = async () => {
    if (!consent) {
      setError('Give your consent to e-sign with Aadhaar.');
      return;
    }

    setError('');
    setLoading(true);
    const result = await sendAadhaarOtp(aadhaar);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOtp('');
    setStage(STAGE.OTP);
  };

  const sign = async (value = otp) => {
    setError('');
    setLoading(true);
    setStage(STAGE.SIGNING);

    const result = await verifyAadhaarEsign(value);
    if (!result.success) {
      setLoading(false);
      setStage(STAGE.OTP);
      setError(result.error);
      return;
    }

    await completeKyc();
    setLoading(false);
    setSignature(result.data);
    updateFlow({ aadhaarEsign: result.data, esignVerified: true });
    setStage(STAGE.SIGNED);
  };

  const titles = {
    [STAGE.AADHAAR]: 'E-Sign with Aadhaar',
    [STAGE.OTP]: 'Enter the Aadhaar OTP',
    [STAGE.SIGNING]: 'Signing your document',
    [STAGE.SIGNED]: 'Document signed',
  };

  const subtitles = {
    [STAGE.AADHAAR]: `Your ${mockEsign.documentName} is signed electronically using Aadhaar.`,
    [STAGE.OTP]: `UIDAI sent a ${MOCK_AADHAAR.otp.length}-digit OTP to the mobile number linked to your Aadhaar.`,
    [STAGE.SIGNING]: 'Applying your digital signature to the form.',
    [STAGE.SIGNED]: 'Your KYC is complete.',
  };

  return (
    <KycLayout
      title={titles[stage]}
      subtitle={subtitles[stage]}
      showStepper
      currentStep={KYC_STEP.AADHAAR_ESIGN}
      onBack={
        loading || stage === STAGE.SIGNING || stage === STAGE.SIGNED
          ? undefined
          : stage === STAGE.OTP
            ? () => {
                setError('');
                setStage(STAGE.AADHAAR);
              }
            : () => goToStep(KYC_STEP.DOCUMENT)
      }
    >
      {/* 1 — Aadhaar number + consent */}
      {stage === STAGE.AADHAAR && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            requestOtp();
          }}
          noValidate
        >
          <KycTextField
            label="Aadhaar number"
            placeholder="Enter 12-digit Aadhaar number"
            inputMode="numeric"
            autoComplete="off"
            maxLength={12}
            required
            autoFocus
            value={aadhaar}
            error={error && !consent ? '' : error}
            onChange={(event) => {
              setAadhaar(event.target.value.replace(/\D/g, '').slice(0, 12));
              if (error) setError('');
            }}
          />

          <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-white/10 dark:bg-black/20">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand-500" aria-hidden="true" />
              <Text as="span" className={cn(KYC_TYPO.body, 'font-semibold')}>
                {MOCK_AADHAAR.esp}
              </Text>
            </span>
            <Checkbox
              checked={consent}
              onChange={(checked) => {
                setConsent(checked);
                if (error) setError('');
              }}
              className="mt-2 w-full items-start"
              boxClassName="mt-0.5"
              label="I authorise the e-sign service provider to authenticate me with UIDAI and affix my digital signature to the account opening form."
              labelProps={{ className: KYC_TYPO.body }}
            />
          </div>

          {error && (
            <KycAlert tone="error" className="mt-3">
              {error}
            </KycAlert>
          )}

          <Button
            type="submit"
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            loading={loading}
            leftIcon={Fingerprint}
            className="mt-5 text-[14px]"
          >
            {loading ? 'Sending OTP...' : 'Send Aadhaar OTP'}
          </Button>

          <KycDemoHint className="mt-4">
            Aadhaar {MOCK_AADHAAR.number} · OTP{' '}
            <span className="font-semibold text-brand-500">{MOCK_AADHAAR.otp}</span>
          </KycDemoHint>
        </form>
      )}

      {/* 2 — OTP */}
      {stage === STAGE.OTP && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sign();
          }}
          noValidate
        >
          <KycOtpInput
            value={otp}
            hasError={Boolean(error)}
            disabled={loading}
            onChange={(value) => {
              setOtp(value);
              if (error) setError('');
            }}
            onComplete={(value) => sign(value)}
            ariaLabel="Aadhaar one-time password"
          />

          {error && (
            <KycAlert tone="error" className="mt-3">
              {error}
            </KycAlert>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
              Didn&apos;t receive it?
            </Text>
            <button
              type="button"
              onClick={requestOtp}
              disabled={resend.isDisabled || loading}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full px-2 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                resend.isDisabled || loading
                  ? 'cursor-not-allowed text-gray-400 dark:text-homepage-disableGray'
                  : 'text-brand-500 hover:text-brand-600'
              )}
            >
              {resend.isDisabled ? `Resend in ${resend.timer}s` : 'Resend OTP'}
            </button>
          </div>

          <Button
            type="submit"
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            loading={loading}
            disabled={otp.length !== MOCK_AADHAAR.otp.length}
            className="mt-4 text-[14px]"
          >
            {loading ? 'Signing...' : 'Sign document'}
          </Button>

          <KycDemoHint className="mt-4">
            Demo OTP <span className="font-semibold text-brand-500">{MOCK_AADHAAR.otp}</span>
          </KycDemoHint>
        </form>
      )}

      {/* 3 — signing */}
      {stage === STAGE.SIGNING && (
        <div className="flex items-center gap-3 py-8" role="status" aria-live="polite">
          <Spinner className="size-5 text-brand-500" />
          <Text className={KYC_TYPO.subtitle} color="text-gray-700 dark:text-homepage-lightWhite">
            Affixing your Aadhaar e-sign...
          </Text>
        </div>
      )}

      {/* 4 — signed */}
      {stage === STAGE.SIGNED && (
        <>
          <div className="flex flex-col items-center py-2 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-500/15">
              <CheckCircle2 className="size-7 text-brand-500" aria-hidden="true" />
            </span>
            <Heading as="h2" size="sm" font="sora" weight="semibold" className={KYC_TYPO.title}>
              {finalDocument?.documentName ?? mockEsign.documentName} signed
            </Heading>
            <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-gray-600 dark:text-homepage-softGray">
              {signature?.esp} · Ref {signature?.reference}
            </Text>
          </div>

          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="mt-4 text-[14px]"
            onClick={() => goToStep(KYC_STEP.SUCCESS)}
          >
            Finish
          </Button>
        </>
      )}
    </KycLayout>
  );
}
