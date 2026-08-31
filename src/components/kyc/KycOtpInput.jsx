'use client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { OTP_LENGTH } from '@/constants/kycConstants';

/**
 * KycOtpInput — one visible box per digit, `maxLength` of them. Defaults to the
 * OTPs we issue ourselves; the Aadhaar e-sign and the DigiLocker PIN pass their
 * own longer lengths.
 *
 * Built on the app's existing input-otp primitive, so auto-focus, auto-advance,
 * backspace and paste all come for free.
 *
 * @param {string} value
 * @param {Function} onChange   — (value: string) => void
 * @param {Function} [onComplete] — fired when all digits are filled
 * @param {boolean} [hasError]  — red border state
 */
export default function KycOtpInput({
  value,
  onChange,
  onComplete,
  maxLength = OTP_LENGTH,
  hasError = false,
  disabled = false,
  autoFocus = true,
  ariaLabel = 'One-time password',
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
      autoComplete="one-time-code"
    >
      <InputOTPGroup className="flex justify-between gap-1.5 sm:gap-2.5">
        {Array.from({ length: maxLength }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className={cn(
              'h-12 w-full rounded-lg border bg-container-black text-[16px] font-semibold text-white sm:h-14',
              hasError
                ? 'border-brandRed-loss'
                : 'border-homepage-borderColor'
            )}
            activeClassName="!border-brand-500 !ring-1 !ring-brand-500"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
