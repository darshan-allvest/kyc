'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import {
  KYC_STEPPER_STEPS,
  STEP_TO_STEPPER_KEY,
  KYC_TYPO,
} from '@/constants/kycConstants';

/**
 * KycStepper — the 7 onboarding milestones (Account → Complete).
 *
 * Two orientations:
 *   'vertical'   — the rail in the desktop brand panel (full labels)
 *   'horizontal' — a compact bar + "Step n of 7 · Label" line, used above the
 *                  form on tablet/mobile where a 7-label rail cannot fit.
 *
 * @param {string} currentStep — a KYC_STEP value, mapped via STEP_TO_STEPPER_KEY
 */
export default function KycStepper({ currentStep, orientation = 'horizontal', className }) {
  const activeKey = STEP_TO_STEPPER_KEY[currentStep] ?? KYC_STEPPER_STEPS[0].key;
  const activeIndex = Math.max(
    0,
    KYC_STEPPER_STEPS.findIndex((step) => step.key === activeKey)
  );
  const activeStep = KYC_STEPPER_STEPS[activeIndex];

  if (orientation === 'vertical') {
    return (
      <nav aria-label="KYC progress" className={className}>
        <ol className="space-y-1">
          {KYC_STEPPER_STEPS.map((step, index) => {
            const isDone = index < activeIndex;
            const isCurrent = index === activeIndex;
            const isLast = index === KYC_STEPPER_STEPS.length - 1;

            return (
              <li
                key={step.key}
                aria-current={isCurrent ? 'step' : undefined}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors',
                      isDone && 'border-brand-500 bg-brand-500 text-black',
                      isCurrent && 'border-brand-500 bg-brand-12 text-brand-500',
                      !isDone && !isCurrent && 'border-white/15 text-homepage-darkGrey'
                    )}
                  >
                    {isDone ? (
                      <>
                        <Check className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Completed</span>
                      </>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'my-1 h-3 w-px',
                        index < activeIndex ? 'bg-brand-500' : 'bg-white/10'
                      )}
                    />
                  )}
                </div>

                <Text
                  className={cn(KYC_TYPO.subtitle, 'pb-1 pt-0.5')}
                  weight={isCurrent ? 'semibold' : 'normal'}
                  color={
                    isCurrent
                      ? 'text-white'
                      : isDone
                        ? 'text-homepage-lightWhite'
                        : 'text-homepage-darkGrey'
                  }
                >
                  {step.label}
                </Text>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="KYC progress" className={className}>
      <div className="flex items-center justify-between gap-3">
        <Text
          className={cn(KYC_TYPO.body, 'shrink-0')}
          color="text-gray-500 dark:text-homepage-softGray"
        >
          Step {activeIndex + 1} of {KYC_STEPPER_STEPS.length}
        </Text>
        <Text
          className={cn(KYC_TYPO.body, 'truncate font-semibold')}
          color="text-brand-500"
        >
          {activeStep.label}
        </Text>
      </div>

      <div className="mt-2 flex items-center gap-1" aria-hidden="true">
        {KYC_STEPPER_STEPS.map((step, index) => (
          <span
            key={step.key}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index < activeIndex && 'bg-brand-500',
              index === activeIndex && 'bg-brand-500/60',
              index > activeIndex && 'bg-gray-200 dark:bg-white/10'
            )}
          />
        ))}
      </div>
    </nav>
  );
}
