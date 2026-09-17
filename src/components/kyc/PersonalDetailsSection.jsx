'use client';

import { useState } from 'react';
import { ChevronDown, Pencil, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import KycSelectField from '@/components/kyc/KycSelectField';
import KycTextField from '@/components/kyc/KycTextField';
import KycAlert from '@/components/kyc/KycAlert';
import { ADDRESS_FIELDS, KYC_TYPO, PROFILE_FIELDS } from '@/constants/kycConstants';
import { maskPan } from '@/lib/kyc/kycFormatters';
import { validateIndianName } from '@/utils/formValidators';

const PINCODE_REGEX = /^[1-9]\d{5}$/;

/** The edit form carries the name, the profile selects and the address. */
const buildForm = (details) => ({
  fullName: details?.fullName ?? '',
  ...PROFILE_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: details?.[field.key] ?? '' }), {}),
  ...ADDRESS_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: details?.[field.key] ?? '' }), {}),
});

/** Returns a map of field key → message; empty when the form is valid. */
const validateForm = (form) => {
  const errors = {};
  const name = form.fullName.trim();
  if (!name || !validateIndianName(name)) errors.fullName = 'Enter your name as it appears on your PAN.';

  ADDRESS_FIELDS.forEach((field) => {
    const value = (form[field.key] ?? '').trim();
    if (!value) errors[field.key] = `Enter your ${field.label.toLowerCase()}.`;
  });
  if (!errors.pincode && !PINCODE_REGEX.test(form.pincode.trim()))
    errors.pincode = 'Enter a valid 6-digit pincode.';

  return errors;
};

/**
 * PersonalDetailsSection — the collapsible "Personal Details" block on the
 * Confirm Details screen: fetched values in two columns, with Edit Details for
 * the name, profile fields and address an applicant is allowed to correct.
 *
 * @param {object} details — fetched personal details
 * @param {string} pan
 * @param {Function} onSave — (patch) => Promise<{success, error}>
 */
export default function PersonalDetailsSection({
  details,
  pan,
  onSave,
  missingCount = 0,
  className,
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => buildForm(details));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!details) return null;

  // Fetched identity values are simply hidden when absent; the profile fields
  // are always listed, so it is obvious which ones still need filling in.
  const rows = [
    ['Full Name', details.fullName, false],
    ['Occupation', details.occupation, true],
    ['Marital Status', details.maritalStatus, true],
    ["Father's Full Name", details.fathersName, false],
    ['Gross Annual Income', details.incomeRange, true],
    ['Trading Experience', details.tradingExperience, true],
    ['Source Of Income', details.sourceOfWealth, true],
    ['PAN', maskPan(pan), false],
  ];

  /** Clears a field's error as soon as it is typed into. */
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  };

  const handleSave = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const trimmed = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ])
    );

    setFieldErrors({});
    setSaving(true);
    setError('');
    const result = await onSave(trimmed);
    setSaving(false);

    if (!result?.success) {
      setError(result?.error || 'Could not save your changes.');
      return;
    }
    setEditing(false);
  };

  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <User className="size-4 text-homepage-purple" aria-hidden="true" />
        <Heading as="h2" size="sm" font="sora" weight="semibold" className={cn(KYC_TYPO.subtitle, 'flex-1')}>
          Personal Details
        </Heading>
        {missingCount > 0 && (
          <span className="shrink-0 rounded-full border border-brandRed-loss/40 bg-brandRed-12 px-2 py-0.5">
            <Text as="span" className="text-[11px] font-semibold" color="text-brandRed-loss">
              {missingCount} to add
            </Text>
          </span>
        )}
        <ChevronDown
          className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          {editing ? (
            <div className="mt-3 space-y-3">
              <KycTextField
                label="Full Name"
                autoComplete="name"
                required
                value={form.fullName}
                error={fieldErrors.fullName}
                onChange={(event) => setField('fullName', event.target.value)}
              />

              {PROFILE_FIELDS.map((field) => (
                <KycSelectField
                  key={field.key}
                  label={field.label}
                  options={field.options}
                  required
                  value={form[field.key]}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              ))}

              {ADDRESS_FIELDS.map((field) => (
                <KycTextField
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  inputMode={field.inputMode}
                  maxLength={field.maxLength}
                  required
                  value={form[field.key]}
                  error={fieldErrors[field.key]}
                  onChange={(event) =>
                    setField(
                      field.key,
                      field.key === 'pincode'
                        ? event.target.value.replace(/\D/g, '')
                        : event.target.value
                    )
                  }
                />
              ))}

              {error && <KycAlert tone="error">{error}</KycAlert>}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  weight="semibold"
                  loading={saving}
                  className="min-h-11 text-[12px]"
                  onClick={handleSave}
                >
                  {saving ? 'Saving...' : 'Save details'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  weight="semibold"
                  className="min-h-11 text-[12px]"
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setFieldErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                {rows
                  .filter(([, value, always]) => value || always)
                  .map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt>
                        <Text as="span" className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
                          {label}
                        </Text>
                      </dt>
                      <dd className="mt-0.5">
                        <Text
                          as="span"
                          className={cn(KYC_TYPO.subtitle, 'font-medium')}
                          color={
                            value
                              ? 'text-gray-900 dark:text-white'
                              : 'text-brandRed-loss'
                          }
                        >
                          {value || 'Not added yet'}
                        </Text>
                      </dd>
                    </div>
                  ))}

                <div className="min-w-0 sm:col-span-2">
                  <dt>
                    <Text as="span" className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
                      Address
                    </Text>
                  </dt>
                  <dd className="mt-0.5">
                    <Text
                      as="span"
                      className={cn(KYC_TYPO.subtitle, 'font-medium')}
                      color="text-gray-900 dark:text-white"
                    >
                      {details.address}, {details.city}, {details.state} - {details.pincode}
                    </Text>
                  </dd>
                </div>
              </dl>

              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForm(buildForm(details));
                    setFieldErrors({});
                    setError('');
                    setEditing(true);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  {missingCount > 0 ? 'Add missing details' : 'Edit Details'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
