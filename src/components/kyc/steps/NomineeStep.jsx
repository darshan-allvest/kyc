'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Checkbox from '@/components/common/Checkbox';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycSelectField from '@/components/kyc/KycSelectField';
import KycAlert from '@/components/kyc/KycAlert';
import {
  KYC_STEP,
  KYC_TYPO,
  MAX_NOMINEES,
  NOMINEE_OPT_OUT_DECLARATION,
  NOMINEE_RELATIONSHIPS,
  NOMINEE_STATEMENT_OPTIONS,
} from '@/constants/kycConstants';
import { saveNominee } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const EMPTY_NOMINEE = { name: '', relationship: '', dateOfBirth: '', sharePercentage: '100' };

// Adding or removing a nominee re-splits the shares evenly, with the remainder
// going to the first nominee so the total always lands on exactly 100.
const splitEvenly = (nominees) => {
  const share = Math.floor(100 / nominees.length);
  const remainder = 100 - share * nominees.length;
  return nominees.map((nominee, index) => ({
    ...nominee,
    sharePercentage: String(index === 0 ? share + remainder : share),
  }));
};

/**
 * Step — Nominee. Up to MAX_NOMINEES nominees with shares adding up to 100%,
 * plus what should be printed in the account holding statements — or an
 * explicit opt-out with its own acknowledgement.
 */
