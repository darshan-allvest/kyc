'use client';

import { useState } from 'react';
import Button from '@/components/common/button/Button';
import KycLayout from '@/components/kyc/KycLayout';
import KycSelectField from '@/components/kyc/KycSelectField';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_STEP, PROFILE_FIELDS } from '@/constants/kycConstants';
import { updatePersonalDetails } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

/**
 * Step — profile details an applicant without a KYC record fills in.
 *
 * The government fetch returns identity data only (name, father's name, PAN,
 * address), so occupation, marital status, income, source of wealth and
 * trading experience are asked here before the Confirm Details screen.
 */
export default function ProfileDetailsStep() {
  const { goToStep, updateFlow, personalDetails } = useKycFlow();
  const [form, setForm] = useState(() =>
    PROFILE_FIELDS.reduce(
      (acc, field) => ({ ...acc, [field.key]: personalDetails?.[field.key] ?? '' }),
      {}
    )
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = PROFILE_FIELDS.reduce(
      (acc, field) => (form[field.key] ? acc : { ...acc, [field.key]: `Select your ${field.label.toLowerCase()}.` }),
      {}
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setError('');
    setLoading(true);
    const result = await updatePersonalDetails({ ...(personalDetails || {}), ...form });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ personalDetails: { ...(personalDetails || {}), ...form } });
    goToStep(KYC_STEP.CONFIRM_DETAILS);
  };

  return (
    <KycLayout
      title="A few more details"
      subtitle="These are not part of your government records, so we need them from you."
      showStepper
      currentStep={KYC_STEP.PROFILE_DETAILS}
      onBack={loading ? undefined : () => goToStep(KYC_STEP.GOVERNMENT_FETCH)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {PROFILE_FIELDS.map((field) => (
          <KycSelectField
            key={field.key}
            label={field.label}
            options={field.options}
            placeholder={`Select ${field.label.toLowerCase()}`}
            required
            value={form[field.key]}
            error={fieldErrors[field.key]}
            onChange={setField(field.key)}
          />
        ))}

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
          {loading ? 'Saving details...' : 'Save & Continue'}
        </Button>
      </form>
    </KycLayout>
  );
}
