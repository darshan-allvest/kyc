'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Fingerprint, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycPinInput from '@/components/kyc/KycPinInput';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import KycDetailCard from '@/components/kyc/KycDetailCard';
import Checkbox from '@/components/common/Checkbox';
import KycTextField from '@/components/kyc/KycTextField';
import KycOtpInput from '@/components/kyc/KycOtpInput';
import { KYC_METHOD, KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import {
  fetchDigiLockerDetails,
  sendDigiLockerOtp,
  verifyDigiLockerOtp,
  verifyDigiLockerPin,
} from '@/services/kyc/mockKycService';
import { MOCK_DIGILOCKER, resolveAccount } from '@/services/kyc/mockKycData';
import { maskMobile } from '@/lib/kyc/kycFormatters';
import { useResendTimer } from '@/hooks/kyc/useResendTimer';
import useKycFlow from '@/hooks/kyc/useKycFlow';

// The portal sign-in mirrors the real one: mobile → OTP → security PIN, then
// the consent screen that hands the documents over.
const STAGE = {
  INTRO: 'INTRO',
  AADHAAR: 'AADHAAR',
  OTP: 'OTP',
  PIN: 'PIN',
  FETCHING: 'FETCHING',
  FETCHED: 'FETCHED',
};

export default function DigiLockerStep() {
  const {
    goToStep,
    updateFlow,
    digiLockerData,
    digiLockerSelection,
    accountId,
    mobileNumber,
    account,
  } = useKycFlow();
  const identity = { accountId, mobile: mobileNumber, email: account?.email };
  const { aadhaarNumber: demoAadhaar, linkedMobile } = resolveAccount(identity).digiLocker;

  const [stage, setStage] = useState(digiLockerData ? STAGE.FETCHED : STAGE.INTRO);
  const [aadhaar, setAadhaar] = useState('');
  const [otpSentTo, setOtpSentTo] = useState(linkedMobile);
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Which of the retrieved documents the applicant shares with us. Nothing is
  // pre-selected — sharing is an explicit choice.
  const [selected, setSelected] = useState(digiLockerSelection ?? []);
  const resend = useResendTimer(30);

  useEffect(() => {
    if (stage === STAGE.OTP) resend.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);


  const run = async (task, onDone) => {
    setError('');
    setLoading(true);
    const result = await task();
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onDone(result);
  };

  const requestOtp = () =>
    run(
      () => sendDigiLockerOtp(aadhaar, identity),
      (result) => {
        setOtpSentTo(result.data.sentTo);
        setOtp('');
        setStage(STAGE.OTP);
      }
    );

  const submitOtp = (value = otp) =>
    run(() => verifyDigiLockerOtp(value), () => {
      setPin('');
      setStage(STAGE.PIN);
    });

  const submitPin = (value = pin) =>
    run(() => verifyDigiLockerPin(value), async () => {
      setStage(STAGE.FETCHING);
      const result = await fetchDigiLockerDetails(identity);
      if (!result.success) {
        setError(result.error);
        setStage(STAGE.PIN);
        return;
      }
      updateFlow({ digiLockerData: result.data, kycMethod: KYC_METHOD.DIGILOCKER });
      setStage(STAGE.FETCHED);
    });

  const titles = {
    [STAGE.INTRO]: 'Connect to DigiLocker',
    [STAGE.AADHAAR]: 'Sign in to DigiLocker',
    [STAGE.OTP]: 'Verify your DigiLocker OTP',
    [STAGE.PIN]: 'Enter your DigiLocker PIN',
    [STAGE.FETCHING]: 'Fetching your documents',
    [STAGE.FETCHED]: 'Select documents to share',
  };

  const subtitles = {
    [STAGE.INTRO]: 'We will fetch your Aadhaar, PAN and address details in one step.',
    [STAGE.AADHAAR]: 'Use the mobile number registered with your DigiLocker account.',
    [STAGE.OTP]: `DigiLocker sent an OTP to ${maskMobile(otpSentTo)}, the mobile linked to your Aadhaar.`,
    [STAGE.PIN]: 'Your 6-digit DigiLocker security PIN keeps your documents locked.',
    [STAGE.FETCHING]: 'DigiLocker is sharing the documents you consented to.',
    [STAGE.FETCHED]: 'Pick the documents you want to submit with your KYC.',
  };

  const backTargets = {
    [STAGE.AADHAAR]: STAGE.INTRO,
    [STAGE.OTP]: STAGE.AADHAAR,
    [STAGE.PIN]: STAGE.OTP,
  };

  const handleBack = () => {
    const previous = backTargets[stage];
    setError('');
    if (previous) {
      setStage(previous);
      return;
    }
    goToStep(KYC_STEP.METHOD_CHOICE);
  };

  return (
    <KycLayout
      title={titles[stage]}
      subtitle={subtitles[stage]}
      showStepper
      currentStep={KYC_STEP.DIGILOCKER}
      maxWidth="max-w-[30rem]"
      onBack={loading || stage === STAGE.FETCHING ? undefined : handleBack}
    >
      {/* 1 — what will be shared */}
      {stage === STAGE.INTRO && (
        <>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand-500" aria-hidden="true" />
              <Text as="span" className={cn(KYC_TYPO.subtitle, 'font-semibold')}>
                What we will access
              </Text>
            </span>
            <ul className="mt-3 space-y-2">
              {['Aadhaar (name, date of birth, address)', 'PAN card', 'Driving licence, if issued'].map(
                (item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                    <Text className={KYC_TYPO.body} color="text-gray-700 dark:text-homepage-lightWhite">
                      {item}
                    </Text>
                  </li>
                )
              )}
            </ul>
          </div>

          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="mt-5 text-[14px]"
            onClick={() => setStage(STAGE.AADHAAR)}
          >
            Continue with DigiLocker
          </Button>

          <KycDemoHint className="mt-4">
            Simulated DigiLocker — no government service is contacted.
          </KycDemoHint>
        </>
      )}

      {/* 2 — mobile number registered with DigiLocker */}
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
            error={error}
            onChange={(event) => {
              setAadhaar(event.target.value.replace(/\D/g, '').slice(0, 12));
              if (error) setError('');
            }}
          />

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
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>

          <KycDemoHint className="mt-4">
            Aadhaar {demoAadhaar} · OTP goes to {linkedMobile}
          </KycDemoHint>
        </form>
      )}

      {/* 3 — OTP from DigiLocker */}
      {stage === STAGE.OTP && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitOtp();
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
            onComplete={(value) => submitOtp(value)}
            ariaLabel="DigiLocker one-time password"
          />

          {error ? (
            <KycAlert tone="error" className="mt-3">
              {error}
            </KycAlert>
          ) : (
            <Text
              className={cn(KYC_TYPO.body, 'mt-3')}
              color="text-gray-500 dark:text-homepage-darkGrey"
            >
              {selected.length
                ? `${selected.length} of ${digiLockerData.documents.length} selected`
                : 'Select the documents you want to share.'}
            </Text>
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
            disabled={otp.length !== MOCK_DIGILOCKER.otp.length}
            className="mt-4 text-[14px]"
          >
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </Button>

          <KycDemoHint className="mt-4">
            DigiLocker OTP <span className="font-semibold text-brand-500">{MOCK_DIGILOCKER.otp}</span>
          </KycDemoHint>
        </form>
      )}

      {/* 4 — 6-digit security PIN */}
      {stage === STAGE.PIN && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitPin();
          }}
          noValidate
        >
          <Text className={cn(KYC_TYPO.label, 'mb-2')} color="text-gray-700 dark:text-white">
            Security PIN
          </Text>
          <KycPinInput
            value={pin}
            maxLength={MOCK_DIGILOCKER.pin.length}
            hasError={Boolean(error)}
            disabled={loading}
            onChange={(value) => {
              setPin(value);
              if (error) setError('');
            }}
            onComplete={(value) => submitPin(value)}
            ariaLabel="DigiLocker security PIN"
          />

          {error ? (
            <KycAlert tone="error" className="mt-3">
              {error}
            </KycAlert>
          ) : (
            <Text
              className={cn(KYC_TYPO.body, 'mt-3')}
              color="text-gray-500 dark:text-homepage-darkGrey"
            >
              {selected.length
                ? `${selected.length} of ${digiLockerData.documents.length} selected`
                : 'Select the documents you want to share.'}
            </Text>
          )}

          <Button
            type="submit"
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            loading={loading}
            disabled={pin.length !== MOCK_DIGILOCKER.pin.length}
            leftIcon={Lock}
            className="mt-4 text-[14px]"
          >
            {loading ? 'Unlocking DigiLocker...' : 'Unlock and share documents'}
          </Button>

          <KycDemoHint className="mt-4">
            Security PIN <span className="font-semibold text-brand-500">{MOCK_DIGILOCKER.pin}</span>
          </KycDemoHint>
        </form>
      )}

      {/* 5 — fetching */}
      {stage === STAGE.FETCHING && (
        <div className="flex items-center gap-3 py-8" role="status" aria-live="polite">
          <Spinner className="size-5 text-brand-500" />
          <Text className={KYC_TYPO.subtitle} color="text-gray-700 dark:text-homepage-lightWhite">
            Fetching your documents from DigiLocker...
          </Text>
        </div>
      )}

      {/* 6 — retrieved */}
      {stage === STAGE.FETCHED && digiLockerData && (
        <>
          <KycAlert tone="success" className="mb-4">
            {digiLockerData.documents.length} documents retrieved for{' '}
            {maskMobile(digiLockerData.linkedMobile)}.
          </KycAlert>

          <ul className="space-y-2">
            {digiLockerData.documents.map((document) => {
              const isSelected = selected.includes(document.id);

              return (
                <li
                  key={document.id}
                  className={cn(
                    'rounded-xl border p-3 transition-colors',
                    isSelected
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-shade'
                      : 'border-gray-200 dark:border-white/10 dark:bg-black/20'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={(checked) => {
                      setSelected((prev) =>
                        checked
                          ? [...prev, document.id]
                          : prev.filter((id) => id !== document.id)
                      );
                      if (error) setError('');
                    }}
                    className="w-full items-start"
                    boxClassName="mt-0.5"
                    label={
                      <span className="block min-w-0">
                        <span className="block font-medium">{document.name}</span>
                        <span className="block text-gray-500 dark:text-homepage-darkGrey">
                          {document.issuer} · {document.number} · {document.status}
                        </span>
                      </span>
                    }
                    labelProps={{ className: KYC_TYPO.subtitle }}
                  />
                </li>
              );
            })}
          </ul>

          {error ? (
            <KycAlert tone="error" className="mt-3">
              {error}
            </KycAlert>
          ) : (
            <Text
              className={cn(KYC_TYPO.body, 'mt-3')}
              color="text-gray-500 dark:text-homepage-darkGrey"
            >
              {selected.length
                ? `${selected.length} of ${digiLockerData.documents.length} selected`
                : 'Select the documents you want to share.'}
            </Text>
          )}

          <KycDetailCard
            className="mt-3"
            title="Details from DigiLocker"
            items={[
              { label: 'Full name', value: digiLockerData.personalDetails.fullName },
              { label: 'Date of birth', value: digiLockerData.personalDetails.dateOfBirth },
              { label: 'Gender', value: digiLockerData.personalDetails.gender },
              { label: "Father's name", value: digiLockerData.personalDetails.fathersName },
              {
                label: 'Address',
                span: true,
                value: `${digiLockerData.personalDetails.address}, ${digiLockerData.personalDetails.city}, ${digiLockerData.personalDetails.state} - ${digiLockerData.personalDetails.pincode}`,
              },
            ]}
          />

          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="mt-5 text-[14px]"
            disabled={selected.length === 0}
            onClick={() => {
              if (!selected.length) {
                setError('Select at least one document to continue.');
                return;
              }
              updateFlow({ digiLockerSelection: selected });
              goToStep(KYC_STEP.GOVERNMENT_FETCH);
            }}
          >
            Continue
          </Button>
        </>
      )}
    </KycLayout>
  );
}
