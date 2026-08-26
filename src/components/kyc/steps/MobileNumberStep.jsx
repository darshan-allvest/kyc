'use client';

import { useState } from 'react';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import Checkbox from '@/components/common/Checkbox';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { sendOtp } from '@/services/kyc/mockKycService';
import { MOCK_ACCOUNTS } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step 1 — mobile number. Sends a (mock) OTP and moves to verification.
 */
export default function MobileNumberStep() {
  const { goToStep, updateFlow, mobileNumber } = useKycFlow();
  const [value, setValue] = useState(mobileNumber || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedEntities, setAcceptedEntities] = useState(false);

  const consentGiven = acceptedTerms && acceptedEntities;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!consentGiven) return;
    setError('');
    setLoading(true);

    const result = await sendOtp(value);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ mobileNumber: result.data.mobile, accountId: result.data.accountId });
    goToStep(KYC_STEP.OTP);
  };

  return (
    <KycLayout
      title="Open your free account"
      subtitle="Start your investment journey with us. We'll send an OTP to verify your number."
      currentStep={KYC_STEP.MOBILE}
      footer={
        <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
          By continuing you agree to the terms of this demo. Investments in
          securities carry market risk.
        </Text>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <KycTextField
          label="Mobile number"
          placeholder="Enter mobile number"
          prefix="+91"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          required
          autoFocus
          value={value}
          error={error}
          onChange={(event) => {
            setValue(event.target.value.replace(/\D/g, '').slice(0, 10));
            if (error) setError('');
          }}
        />

        <div className="mt-4 space-y-3">
          <Checkbox
            id="kyc-accept-terms"
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            className="items-start"
            boxClassName="mt-0.5"
            label="I accept the Terms & Conditions and the Privacy Policy of Allvest Securities Pvt Ltd."
            labelProps={{ className: 'leading-snug' }}
          />
          <Checkbox
            id="kyc-accept-entities"
            checked={acceptedEntities}
            onChange={setAcceptedEntities}
            className="items-start"
            boxClassName="mt-0.5"
            label="I accept the Terms & Conditions of Allvest Technology Pvt Ltd."
            labelProps={{ className: 'leading-snug' }}
          />
        </div>

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={!consentGiven}
          className="mt-5 text-[14px]"
        >
          {loading ? 'Sending OTP...' : 'Open Free Account'}
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        {MOCK_ACCOUNTS.map((account) => (
          <KycDemoHint key={account.id}>
            {account.mobile} — {account.label}
          </KycDemoHint>
        ))}
      </div>
    </KycLayout>
  );
}
