'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import PasswordInput from '@/components/common/input/PasswordInput';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { verifyAccount, verifyAccountWithGoogle } from '@/services/kyc/mockKycService';
import { MOCK_ACCOUNTS, DEMO_PASSWORD } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const GoogleIcon = () => (
  <Image src="/assets/img/google.svg" alt="" aria-hidden="true" width={18} height={18} />
);

/**
 * Step 4 — account details. Google sign-in is simulated (no OAuth call is made
 * in this demo) alongside a plain email + password form.
 */
export default function AccountDetailsStep() {
  const { goToStep, updateFlow, mobileNumber } = useKycFlow();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    if (error) setError('');
  };

  const onVerified = (data) => {
    updateFlow({ account: data, accountId: data.accountId, accountVerified: true });
    goToStep(KYC_STEP.KYC_STATUS);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.email.trim()) errors.email = 'Enter your email address.';
    if (!form.password) errors.password = 'Enter your password.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setError('');
    setLoading(true);
    const result = await verifyAccount({ ...form, mobile: mobileNumber });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onVerified(result.data);
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await verifyAccountWithGoogle({ mobile: mobileNumber });
    setGoogleLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    onVerified(result.data);
  };

  return (
    <KycLayout
      title="Set up your account"
      subtitle="Continue with Google or sign in with your email to fetch your account details."
      showStepper
      currentStep={KYC_STEP.ACCOUNT}
      onBack={() => goToStep(KYC_STEP.OTP)}
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

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200 dark:bg-homepage-borderColor" />
        <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
          or continue with email
        </Text>
        <span className="h-px flex-1 bg-gray-200 dark:bg-homepage-borderColor" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <KycTextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter email address"
          required
          value={form.email}
          error={fieldErrors.email}
          onChange={setField('email')}
        />

        <div>
          <label htmlFor="kyc-password" className="mb-1.5 block">
            <Text as="span" className={KYC_TYPO.label} color="text-gray-700 dark:text-white">
              Password
              <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
                *
              </span>
            </Text>
          </label>
          <PasswordInput
            id="kyc-password"
            placeholder="Enter password"
            autoComplete="current-password"
            value={form.password}
            onChange={setField('password')}
            aria-invalid={fieldErrors.password ? 'true' : undefined}
            aria-describedby={fieldErrors.password ? 'kyc-password-error' : undefined}
            className={cn('text-[14px]', fieldErrors.password && 'border-brandRed-loss')}
          />
          {fieldErrors.password && (
            <Text
              id="kyc-password-error"
              role="alert"
              className={cn(KYC_TYPO.body, 'mt-1.5')}
              color="text-brandRed-loss"
            >
              {fieldErrors.password}
            </Text>
          )}
        </div>

        {error && <KycAlert tone="error">{error}</KycAlert>}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          className="text-[14px]"
        >
          {loading ? 'Verifying account...' : 'Continue'}
        </Button>
      </form>

      <div className="mt-5 space-y-2">
        {MOCK_ACCOUNTS.map((account) => (
          <KycDemoHint key={account.id}>
            {account.email} / {DEMO_PASSWORD} — {account.label}
          </KycDemoHint>
        ))}
      </div>
    </KycLayout>
  );
}
