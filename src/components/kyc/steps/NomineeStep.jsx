'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Trash2, UserPlus, UserX } from 'lucide-react';
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
  NOMINEE_ID_DOCUMENTS,
  NOMINEE_OPT_OUT_DECLARATION,
  NOMINEE_RELATIONSHIPS,
  NOMINEE_STATEMENT_OPTIONS,
} from '@/constants/kycConstants';
import { saveNominee } from '@/services/kyc/mockKycService';
import { INDIAN_MOBILE_REGEX, PAN_REGEX, validateEmail } from '@/utils/formValidators';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const EMPTY_NOMINEE = {
  name: '',
  relationship: '',
  dateOfBirth: '',
  sharePercentage: '',
  // Optional details of nomination (SEBI form, part 3).
  mobile: '',
  email: '',
  idDocument: '',
  idNumber: '',
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
    nomineeStatementPreference,
  } = useKycFlow();

  const [nominees, setNominees] = useState(
    savedNominees?.length ? savedNominees : [EMPTY_NOMINEE]
  );
  const [statementPreference, setStatementPreference] = useState(
    nomineeStatementPreference ?? NOMINEE_STATEMENT_OPTIONS[0].id
  );
  const [skip, setSkip] = useState(Boolean(nomineeOptOut));
  const [optOutAccepted, setOptOutAccepted] = useState(Boolean(nomineeOptOutAcknowledged));
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shares are optional: whatever is left after the entered ones is split
  // evenly across the nominees that were left blank.
  const withShares = (() => {
    const entered = nominees.reduce(
      (sum, nominee) => sum + Number(nominee.sharePercentage || 0),
      0
    );
    const blanks = nominees.filter((nominee) => !Number(nominee.sharePercentage)).length;
    if (!blanks) return nominees;

    const remainder = Math.max(0, 100 - entered);
    const each = Math.floor(remainder / blanks);
    let extra = remainder - each * blanks;

    return nominees.map((nominee) => {
      if (Number(nominee.sharePercentage)) return nominee;
      const bonus = extra > 0 ? 1 : 0;
      extra -= bonus;
      return { ...nominee, sharePercentage: String(each + bonus) };
    });
  })();

  const totalShare = withShares.reduce(
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
                key === 'sharePercentage'
                  ? value.replace(/\D/g, '').slice(0, 3)
                  : key === 'mobile'
                    ? value.replace(/\D/g, '').slice(0, 10)
                    : key === 'idNumber'
                      ? value.toUpperCase()
                      : value,
            }
          : nominee
      )
    );
    setErrors((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: '' } : item)));
    if (error) setError('');
  };

  const addNominee = () => {
    if (nominees.length >= MAX_NOMINEES) return;
    setNominees((prev) => [...prev, { ...EMPTY_NOMINEE }]);
    setErrors([]);
    setError('');
  };

  const removeNominee = (index) => {
    setNominees((prev) => prev.filter((_, i) => i !== index));
    setErrors([]);
    setError('');
  };

  const validate = () => {
    const next = nominees.map((nominee) => {
      const fieldErrors = {};
      if (!nominee.name.trim()) fieldErrors.name = 'Enter the nominee name.';
      if (!nominee.relationship) fieldErrors.relationship = 'Select the relationship.';
      if (!nominee.dateOfBirth) fieldErrors.dateOfBirth = 'Enter the date of birth.';

      // Everything below is optional — checked only when something was entered.
      if (nominee.mobile && !INDIAN_MOBILE_REGEX.test(nominee.mobile))
        fieldErrors.mobile = 'Enter a valid 10-digit mobile number.';
      if (nominee.email && !validateEmail(nominee.email))
        fieldErrors.email = 'Enter a valid email address.';
      if (nominee.idNumber && !nominee.idDocument)
        fieldErrors.idDocument = 'Select which document this number is from.';
      if (nominee.idDocument && !nominee.idNumber)
        fieldErrors.idNumber = 'Enter the document number.';
      if (nominee.idDocument === NOMINEE_ID_DOCUMENTS[0] && nominee.idNumber && !/^\d{4}$/.test(nominee.idNumber))
        fieldErrors.idNumber = 'Enter the last four digits of the Aadhaar.';
      if (nominee.idDocument === NOMINEE_ID_DOCUMENTS[1] && nominee.idNumber && !PAN_REGEX.test(nominee.idNumber))
        fieldErrors.idNumber = 'Enter a valid PAN (e.g. ABCDE1234F).';

      return fieldErrors;
    });
    setErrors(next);

    if (next.some((fieldErrors) => Object.keys(fieldErrors).length)) return false;
    if (totalShare !== 100) {
      setError(`Nominee shares must add up to 100% (currently ${totalShare}%).`);
      return false;
    }
    if (!statementPreference) {
      setError('Choose what should be printed in your account holding statements.');
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
      nominees: skip ? [] : withShares,
      optOut: skip,
      optOutAcknowledged: skip ? optOutAccepted : false,
      statementPreference: skip ? null : statementPreference,
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
      nomineeStatementPreference: result.data.statementPreference,
    });
    goToStep(KYC_STEP.VERIFICATION);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit();
  };

  return (
    <KycLayout
      title={skip ? 'Skip nomination' : 'Add a nominee'}
      subtitle={
        skip
          ? 'Read and accept the declaration below to open the account without a nominee.'
          : `A nominee makes it far easier for your family to claim your holdings. You can add up to ${MAX_NOMINEES}.`
      }
      showStepper
      currentStep={KYC_STEP.NOMINEE}
      maxWidth="max-w-[30rem]"
      onBack={loading ? undefined : () => goToStep(KYC_STEP.PAYMENT)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Add or skip — chosen up front, not buried under the form */}
        <fieldset>
          <legend className="sr-only">Do you want to add a nominee?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'add', label: 'Add nominee', icon: UserPlus, skip: false },
              { id: 'skip', label: 'Skip nominee', icon: UserX, skip: true },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = skip === option.skip;
              return (
                <label
                  key={option.id}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 transition-colors',
                    isSelected
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-shade'
                      : 'border-gray-200 dark:border-homepage-borderColor'
                  )}
                >
                  <input
                    type="radio"
                    name="nomineeChoice"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => {
                      setSkip(option.skip);
                      // Choosing to skip is itself the opt-out, so the
                      // declaration starts accepted; it can still be un-ticked.
                      setOptOutAccepted(option.skip);
                      setErrors([]);
                      setError('');
                    }}
                    className="sr-only"
                  />
                  <Icon
                    className={cn('size-4 shrink-0', isSelected ? 'text-brand-500' : 'text-gray-500')}
                    aria-hidden="true"
                  />
                  <Text
                    as="span"
                    className={KYC_TYPO.subtitle}
                    weight={isSelected ? 'semibold' : 'normal'}
                  >
                    {option.label}
                  </Text>
                </label>
              );
            })}
          </div>
        </fieldset>

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
                  </div>

                  {/* Optional details of nomination — collapsed by default */}
                  <details className="group rounded-lg border border-gray-200 bg-black/10 dark:border-white/10 dark:bg-black/30">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                      <Text
                        as="span"
                        className={cn(KYC_TYPO.label, 'flex-1 font-semibold')}
                        color="text-gray-700 dark:text-white"
                      >
                        Optional details
                      </Text>
                      <Text
                        as="span"
                        className="text-[11px] font-medium"
                        color="text-gray-500 dark:text-homepage-darkGrey"
                      >
                        share · contact · ID
                      </Text>
                      <ChevronDown
                        className="size-4 shrink-0 text-brand-500 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>

                    <div className="space-y-3 border-t border-gray-200 px-3 py-3 dark:border-white/10">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <KycTextField
                          label="% Share"
                          inputMode="numeric"
                          maxLength={3}
                          placeholder="Auto"
                          hint="Blank = equal split"
                          value={nominee.sharePercentage}
                          error={errors[index]?.sharePercentage}
                          onChange={setField(index, 'sharePercentage')}
                        />
                        <KycTextField
                          label="Mobile"
                          type="tel"
                          inputMode="numeric"
                          prefix="+91"
                          maxLength={10}
                          autoComplete="off"
                          placeholder="Optional"
                          value={nominee.mobile}
                          error={errors[index]?.mobile}
                          onChange={setField(index, 'mobile')}
                        />
                      </div>

                      <KycTextField
                        label="Email"
                        type="email"
                        autoComplete="off"
                        placeholder="Optional"
                        hint="Lets the DP / MF RTA reach your nominee (or their guardian)."
                        value={nominee.email}
                        error={errors[index]?.email}
                        onChange={setField(index, 'email')}
                      />

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <KycSelectField
                          label="ID document"
                          options={NOMINEE_ID_DOCUMENTS}
                          placeholder="Select"
                          value={nominee.idDocument}
                          error={errors[index]?.idDocument}
                          onChange={setField(index, 'idDocument')}
                        />
                        <KycTextField
                          label="Document number"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Optional"
                          value={nominee.idNumber}
                          error={errors[index]?.idNumber}
                          onChange={setField(index, 'idNumber')}
                        />
                      </div>
                    </div>
                  </details>
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
              role="radiogroup"
              aria-labelledby="nominee-statement-label"
              className="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20"
            >
              <Text
                id="nominee-statement-label"
                className={KYC_TYPO.body}
                color="text-gray-600 dark:text-homepage-softGray"
              >
                Print in my account holding statements
                <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
                  *
                </span>
              </Text>

              <div className="mt-2 space-y-2">
                {NOMINEE_STATEMENT_OPTIONS.map((option) => {
                  const isSelected = statementPreference === option.id;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors',
                        isSelected
                          ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-shade'
                          : 'border-gray-200 dark:border-homepage-borderColor'
                      )}
                    >
                      <input
                        type="radio"
                        name="nomineeStatementPreference"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => {
                          setStatementPreference(option.id);
                          if (error) setError('');
                        }}
                        className="mt-0.5 size-4 shrink-0 accent-brand-500"
                      />
                      <Text
                        as="span"
                        className={KYC_TYPO.body}
                        color="text-gray-700 dark:text-homepage-lightWhite"
                      >
                        {option.label}
                      </Text>
                    </label>
                  );
                })}
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
      </form>
    </KycLayout>
  );
}
