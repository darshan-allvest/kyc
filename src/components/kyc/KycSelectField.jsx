'use client';

import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';

const SELECT_CLASS =
  'w-full appearance-none rounded-lg border border-homepage-borderColor bg-container-black px-4 py-3 pr-10 font-inter text-[14px] text-white outline-none transition-colors focus:border-brand-300 focus:ring-1 focus:ring-brand-300';

/**
 * KycSelectField — native select styled to match <TextInput />.
 *
 * Native on purpose: it gives keyboard and mobile-wheel behaviour for free,
 * which a custom dropdown would have to re-implement.
 *
 * @param {string} label
 * @param {Array<string|{value: string, label: string}>} options
 * @param {string} [placeholder] — rendered as a disabled first option
 * @param {string} [error]
 */
const KycSelectField = forwardRef(function KycSelectField(
  { label, options = [], placeholder = 'Select', error, hint, id, required, className, containerClassName, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id || `kyc-select-${generatedId}`;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block">
          <Text as="span" className={KYC_TYPO.label} color="text-gray-700 dark:text-white">
            {label}
            {required && (
              <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
                *
              </span>
            )}
          </Text>
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(SELECT_CLASS, error && 'border-brandRed-loss', className)}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/60"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <Text id={`${fieldId}-error`} role="alert" className={cn(KYC_TYPO.body, 'mt-1.5')} color="text-brandRed-loss">
          {error}
        </Text>
      ) : hint ? (
        <Text id={`${fieldId}-hint`} className={cn(KYC_TYPO.body, 'mt-1.5')} color="text-gray-500 dark:text-homepage-darkGrey">
          {hint}
        </Text>
      ) : null}
    </div>
  );
});

export default KycSelectField;
