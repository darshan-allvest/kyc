'use client';

import { ChevronRight, FileUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import { KYC_METHOD, KYC_TYPO } from '@/constants/kycConstants';

const OPTIONS = [
  {
    key: KYC_METHOD.UPLOAD,
    icon: FileUp,
    title: 'Upload documents yourself',
    description: 'Upload your identity and address documents manually.',
    cta: 'Upload Documents',
  },
  {
    key: KYC_METHOD.DIGILOCKER,
    icon: ShieldCheck,
    title: 'Fetch from DigiLocker',
    description: 'Securely retrieve your government documents from DigiLocker.',
    cta: 'Continue with DigiLocker',
  },
];

/**
 * KycMethodSelection — Scenario B choice between manual upload and DigiLocker.
 *
 * Built on real radio inputs wrapped in labels, so arrow-key selection, focus
 * and screen-reader semantics come from the platform rather than ARIA roles.
 *
 * @param {string} selected     — currently selected KYC_METHOD
 * @param {Function} onSelect   — (method) => void
 * @param {Function} onContinue — (method) => void
 */
export default function KycMethodSelection({ selected, onSelect, onContinue, loadingMethod }) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Choose how to complete your KYC</legend>

      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = selected === option.key;

        return (
          <div
            key={option.key}
            // The whole tile is clickable: selecting a method is the decision,
            // so a pointer click also moves the flow on. `event.detail > 0`
            // keeps keyboard users (arrow keys between radios) from being
            // advanced before they have chosen.
            onClick={(event) => {
              onSelect(option.key);
              if (event.detail > 0) onContinue(option.key);
            }}
            className={cn(
              'cursor-pointer rounded-xl border transition-colors',
              isSelected
                ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-shade'
                : 'border-gray-200 hover:border-brand-500/60 dark:border-white/10 dark:bg-black/20'
            )}
          >
            <label className="flex cursor-pointer items-start gap-3 p-4 pb-2 has-[:focus-visible]:rounded-xl has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500">
              <input
                type="radio"
                name="kycMethod"
                value={option.key}
                checked={isSelected}
                onChange={() => onSelect(option.key)}
                className="sr-only"
              />

              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  isSelected
                    ? 'bg-brand-500 text-black'
                    : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-white'
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <Heading as="h2" size="sm" font="sora" weight="semibold" className={KYC_TYPO.subtitle}>
                    {option.title}
                  </Heading>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                      isSelected ? 'border-brand-500' : 'border-gray-300 dark:border-white/25'
                    )}
                  >
                    {isSelected && <span className="size-2 rounded-full bg-brand-500" />}
                  </span>
                </span>

                <Text
                  className={cn(KYC_TYPO.body, 'mt-1')}
                  color="text-gray-600 dark:text-homepage-softGray"
                >
                  {option.description}
                </Text>
              </span>
            </label>

            <div className="pb-4 pl-16 pr-4">
              <Button
                size="sm"
                variant={isSelected ? 'primary' : 'outline'}
                weight="semibold"
                rightIcon={ChevronRight}
                loading={loadingMethod === option.key}
                className="min-h-11 text-[12px]"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(option.key);
                  onContinue(option.key);
                }}
              >
                {option.cta}
              </Button>
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
