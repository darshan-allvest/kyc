'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import { KYC_LOGO_SRC, KYC_TYPO } from '@/constants/kycConstants';

/**
 * DocumentCover — the closed state of the final document: a page-shaped cover
 * sheet in the app's theme. Deliberately carries no data; the applicant's
 * details live on the pages behind it.
 */
export default function DocumentCover({ className }) {
  return (
    <div
      className={cn(
        'relative isolate mx-auto overflow-hidden rounded-xl border border-white/10 bg-black',
        'flex aspect-[1/1.3] max-h-[26rem] flex-col items-center justify-center px-6 py-8 text-center sm:px-10',
        className
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(153,204,0,0.16) 0%, transparent 55%),' +
          'radial-gradient(circle at 50% 100%, rgba(115,113,252,0.14) 0%, transparent 55%)',
      }}
    >
      {/* Brand watermark */}
      <Image
        src="/assets/logo/background_logo.svg"
        alt=""
        aria-hidden="true"
        width={537}
        height={569}
        className="pointer-events-none absolute inset-0 -z-10 m-auto w-[70%] opacity-[0.05]"
      />

      <div>
        <Image
          src={KYC_LOGO_SRC}
          alt="Allvest"
          width={256}
          height={59}
          className="mx-auto h-7 w-auto"
        />

        <span
          aria-hidden="true"
          className="mx-auto my-6 block h-px w-16 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        />

        <Heading
          as="h2"
          size="sm"
          font="sora"
          weight="bold"
          align="center"
          className="text-[16px] text-white"
        >
          Account opening form
        </Heading>
        <Text
          className={cn(KYC_TYPO.body, 'mt-1.5')}
          align="center"
          color="text-homepage-softGray"
        >
          Equity &amp; Demat account
        </Text>

        <span
          aria-hidden="true"
          className="mx-auto mt-5 block h-px w-16 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        />
      </div>

      <Text
        className={cn(KYC_TYPO.body, 'absolute inset-x-0 bottom-6')}
        align="center"
        color="text-homepage-darkGrey"
      >
        Allvest Securities · Demo document
      </Text>
    </div>
  );
}
