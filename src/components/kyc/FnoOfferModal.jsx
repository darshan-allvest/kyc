'use client';

import { CheckCircle2 } from 'lucide-react';
import CommonModal from '@/components/common/CommonModal';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';
import { mockFnoOffer } from '@/services/kyc/mockKycData';

/**
 * FnoOfferModal — optional F&O activation offer. Skipping it never blocks the
 * flow.
 *
 * @param {boolean} open
 * @param {Function} onActivate  — user chose "Activate F&O"
 * @param {Function} onSkip      — user chose "Do it later"
 */
export default function FnoOfferModal({ open, onActivate, onSkip }) {
  return (
    <CommonModal
      open={open}
      onClose={onSkip}
      title={mockFnoOffer.title}
      maxWidth="max-w-md"
      cardClassName="!bg-gradient-profit-glow !border-brand-500/30 shadow-inset-profit"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="whitespace-nowrap text-[14px]"
            onClick={onActivate}
          >
            Activate F&amp;O
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            weight="semibold"
            className="whitespace-nowrap text-[14px]"
            onClick={onSkip}
          >
            Do it later
          </Button>
        </div>
      }
    >
      <Text className={KYC_TYPO.subtitle} color="text-homepage-lightWhite">
        Add Futures &amp; Options to the same account — you can always enable it
        later from your profile.
      </Text>

      <ul className="mt-4 space-y-2">
        {mockFnoOffer.points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
            <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
              {point}
            </Text>
          </li>
        ))}
      </ul>
    </CommonModal>
  );
}
