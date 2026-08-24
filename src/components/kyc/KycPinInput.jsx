'use client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

// Masks the digits the way a PIN field should, while keeping the same
// auto-advance / backspace / paste behaviour as the OTP boxes.
const MASK_STYLE = {
  WebkitTextSecurity: 'disc',
  MozTextSecurity: 'disc',
  textSecurity: 'disc',
};

/**
 * KycPinInput — masked PIN boxes (DigiLocker security PIN, MPIN-style entry).
 *
 * @param {string} value
 * @param {Function} onChange   — (value: string) => void
 * @param {Function} [onComplete] — fired once every digit is filled
 * @param {number} [maxLength]  — number of digits (default 6)
 * @param {boolean} [hasError]
 */
export default function KycPinInput({
  value,
  onChange,
  onComplete,
  maxLength = 6,
  hasError = false,
  disabled = false,
  autoFocus = true,
  ariaLabel = 'Security PIN',
}) {
  return (
    <InputOTP
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      maxLength={maxLength}
      pattern={REGEXP_ONLY_DIGITS}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-invalid={hasError ? 'true' : undefined}
      inputMode="numeric"
      autoComplete="off"
    >
      <InputOTPGroup className="flex justify-between gap-1.5 sm:gap-2.5">
        {Array.from({ length: maxLength }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            style={MASK_STYLE}
            className={cn(
              'h-12 w-full rounded-lg border bg-container-black text-[16px] font-semibold text-white sm:h-14',
              hasError ? 'border-brandRed-loss' : 'border-homepage-borderColor'
            )}
            activeClassName="!border-brand-500 !ring-1 !ring-brand-500"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
