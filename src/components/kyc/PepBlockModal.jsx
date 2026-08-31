'use client';

import { AlertTriangle } from 'lucide-react';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
import { mockPepBlock } from '@/services/kyc/mockKycData';

/**
 * PepBlockModal — shown the moment the applicant un-ticks "I am not a
 * Politically Exposed Person". PEP accounts cannot be opened online, so the
 * choice is to withdraw the admission (Close) or acknowledge it and wait on a
 * relationship manager (Confirm).
 *
 * @param {boolean}  open
 * @param {Function} onConfirm — acknowledges the block; the box stays un-ticked
 * @param {Function} onClose   — withdraws the admission, re-ticking the box
 */
export default function PepBlockModal({ open, onConfirm, onClose }) {
  return (
    <KycModal
      open={open}
      onClose={onClose}
      icon={AlertTriangle}
      tone="warning"
      title={mockPepBlock.title}
      description={mockPepBlock.message}
      note={mockPepBlock.note}
      footer={
        <KycModalActions
          secondary="Close"
          onSecondary={onClose}
          primary="Confirm"
          onPrimary={onConfirm}
        />
      }
    />
  );
}
