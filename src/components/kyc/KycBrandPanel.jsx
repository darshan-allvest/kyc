'use client';

import Image from 'next/image';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Heading from '@/components/common/Heading';
import Text from '@/components/common/Text';
import KycStepper from '@/components/kyc/KycStepper';
import { KYC_LOGO_SRC, KYC_TYPO } from '@/constants/kycConstants';

const BENEFITS = [
  'Zero account opening charges',
  'Invest in stocks, F&O, mutual funds and more',
  'Paperless verification — done in minutes',
];

/**
 * KycBrandPanel — the left pane on large screens.
 *
 * Mirrors the reference app's auth layout: brand mark on a soft green/black
 * radial wash, a short value proposition, and the vertical progress rail so the
 * user always knows where they are.
 */
export default function KycBrandPanel({ currentStep }) {
  return (
    <aside
      // Pinned to the viewport rather than stretched to the content: on long
      // screens (Confirm Details) a content-height panel pushed the progress
      // rail below the fold.
      className={cn(
        'relative hidden shrink-0 flex-col overflow-y-auto border-r border-homepage-borderColor px-10 py-10',
        'lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:w-[38%] xl:w-[34%]'
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(137,166,107,0.35) -20%, #0d0d0d 60%)',
      }}
    >
      <Image
        src="/assets/logo/background_logo.svg"
        alt=""
        aria-hidden="true"
        width={537}
        height={569}
        className="pointer-events-none absolute -bottom-10 -right-16 w-[320px] opacity-[0.06]"
      />

      <div className="relative">
        <Image
          src={KYC_LOGO_SRC}
          alt="Allvest"
          width={256}
          height={59}
          priority
          className="h-7 w-auto"
        />

        <Heading
          as="p"
          size="base"
          font="sora"
          weight="semibold"
          className="mt-8 text-[16px] md:text-[16px]"
        >
          Open your investment account in minutes
        </Heading>

        <ul className="mt-4 space-y-2.5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[6px] size-1.5 shrink-0 rounded-full bg-brand-500"
              />
              <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
                {benefit}
              </Text>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-8">
        <KycStepper currentStep={currentStep} orientation="vertical" />
      </div>

      <div className="relative mt-auto flex items-start gap-2 pt-8">
        <Lock className="mt-0.5 size-3.5 shrink-0 text-brand-500" aria-hidden="true" />
        <Text className={KYC_TYPO.body} color="text-homepage-darkGrey">
          Your details stay in this browser. This is a demo built on dummy data —
          nothing is submitted anywhere.
        </Text>
      </div>
    </aside>
  );
}
