'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
import KycTextField from '@/components/kyc/KycTextField';
import { mockSebiActionDisclosure } from '@/services/kyc/mockKycData';

/**
 * SebiActionModal — collects the disclosure behind an un-ticked "I do not have
 * any Past Actions from SEBI/Exchange in last 3 years". Confirming records the
 * details so the application can carry on; Close withdraws the admission.
 *
 * Draft state lives here, so the caller remounts this with a `key` tied to
 * `open` to start each visit from the details already on record.
 *
 * @param {boolean}  open
 * @param {string}   [value]    — details already captured, prefilled on reopen
 * @param {Function} onConfirm  — (details) => void
 * @param {Function} onClose    — dismissed without disclosing
 */
export default function SebiActionModal({ open, value = '', onConfirm, onClose }) {
  const [details, setDetails] = useState(value);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmed = details.trim();
    if (!trimmed) {
      setError(mockSebiActionDisclosure.error);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <KycModal
      open={open}
      onClose={onClose}
      icon={AlertTriangle}
      tone="warning"
      title={mockSebiActionDisclosure.title}
      description={mockSebiActionDisclosure.message}
      footer={
        <KycModalActions
          secondary="Close"
          onSecondary={onClose}
          primary="Confirm"
          onPrimary={handleConfirm}
        />
      }
    >
      <KycTextField
        id="sebi-action-details"
        aria-label="SEBI action details"
        placeholder={mockSebiActionDisclosure.placeholder}
        value={details}
        error={error}
        onChange={(event) => {
          setDetails(event.target.value);
          if (error) setError('');
        }}
      />
    </KycModal>
  );
}
