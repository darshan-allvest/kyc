'use client';

import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';

const STATUS_META = {
  done: { srLabel: 'Done' },
  loading: { srLabel: 'In progress' },
  error: { srLabel: 'Failed' },
  pending: { srLabel: 'Pending' },
};

/**
 * KycProgressStages — the boxed checklist shown while details are fetched.
 *
 * Each stage is a dot on a connected rail: filled while running, ticked when
 * done, crossed on failure.
 *
 * @param {Array<{id: string, label: string}>} stages
 * @param {Record<string, 'pending'|'loading'|'done'|'error'>} statuses
 */
export default function KycProgressStages({ stages = [], statuses = {}, className }) {
  return (
    <ol
      aria-live="polite"
      className={cn(
        'rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20',
        className
      )}
    >
      {stages.map((stage, index) => {
        const status = statuses[stage.id] ?? 'pending';
        const isLast = index === stages.length - 1;
        const meta = STATUS_META[status] ?? STATUS_META.pending;

        return (
          <li key={stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  status === 'done' && 'border-brand-500 bg-brand-500 text-black',
                  status === 'loading' && 'border-brand-500 text-brand-500',
                  status === 'error' && 'border-brandRed-loss bg-brandRed-loss text-white',
                  status === 'pending' && 'border-gray-300 dark:border-white/20'
                )}
              >
                {status === 'done' && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                {status === 'loading' && (
                  <Loader2 className="size-3 animate-spin" strokeWidth={3} aria-hidden="true" />
                )}
                {status === 'error' && <X className="size-3" strokeWidth={3} aria-hidden="true" />}
              </span>

              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'my-1 w-0.5 flex-1',
                    status === 'done' ? 'bg-brand-500' : 'bg-gray-200 dark:bg-white/10'
                  )}
                />
              )}
            </div>

            <Text
              className={cn(KYC_TYPO.subtitle, !isLast && 'pb-4')}
              weight={status === 'loading' ? 'semibold' : 'normal'}
              color={
                status === 'pending'
                  ? 'text-gray-400 dark:text-homepage-darkGrey'
                  : 'text-gray-900 dark:text-white'
              }
            >
              {stage.label}
              <span className="sr-only"> — {meta.srLabel}</span>
            </Text>
          </li>
        );
      })}
    </ol>
  );
}
