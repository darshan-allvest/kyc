'use client';

import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_TYPO } from '@/constants/kycConstants';

/**
 * ExternalPortfolioCard — offered once KYC is complete: pulls the applicant's
 * holdings held elsewhere through the CAMS account aggregator.
 *
 * The redirect URL is fetched from our own /api/external-portfolio route, which
 * holds the CAMS bearer token server-side. This is the one part of the demo
 * that talks to a real service.
 */
export default function ExternalPortfolioCard({ className }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState(null);

  const handleFetch = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/external-portfolio', { cache: 'no-store' });
      const result = await response.json();

      if (!result.success || !result.redirectionUrl) {
        setError(result.error || 'CAMS did not return a consent link. Please try again.');
        return;
      }

      setLink(result);
      // Best-effort auto-open; blocked pop-ups fall back to the manual link.
      window.open(result.redirectionUrl, '_blank', 'noopener,noreferrer');
    } catch (fetchError) {
      setError(fetchError?.message || 'Could not reach the aggregator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 p-4 dark:border-homepage-borderColor dark:bg-homepage-cardBgDark',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-12">
          <LineChart className="size-[18px] text-brand-500" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Heading as="h2" size="sm" font="sora" weight="semibold" className={KYC_TYPO.subtitle}>
            Fetch external portfolio
          </Heading>
          <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-gray-600 dark:text-homepage-softGray">
            Bring in the mutual funds and holdings you hold elsewhere through the
            CAMS account aggregator. You will approve the consent on the CAMS
            screen that opens.
          </Text>
        </div>
      </div>

      {link && (
        <div className="mt-3 rounded-lg border border-brand-500/40 bg-brand-shade p-3">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
            <Text as="span" className={cn(KYC_TYPO.body, 'font-semibold')} color="text-brand-500">
              Consent link ready
            </Text>
          </span>
          <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-gray-600 dark:text-homepage-softGray">
            If the CAMS window did not open, use the link below.
          </Text>
          <a
            href={link.redirectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[12px] font-semibold text-brand-500 underline underline-offset-2 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Open CAMS consent
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
          {link.consentHandle && (
            <Text className={cn(KYC_TYPO.body, 'mt-2 break-all')} color="text-gray-500 dark:text-homepage-darkGrey">
              Consent handle: {link.consentHandle}
            </Text>
          )}
        </div>
      )}

      {error && (
        <KycAlert tone="error" className="mt-3">
          {error}
        </KycAlert>
      )}

      <Button
        variant={link ? 'outline' : 'authSubmit'}
        size="lg"
        fullWidth
        weight={link ? 'semibold' : 'bold'}
        loading={loading}
        className="mt-3 text-[14px]"
        onClick={handleFetch}
      >
        {loading
          ? 'Contacting CAMS...'
          : link
            ? 'Fetch again'
            : 'Fetch external portfolio'}
      </Button>
    </section>
  );
}
