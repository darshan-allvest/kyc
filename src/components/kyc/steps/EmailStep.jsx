'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { sendEmailOtp, verifyAccountWithGoogle } from '@/services/kyc/mockKycService';
import { MOCK_ACCOUNTS } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const GoogleIcon = () => (
  <Image src="/assets/img/google.svg" alt="" aria-hidden="true" width={18} height={18} />
);

/**
 * Step 3 — email address. Sends a (mock) OTP to the address and moves to the
 * email OTP screen; the password and MPIN are set on the screens after it.
 *
 * Google sign-in is simulated (no OAuth call is made) and stands in for the
 * email + OTP + password screens, so it lands straight on the MPIN step.
 */
export default function EmailStep() {
  const { goToStep, updateFlow, mobileNumber, account } = useKycFlow();
  const [email, setEmail] = useState(account?.email || '');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setGoogleError('');
    setLoading(true);

    const result = await sendEmailOtp(email, { mobile: mobileNumber });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({
      account: { ...(account || {}), email: result.data.email },
      accountId: result.data.accountId,
      emailOtpVerified: false,
    });
    goToStep(KYC_STEP.EMAIL_OTP);
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleError('');
    setGoogleLoading(true);

    const result = await verifyAccountWithGoogle({ mobile: mobileNumber });
    setGoogleLoading(false);

    if (!result.success) {
      setGoogleError(result.error);
      return;
    }

    updateFlow({
      account: result.data,
      accountId: result.data.accountId,
      accountVerified: true,
      emailOtpVerified: true,
      passwordSet: true,
    });
    goToStep(KYC_STEP.MPIN);
  };

  return (
    <KycLayout
      title="Add your email"
      subtitle="We'll send a verification code to this address."
      showStepper
      currentStep={KYC_STEP.EMAIL}
      onBack={loading || googleLoading ? undefined : () => goToStep(KYC_STEP.OTP)}
    >
      <Button
        variant="none"
        size="lg"
        rounded="full"
        fullWidth
        weight="semibold"
        leftIcon={GoogleIcon}
        loading={googleLoading}
        onClick={handleGoogle}
        className="border-homepage-lightWhite bg-transparent text-[14px] text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
      >
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>

      {googleError && (
        <KycAlert tone="error" className="mt-3">
          {googleError}
        </KycAlert>
      )}

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200 dark:bg-homepage-borderColor" />
        <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
          or continue with email
        </Text>
        <span className="h-px flex-1 bg-gray-200 dark:bg-homepage-borderColor" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <KycTextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter email address"
          autoFocus
          required
          value={email}
          error={error}
          onChange={(event) => {
            setEmail(event.target.value);
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
          disabled={!email.trim()}
          className="mt-5 text-[14px]"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>

      <div className="mt-5 space-y-2">
        {MOCK_ACCOUNTS.map((mockAccount) => (
          <KycDemoHint key={mockAccount.id}>
            {mockAccount.email} — {mockAccount.label}
          </KycDemoHint>
        ))}
      </div>
    </KycLayout>
  );
}
