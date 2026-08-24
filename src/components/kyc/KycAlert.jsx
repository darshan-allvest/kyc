'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';

const TONES = {
  error: {
    icon: AlertTriangle,
    role: 'alert',
    wrapper:
      'border-brandRed-loss/40 bg-brandRed-50 dark:border-brandRed-loss/40 dark:bg-brandRed-950',
    iconColor: 'text-brandRed-loss',
    label: 'Error',
  },
  success: {
    icon: CheckCircle2,
    role: 'status',
    wrapper: 'border-brand-500/40 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-shade',
    iconColor: 'text-brand-500',
    label: 'Success',
  },
  info: {
    icon: Info,
    role: 'status',
    wrapper:
      'border-gray-200 bg-gray-50 dark:border-homepage-borderColor dark:bg-homepage-cardBgDark',
    iconColor: 'text-homepage-purple',
    label: 'Note',
  },
};

/**
 * KycAlert — inline status message.
 *
 * State is carried by an icon and a visually-hidden text label as well as
 * colour, so error/success is never colour-only.
 *
 * @param {'error'|'success'|'info'} tone
 * @param {string} title    — optional bold line
 * @param {React.ReactNode} children — message body
 */
export default function KycAlert({ tone = 'info', title, children, className }) {
  const config = TONES[tone] ?? TONES.info;
  const Icon = config.icon;

  return (
    <div
      role={config.role}
      className={cn('flex items-start gap-2.5 rounded-lg border p-3', config.wrapper, className)}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', config.iconColor)} aria-hidden="true" />
      <div className="min-w-0">
        <span className="sr-only">{config.label}: </span>
        {title && (
          <Text
            className={cn(KYC_TYPO.subtitle, 'font-semibold')}
            color="text-gray-900 dark:text-white"
          >
            {title}
          </Text>
        )}
        {children && (
          <Text className={cn(KYC_TYPO.body, title && 'mt-0.5')} color="text-gray-700 dark:text-homepage-lightWhite">
            {children}
          </Text>
        )}
      </div>
    </div>
  );
}
