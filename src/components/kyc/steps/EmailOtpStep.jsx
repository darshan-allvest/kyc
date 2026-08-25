'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycOtpInput from '@/components/kyc/KycOtpInput';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { sendEmailOtp, verifyEmailOtp } from '@/services/kyc/mockKycService';
import { MOCK_OTP } from '@/services/kyc/mockKycData';
import { useResendTimer } from '@/hooks/kyc/useResendTimer';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const OTP_LENGTH = 6;

/**
 * Step 4 — email OTP. The address comes from the email screen; it is never
 * re-entered here.
 */
export default function EmailOtpStep() {
  const { goToStep, updateFlow, account, mobileNumber } = useKycFlow();
  const email = account?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const resend = useResendTimer(30);

  useEffect(() => {
    resend.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (submittedOtp = otp) => {
    if (submittedOtp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    setError('');
    setNotice('');
    setLoading(true);

    const result = await verifyEmailOtp(email, submittedOtp);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setOtp('');
      return;
    }

    updateFlow({
      account: { ...(account || {}), email: result.data.email, name: result.data.name },
      accountId: result.data.accountId,
      emailOtpVerified: true,
      accountVerified: true,
    });
    goToStep(KYC_STEP.PASSWORD);
  };

  const handleResend = async () => {
    if (resend.isDisabled || resending) return;
    setResending(true);
    setError('');
    setOtp('');

    const result = await sendEmailOtp(email, { mobile: mobileNumber });
    setResending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setNotice('A new OTP has been sent.');
    resend.start();
  };

  return (
    <KycLayout
      showStepper
      currentStep={KYC_STEP.EMAIL_OTP}
      title="Verify your email"
      subtitle={`OTP sent to ${email}`}
      onBack={loading ? undefined : () => goToStep(KYC_STEP.EMAIL)}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleVerify();
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
          onComplete={(value) => handleVerify(value)}
        />

        {error && (
          <KycAlert tone="error" className="mt-3">
            {error}
          </KycAlert>
        )}
        {!error && notice && (
          <KycAlert tone="success" className="mt-3">
            {notice}
          </KycAlert>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
            Didn&apos;t receive the code?
          </Text>
          <button
            type="button"
            onClick={handleResend}
            disabled={resend.isDisabled || resending}
            className={cn(
              'inline-flex min-h-11 items-center rounded-full px-2 text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              resend.isDisabled || resending
                ? 'cursor-not-allowed text-gray-400 dark:text-homepage-disableGray'
                : 'text-brand-500 hover:text-brand-600'
            )}
          >
            {resending
              ? 'Sending...'
              : resend.isDisabled
                ? `Resend OTP in ${resend.timer}s`
                : 'Resend OTP'}
          </button>
        </div>

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={otp.length !== OTP_LENGTH}
          className="mt-5 text-[14px]"
        >
          {loading ? 'Verifying OTP...' : 'Verify'}
        </Button>
      </form>

      <KycDemoHint className="mt-4">
        Demo OTP <span className="font-semibold text-brand-500">{MOCK_OTP}</span>
      </KycDemoHint>
    </KycLayout>
  );
}
