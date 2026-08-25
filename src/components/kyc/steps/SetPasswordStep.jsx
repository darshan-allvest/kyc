'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import PasswordInput from '@/components/common/input/PasswordInput';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { setAccountPassword } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

// Mirrors PASSWORD_REGEX in src/utils/formValidators.js, rule by rule, so the
// applicant sees which requirement is still missing.
const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { id: 'symbol', label: 'One symbol', test: (v) => /[^\w\s]/.test(v) },
];

function PasswordField({ id, label, value, error, onChange, autoComplete, autoFocus }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block">
        <Text as="span" className={KYC_TYPO.label} color="text-gray-700 dark:text-white">
          {label}
          <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
            *
          </span>
        </Text>
      </label>
      <PasswordInput
        id={id}
        placeholder={label}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn('text-[14px]', error && 'border-brandRed-loss')}
      />
      {error && (
        <Text
          id={`${id}-error`}
          role="alert"
          className={cn(KYC_TYPO.body, 'mt-1.5')}
          color="text-brandRed-loss"
        >
          {error}
        </Text>
      )}
    </div>
  );
}

/**
 * Step 5 — set the account password, once the email is verified.
 */
export default function SetPasswordStep() {
  const { goToStep, updateFlow } = useKycFlow();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    if (error) setError('');
  };

  const allRulesMet = RULES.every((rule) => rule.test(form.password));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!allRulesMet) errors.password = 'Your password does not meet all requirements yet.';
    if (!form.confirmPassword) errors.confirmPassword = 'Re-enter your password.';
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Both passwords must match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setError('');
    setLoading(true);
    const result = await setAccountPassword(form);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ passwordSet: true });
    goToStep(KYC_STEP.MPIN);
  };

  return (
    <KycLayout
      title="Set your password"
      subtitle="You'll use it with your email to sign in to your account."
      showStepper
      currentStep={KYC_STEP.PASSWORD}
      onBack={loading ? undefined : () => goToStep(KYC_STEP.EMAIL_OTP)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <PasswordField
          id="kyc-new-password"
          label="Password"
          autoComplete="new-password"
          autoFocus
          value={form.password}
          error={fieldErrors.password}
          onChange={setField('password')}
        />

        <ul className="space-y-1.5" aria-label="Password requirements">
          {RULES.map((rule) => {
            const met = rule.test(form.password);
            return (
              <li key={rule.id} className="flex items-center gap-2">
                {met ? (
                  <Check className="size-3.5 text-brand-500" aria-hidden="true" />
                ) : (
                  <X className="size-3.5 text-gray-400 dark:text-homepage-darkGrey" aria-hidden="true" />
                )}
                <Text
                  as="span"
                  className={KYC_TYPO.body}
                  color={
                    met
                      ? 'text-brand-500'
                      : 'text-gray-500 dark:text-homepage-darkGrey'
                  }
                >
                  {rule.label}
                </Text>
              </li>
            );
          })}
        </ul>

        <PasswordField
          id="kyc-confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={setField('confirmPassword')}
        />

        {error && <KycAlert tone="error">{error}</KycAlert>}

        <Button
          type="submit"
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={!allRulesMet || !form.confirmPassword}
          className="text-[14px]"
        >
          {loading ? 'Saving password...' : 'Continue'}
        </Button>
      </form>
    </KycLayout>
  );
}
