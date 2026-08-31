'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
import Text from '@/components/common/Text';
import Checkbox from '@/components/common/Checkbox';
import { KYC_TYPO } from '@/constants/kycConstants';
import { mockRiskDisclosure } from '@/services/kyc/mockKycData';

/**
 * RiskDisclosureModal — shown right after F&O is activated. Derivatives carry
 * loss risk the applicant has to acknowledge before the segment is confirmed.
 *
 * @param {boolean} open
 * @param {Function} onAccept  — acknowledged; F&O stays activated
 * @param {Function} onDecline — backs the activation out again
 */
export default function RiskDisclosureModal({ open, onAccept, onDecline }) {
  const [acknowledged, setAcknowledged] = useState(false);

  const close = (handler) => {
    setAcknowledged(false);
    handler();
  };

  return (
    <KycModal
      open={open}
      onClose={() => close(onDecline)}
      icon={AlertTriangle}
      tone="loss"
      title={mockRiskDisclosure.title}
      description={mockRiskDisclosure.summary}
      footer={
        <KycModalActions
          secondary="Cancel"
          onSecondary={() => close(onDecline)}
          primary="Activate F&O"
          onPrimary={() => close(onAccept)}
          primaryProps={{ disabled: !acknowledged }}
        />
      }
    >
      <ul className="space-y-2">
        {mockRiskDisclosure.points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brandRed-loss"
            />
            <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
              {point}
            </Text>
          </li>
        ))}
      </ul>

      <Text className={cn(KYC_TYPO.body, 'mt-4')} color="text-homepage-darkGrey">
        {mockRiskDisclosure.reference.prefix}
        <a
          href={mockRiskDisclosure.reference.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-500 underline underline-offset-2 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {mockRiskDisclosure.reference.linkLabel}
        </a>
        {mockRiskDisclosure.reference.suffix}
      </Text>

      <Checkbox
        checked={acknowledged}
        onChange={setAcknowledged}
        className="mt-4 w-full items-start"
        boxClassName="mt-0.5"
        label={mockRiskDisclosure.acknowledgement}
        labelProps={{ className: KYC_TYPO.body }}
      />
    </KycModal>
  );
}
