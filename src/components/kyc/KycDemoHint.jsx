'use client';

import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';

/**
 * KycDemoHint — quiet, one-line hint carrying the demo values.
 *
 * Deliberately understated: the flow should read like a real onboarding screen,
 * so test data sits in a small muted strip rather than a full alert card.
 */
export default function KycDemoHint({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-dashed border-gray-200 px-2.5 py-2 dark:border-white/10',
        className
      )}
    >
      <span className="shrink-0 rounded bg-homepage-purple/15 px-1.5 py-0.5">
        <Text as="span" className="text-[10px] font-semibold uppercase tracking-wide" color="text-homepage-purple">
          Demo
        </Text>
      </span>
      <Text as="span" className={cn(KYC_TYPO.body, 'min-w-0')} color="text-gray-500 dark:text-homepage-softGray">
        {children}
      </Text>
    </div>
  );
}
