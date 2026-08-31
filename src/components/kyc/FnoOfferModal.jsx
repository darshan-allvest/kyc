'use client';

import { CheckCircle2 } from 'lucide-react';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
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
 * @param {Function} onClose     — dismissed without choosing; stays put
 */
export default function FnoOfferModal({ open, onActivate, onSkip, onClose }) {
  return (
    <KycModal
      open={open}
      onClose={onClose ?? onSkip}
      icon={CheckCircle2}
      title={mockFnoOffer.title}
      description="Add Futures & Options to the same account — you can always enable it later from your profile."
      footer={
        <KycModalActions
          secondary="Do it later"
          onSecondary={onSkip}
          primary="Activate F&O"
          onPrimary={onActivate}
        />
      }
    >
      <ul className="space-y-2">
        {mockFnoOffer.points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
            <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
              {point}
            </Text>
          </li>
        ))}
      </ul>
    </KycModal>
  );
}
