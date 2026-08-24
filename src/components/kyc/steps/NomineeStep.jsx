'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Checkbox from '@/components/common/Checkbox';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycSelectField from '@/components/kyc/KycSelectField';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_STEP, KYC_TYPO, NOMINEE_RELATIONSHIPS } from '@/constants/kycConstants';
import { saveNominee } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const EMPTY_NOMINEE = { name: '', relationship: '', dateOfBirth: '' };

/**
 * Step — Nominee. One nominee (holding 100%), or an explicit opt-out with its
 * own acknowledgement.
 */
export default function NomineeStep() {
  const { goToStep, updateFlow, nominees: savedNominees, nomineeOptOut } = useKycFlow();

  const [nominee, setNominee] = useState(savedNominees?.[0] ?? EMPTY_NOMINEE);
  const [skip, setSkip] = useState(Boolean(nomineeOptOut));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key) => (event) => {
    setNominee((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    if (error) setError('');
  };

  const validate = () => {
    const next = {};
    if (!nominee.name.trim()) next.name = 'Enter the nominee name.';
    if (!nominee.relationship) next.relationship = 'Select the relationship.';
    if (!nominee.dateOfBirth) next.dateOfBirth = 'Enter the date of birth.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!skip && !validate()) return;

    setLoading(true);
    // A single nominee holds the whole account.
    const result = await saveNominee({
      nominees: skip ? [] : [{ ...nominee, sharePercentage: '100' }],
      optOut: skip,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ nominees: result.data.nominees, nomineeOptOut: result.data.optOut });
    goToStep(KYC_STEP.VERIFICATION);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit();
  };

  return (
    <KycLayout
      title="Add a nominee"
      subtitle="A nominee makes it far easier for your family to claim your holdings."
      showStepper
      currentStep={KYC_STEP.NOMINEE}
      maxWidth="max-w-[30rem]"
      onBack={loading ? undefined : () => goToStep(KYC_STEP.BANK_DETAILS)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {!skip && (
          <>
            <KycTextField
              label="Full name"
              placeholder="Enter nominee name"
              required
              value={nominee.name}
              error={errors.name}
              onChange={setField('name')}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KycSelectField
                label="Relationship"
                options={NOMINEE_RELATIONSHIPS}
                placeholder="Select relationship"
                required
                value={nominee.relationship}
                error={errors.relationship}
                onChange={setField('relationship')}
              />
              <KycTextField
                label="Date of birth"
                type="date"
                required
                value={nominee.dateOfBirth}
                error={errors.dateOfBirth}
                onChange={setField('dateOfBirth')}
              />
            </div>
          </>
        )}

        {skip && (
          <KycAlert tone="info">
            Without a nominee, your family may need a succession certificate or a
            probated will to claim your holdings. You can add one later from your
            profile.
          </KycAlert>
        )}

        {error && <KycAlert tone="error">{error}</KycAlert>}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          className={cn('text-[14px]')}
        >
          {loading ? 'Saving nomination...' : 'Continue'}
        </Button>

        <Checkbox
          checked={skip}
          onChange={(checked) => {
            setSkip(checked);
            setErrors({});
            setError('');
          }}
          className="w-full items-start"
          boxClassName="mt-0.5"
          label="Skip nominee"
          labelProps={{ className: KYC_TYPO.subtitle }}
        />
      </form>
    </KycLayout>
  );
}
