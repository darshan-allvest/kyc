'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommonModal from '@/components/common/CommonModal';
import Button from '@/components/common/button/Button';
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
    <CommonModal
      open={open}
      onClose={() => close(onDecline)}
      title={mockRiskDisclosure.title}
      maxWidth="max-w-md"
      cardClassName="!bg-gradient-loss-glow !border-brandRed-loss/30 shadow-inset-loss"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            disabled={!acknowledged}
            // Labels stay on one line so both pills keep the same height.
            className="whitespace-nowrap text-[14px]"
            onClick={() => close(onAccept)}
          >
            Activate F&amp;O
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            weight="semibold"
            className="whitespace-nowrap text-[14px]"
            onClick={() => close(onDecline)}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brandRed-loss/15">
        <AlertTriangle className="size-5 text-brandRed-loss" aria-hidden="true" />
      </div>

      <Text className={KYC_TYPO.subtitle} color="text-homepage-lightWhite">
        {mockRiskDisclosure.summary}
      </Text>

      <ul className="mt-4 space-y-2">
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
        {mockRiskDisclosure.reference}
      </Text>

      <Checkbox
        checked={acknowledged}
        onChange={setAcknowledged}
        className="mt-4 w-full items-start"
        boxClassName="mt-0.5"
        label="I have read and understood the Risk Disclosure Document for derivatives"
        labelProps={{ className: KYC_TYPO.body }}
      />
    </CommonModal>
  );
}
