'use client';

import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Checkbox from '@/components/common/Checkbox';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import { KYC_TYPO, RUNNING_ACCOUNT_SETTLEMENT } from '@/constants/kycConstants';
import {
  TRADING_SEGMENT_DECLARATIONS,
  mockDeclarations,
} from '@/services/kyc/mockKycData';

/**
 * Declaration — the block signed off on the Confirm Details screen: which
 * segments to activate, plus the statutory declarations (PEP, residency/FATCA,
 * running-account authorisation, DDPI, ECN, capacity, past actions, nominee in
 * statements).
 *
 * @param {string[]} segments    — selected segment ids
 * @param {Function} onToggleSegment — (id) => void
 * @param {string[]} accepted    — accepted declaration ids
 * @param {Function} onToggle    — (id, checked) => void
 * @param {string} settlement    — running-account settlement period
 * @param {Function} onSettlementChange — (value) => void
 */
export default function Declaration({
  segments = [],
  onToggleSegment,
  accepted = [],
  onToggle,
  settlement,
  onSettlementChange,
  className,
}) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand-500" aria-hidden="true" />
        <Heading as="h2" size="sm" font="sora" weight="semibold" className={KYC_TYPO.subtitle}>
          Declarations
        </Heading>
      </div>

      {/* Segments */}
      <fieldset className="mt-3">
        <legend className="mb-2">
          <Text as="span" className={KYC_TYPO.label} color="text-gray-600 dark:text-homepage-softGray">
            Activate Segments
          </Text>
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {TRADING_SEGMENT_DECLARATIONS.map((segment) => (
            <Checkbox
              key={segment.id}
              id={`segment-${segment.id}`}
              checked={segments.includes(segment.id)}
              onChange={() => onToggleSegment(segment.id)}
              label={segment.label}
              labelProps={{ className: cn(KYC_TYPO.subtitle, 'font-medium') }}
              className="min-h-11"
            />
          ))}
        </div>
      </fieldset>

      {/* Declarations */}
      <ul className="mt-2 divide-y divide-gray-200 dark:divide-white/5">
        {mockDeclarations.map((declaration) => {
          const isAccepted = accepted.includes(declaration.id);
          const isExpanded = expanded === declaration.id;

          return (
            <li key={declaration.id} className="py-2.5">
              <div className="flex items-start gap-2">
                <Checkbox
                  id={`declaration-${declaration.id}`}
                  checked={isAccepted}
                  onChange={(checked) => onToggle(declaration.id, checked)}
                  className="w-full items-start"
                  boxClassName="mt-0.5"
                  label={
                    <span>
                      {declaration.text}
                      {declaration.linkLabel && (
                        <span className="ml-1 text-brand-500 underline">{declaration.linkLabel}</span>
                      )}
                      {declaration.required && (
                        <span className="ml-1 text-brandRed-loss" aria-hidden="true">
                          *
                        </span>
                      )}
                    </span>
                  }
                  labelProps={{ className: KYC_TYPO.body }}
                />

                {declaration.detail && (
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : declaration.id)}
                    aria-expanded={isExpanded}
                    className="shrink-0 rounded-full p-1 text-gray-500 transition-colors duration-200 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-homepage-softGray dark:hover:text-white"
                  >
                    <ChevronDown
                      className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      {isExpanded ? 'Hide details' : 'Show details'} for {declaration.text}
                    </span>
                  </button>
                )}
              </div>

              {/* Settlement period sits inside the running-account declaration */}
              {declaration.control === 'settlement' && isAccepted && (
                <div className="mt-1.5 pl-6">
                  <label htmlFor="running-account-period" className="sr-only">
                    Running account settlement period
                  </label>
                  <select
                    id="running-account-period"
                    value={settlement || RUNNING_ACCOUNT_SETTLEMENT[0]}
                    onChange={(event) => onSettlementChange(event.target.value)}
                    className="min-h-11 rounded-lg border border-transparent bg-transparent py-0 pl-0 pr-6 font-inter text-[14px] font-semibold text-brand-500 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {RUNNING_ACCOUNT_SETTLEMENT.map((option) => (
                      <option key={option} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {declaration.detail && isExpanded && (
                <div className="mt-1.5 pl-6">
                  <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-softGray">
                    {declaration.detail}
                  </Text>

                  {declaration.detailPoints && (
                    <ul className="mt-2 space-y-1.5">
                      {declaration.detailPoints.map((point, index) => (
                        <li key={point} className="flex gap-2">
                          <Text
                            as="span"
                            className={cn(KYC_TYPO.body, 'shrink-0 tabular-nums')}
                            color="text-brand-500"
                          >
                            {index + 1}.
                          </Text>
                          <Text
                            as="span"
                            className={KYC_TYPO.body}
                            color="text-gray-600 dark:text-homepage-softGray"
                          >
                            {point}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Text className={cn(KYC_TYPO.body, 'mt-2')} color="text-gray-500 dark:text-homepage-darkGrey">
        Items marked * are required. The rest are authorisations you can decline.
      </Text>
    </section>
  );
}
