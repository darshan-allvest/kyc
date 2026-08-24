'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import TextInput from '@/components/common/input/TextInput';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';

/**
 * KycTextField — label + input + hint/error, wired for accessibility.
 *
 * Wraps the app's existing <TextInput /> so the KYC forms inherit the same
 * input styling as the auth screens.
 *
 * @param {string} label
 * @param {string} [error]   — renders below the field and sets aria-invalid
 * @param {string} [hint]    — helper text (hidden while an error shows)
 * @param {React.ReactNode} [prefix] — static leading content, e.g. "+91"
 */
const KycTextField = forwardRef(function KycTextField(
  { label, error, hint, prefix, className, containerClassName, id, required, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id || `kyc-field-${generatedId}`;
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

      <div className={cn(prefix && 'relative')}>
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-white/70">
            {prefix}
          </span>
        )}
        <TextInput
          ref={ref}
          id={fieldId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(
            'text-[14px]',
            prefix && 'pl-14',
            error && 'border-brandRed-loss focus:border-brandRed-loss focus:ring-brandRed-loss',
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <Text
          id={`${fieldId}-error`}
          role="alert"
          className={cn(KYC_TYPO.body, 'mt-1.5')}
          color="text-brandRed-loss"
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          id={`${fieldId}-hint`}
          className={cn(KYC_TYPO.body, 'mt-1.5')}
          color="text-gray-500 dark:text-homepage-darkGrey"
        >
          {hint}
        </Text>
      ) : null}
    </div>
  );
});

export default KycTextField;