export default function NomineeStep() {
  const {
    goToStep,
    updateFlow,
    nominees: savedNominees,
    nomineeOptOut,
    nomineeOptOutAcknowledged,
    nomineeStatementPreferences,
  } = useKycFlow();

  const [nominees, setNominees] = useState(
    savedNominees?.length ? savedNominees : [EMPTY_NOMINEE]
  );
  const [statementPreferences, setStatementPreferences] = useState(
    nomineeStatementPreferences?.length
      ? nomineeStatementPreferences
      : [NOMINEE_STATEMENT_OPTIONS[0].id]
  );
  const [skip, setSkip] = useState(Boolean(nomineeOptOut));
  const [optOutAccepted, setOptOutAccepted] = useState(Boolean(nomineeOptOutAcknowledged));
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalShare = nominees.reduce(
    (sum, nominee) => sum + Number(nominee.sharePercentage || 0),
    0
  );

  const setField = (index, key) => (event) => {
    const { value } = event.target;
    setNominees((prev) =>
      prev.map((nominee, i) =>
        i === index
          ? {
              ...nominee,
              [key]:
                key === 'sharePercentage' ? value.replace(/\D/g, '').slice(0, 3) : value,
            }
          : nominee
      )
    );
    setErrors((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: '' } : item)));
    if (error) setError('');
  };

  const addNominee = () => {
    if (nominees.length >= MAX_NOMINEES) return;
    setNominees((prev) => splitEvenly([...prev, { ...EMPTY_NOMINEE }]));
    setErrors([]);
    setError('');
  };

  const removeNominee = (index) => {
    setNominees((prev) => splitEvenly(prev.filter((_, i) => i !== index)));
    setErrors([]);
    setError('');
  };

  const validate = () => {
    const next = nominees.map((nominee) => {
      const fieldErrors = {};
      if (!nominee.name.trim()) fieldErrors.name = 'Enter the nominee name.';
      if (!nominee.relationship) fieldErrors.relationship = 'Select the relationship.';
      if (!nominee.dateOfBirth) fieldErrors.dateOfBirth = 'Enter the date of birth.';
      if (!Number(nominee.sharePercentage)) fieldErrors.sharePercentage = 'Enter a share.';
      return fieldErrors;
    });
    setErrors(next);

    if (next.some((fieldErrors) => Object.keys(fieldErrors).length)) return false;
    if (totalShare !== 100) {
      setError(`Nominee shares must add up to 100% (currently ${totalShare}%).`);
      return false;
    }
    if (!statementPreferences.length) {
      setError('Tick at least one of the account holding statement options.');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!skip && !validate()) return;
    if (skip && !optOutAccepted) {
      setError('Accept the opt-out declaration to continue without a nominee.');
      return;
    }

    setLoading(true);
    const result = await saveNominee({
      nominees: skip ? [] : nominees,
      optOut: skip,
      optOutAcknowledged: skip ? optOutAccepted : false,
      statementPreferences: skip ? [] : statementPreferences,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({
      nominees: result.data.nominees,
      nomineeOptOut: result.data.optOut,
      nomineeOptOutAcknowledged: result.data.optOutAcknowledged,
      nomineeStatementPreferences: result.data.statementPreferences,
    });
    goToStep(KYC_STEP.VERIFICATION);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit();
  };

  return (
    <KycLayout
      title="Add a nominee"
      subtitle={`A nominee makes it far easier for your family to claim your holdings. You can add up to ${MAX_NOMINEES}.`}
      showStepper
      currentStep={KYC_STEP.NOMINEE}
      maxWidth="max-w-[30rem]"
      onBack={loading ? undefined : () => goToStep(KYC_STEP.BANK_DETAILS)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {!skip && (
          <>
            {nominees.map((nominee, index) => (
              <section
                key={index}
                className="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Text
                    className={cn(KYC_TYPO.label, 'font-semibold')}
                    color="text-gray-700 dark:text-white"
                  >
                    Nominee {index + 1}
                  </Text>
                  {nominees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNominee(index)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold text-brandRed-loss transition-colors duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <KycTextField
                    label="Full name"
                    placeholder="Enter nominee name"
                    required
                    value={nominee.name}
                    error={errors[index]?.name}
                    onChange={setField(index, 'name')}
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <KycSelectField
                      label="Relationship"
                      options={NOMINEE_RELATIONSHIPS}
                      placeholder="Select relationship"
                      required
                      value={nominee.relationship}
                      error={errors[index]?.relationship}
                      onChange={setField(index, 'relationship')}
                    />
                    <KycTextField
                      label="Date of birth"
                      type="date"
                      required
                      value={nominee.dateOfBirth}
                      error={errors[index]?.dateOfBirth}
                      onChange={setField(index, 'dateOfBirth')}
                    />
                    <KycTextField
                      label="Share (%)"
                      inputMode="numeric"
                      maxLength={3}
                      required
                      value={nominee.sharePercentage}
                      error={errors[index]?.sharePercentage}
                      onChange={setField(index, 'sharePercentage')}
                    />
                  </div>
                </div>
              </section>
            ))}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {nominees.length < MAX_NOMINEES ? (
                <button
                  type="button"
                  onClick={addNominee}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Add another nominee
                </button>
              ) : (
                <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
                  You have added the maximum of {MAX_NOMINEES} nominees.
                </Text>
              )}

            </div>

            <section
              role="group"
              aria-labelledby="nominee-statement-label"
              className="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20"
            >
              <Text
                id="nominee-statement-label"
                className={KYC_TYPO.body}
                color="text-gray-600 dark:text-homepage-softGray"
              >
                Print in my account holding statements — tick one or both
                <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
                  *
                </span>
              </Text>

              <div className="mt-2 divide-y divide-gray-200 dark:divide-white/5">
                {NOMINEE_STATEMENT_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.id}
                    id={`nominee-statement-${option.id}`}
                    checked={statementPreferences.includes(option.id)}
                    onChange={(checked) => {
                      setStatementPreferences((prev) =>
                        checked
                          ? [...new Set([...prev, option.id])]
                          : prev.filter((id) => id !== option.id)
                      );
                      if (error) setError('');
                    }}
                    className="w-full items-start py-2"
                    boxClassName="mt-0.5"
                    label={option.label}
                    labelProps={{ className: KYC_TYPO.body }}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {skip && (
          <section className="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20">
            <Text
              className={cn(KYC_TYPO.label, 'font-semibold')}
              color="text-gray-900 dark:text-white"
            >
              {NOMINEE_OPT_OUT_DECLARATION.title}
            </Text>

            <Text
              className={cn(KYC_TYPO.body, 'mt-2')}
              color="text-gray-600 dark:text-homepage-softGray"
            >
              {NOMINEE_OPT_OUT_DECLARATION.intro}
            </Text>

            <Text
              className={cn(KYC_TYPO.body, 'mt-3')}
              color="text-gray-600 dark:text-homepage-softGray"
            >
              {NOMINEE_OPT_OUT_DECLARATION.understandingLabel}
            </Text>

            <ol className="mt-1.5 space-y-2">
              {NOMINEE_OPT_OUT_DECLARATION.points.map((point, index) => (
                <li key={point} className="flex gap-2">
                  <Text
                    as="span"
                    className={KYC_TYPO.body}
                    color="text-gray-500 dark:text-homepage-darkGrey"
                  >
                    ({'i'.repeat(index + 1)})
                  </Text>
                  <Text
                    as="span"
                    className={KYC_TYPO.body}
                    color="text-gray-600 dark:text-homepage-softGray"
                  >
                    {point}
                  </Text>
                </li>
              ))}
            </ol>

            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-white/5">
              <Checkbox
                id="nominee-opt-out-declaration"
                checked={optOutAccepted}
                onChange={(checked) => {
                  setOptOutAccepted(checked);
                  if (error) setError('');
                }}
                className="w-full items-start"
                boxClassName="mt-0.5"
                label={
                  <span>
                    {NOMINEE_OPT_OUT_DECLARATION.confirmation}
                    <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
                      *
                    </span>
                  </span>
                }
                labelProps={{ className: KYC_TYPO.body }}
              />
            </div>
          </section>
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
            setOptOutAccepted(false);
            setErrors([]);
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
