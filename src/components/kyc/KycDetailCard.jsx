'use client';

import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import { KYC_TYPO } from '@/constants/kycConstants';

/**
 * KycDetailCard — a titled section of read-only label/value rows.
 *
 * @param {string} title
 * @param {React.ReactNode} [badge]  — e.g. a "Fetched" pill
 * @param {Array<{label: string, value: React.ReactNode, span?: boolean}>} items
 *        `span: true` makes the row full-width (addresses, long names).
 */
export default function KycDetailCard({ title, badge, items = [], footer, className }) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 p-4 dark:border-homepage-borderColor dark:bg-homepage-cardBgDark',
        className
      )}
    >
      {(title || badge) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <Heading as="h2" size="sm" font="sora" weight="semibold" className={KYC_TYPO.subtitle}>
              {title}
            </Heading>
          )}
          {badge}
        </div>
      )}

      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {items
          .filter((item) => item && item.value !== undefined && item.value !== null && item.value !== '')
          .map((item) => (
            <div key={item.label} className={cn('min-w-0', item.span && 'sm:col-span-2')}>
              <dt>
                <Text as="span" className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
                  {item.label}
                </Text>
              </dt>
              <dd className="mt-0.5">
                <Text
                  as="span"
                  className={cn(KYC_TYPO.subtitle, 'font-medium lining-nums tabular-nums')}
                  color="text-gray-900 dark:text-white"
                >
                  {item.value}
                </Text>
              </dd>
            </div>
          ))}
      </dl>

      {footer && <div className="mt-3">{footer}</div>}
    </section>
  );
}
