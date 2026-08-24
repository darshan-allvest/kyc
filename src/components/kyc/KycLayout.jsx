'use client';

import Image from 'next/image';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Heading from '@/components/common/Heading';
import Text from '@/components/common/Text';
import KycStepper from '@/components/kyc/KycStepper';
import KycBrandPanel from '@/components/kyc/KycBrandPanel';
import { KYC_LOGO_SRC, KYC_TYPO } from '@/constants/kycConstants';

/**
 * KycLayout — shell for every screen of the KYC journey.
 *
 * Two panes on large screens (brand rail + form), one column below that, the
 * same split the reference app uses for login/signup. The form column is a
 * single centered card so no screen ever floats in empty space.
 *
 * @param {string}  title        — screen title (16px)
 * @param {string}  subtitle     — supporting line (14px)
 * @param {boolean} showStepper  — show progress (vertical rail + mobile bar)
 * @param {string}  currentStep  — KYC_STEP value driving the stepper
 * @param {Function} [onBack]    — renders a back link above the card
 * @param {React.ReactNode} [footer] — CTA area pinned to the bottom of the card
 * @param {React.ReactNode} [aside]  — extra content below the card
 * @param {string}  [maxWidth]   — Tailwind max-width for the form column
 */
export default function KycLayout({
  title,
  subtitle,
  showStepper = false,
  currentStep,
  onBack,
  footer,
  aside,
  maxWidth = 'max-w-[26rem]',
  contentClassName,
  children,
}) {
  return (
    <div className="flex min-h-[100dvh] items-start bg-white dark:bg-homepage-deepBlack">
      <KycBrandPanel currentStep={currentStep} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact header — the only branding on small screens */}
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10 sm:px-6 lg:hidden">
          <Image
            src={KYC_LOGO_SRC}
            alt="Allvest"
            width={256}
            height={59}
            priority
            className="h-6 w-auto"
          />
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-homepage-softGray">
            <ShieldCheck className="size-3.5 text-brand-500" aria-hidden="true" />
            <Text as="span" className={KYC_TYPO.body} color="text-current">
              Secure
            </Text>
          </span>
        </header>

        <main className="flex min-h-[100dvh] flex-1 justify-center px-4 py-6 sm:px-6 sm:py-10 lg:items-center lg:py-12">
          <div className={cn('w-full', maxWidth)}>
            {showStepper && (
              <KycStepper currentStep={currentStep} className="mb-5 lg:hidden" />
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mb-2 -ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-gray-500 transition-colors duration-200 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-homepage-softGray dark:hover:text-white"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <Text as="span" className={KYC_TYPO.body} color="text-current">
                  Back
                </Text>
              </button>
            )}

            <div
              className={cn(
                'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6',
                'dark:border-white/10 dark:bg-homepage-cardBgDark dark:shadow-none',
                contentClassName
              )}
            >
              {(title || subtitle) && (
                <div className="mb-5">
                  {title && (
                    <Heading
                      as="h1"
                      size="base"
                      font="sora"
                      weight="semibold"
                      className={cn(KYC_TYPO.title, 'md:text-[16px]')}
                    >
                      {title}
                    </Heading>
                  )}
                  {subtitle && (
                    <Text
                      className={cn(KYC_TYPO.subtitle, 'mt-1.5')}
                      color="text-gray-600 dark:text-homepage-softGray"
                    >
                      {subtitle}
                    </Text>
                  )}
                </div>
              )}

              {children}

              {footer && <div className="mt-6">{footer}</div>}
            </div>

            {aside}
          </div>
        </main>
      </div>
    </div>
  );
}
