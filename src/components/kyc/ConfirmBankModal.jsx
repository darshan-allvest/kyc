'use client';

import { Landmark, Plus } from 'lucide-react';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
import KycDetailCard from '@/components/kyc/KycDetailCard';
import { maskAccountNumber } from '@/lib/kyc/kycFormatters';

/**
 * ConfirmBankModal — opens on the Bank step with the account already on record,
 * so the applicant either reuses it or enters a different one.
 *
 * @param {boolean} open
 * @param {object} bank      — the account we hold on record
 * @param {Function} onUse   — reuse it; the form is pre-filled from this record
 * @param {Function} onAddNew — enter a different account by hand
 */
export default function ConfirmBankModal({ open, bank, onUse, onAddNew }) {
  if (!bank) return null;

  return (
    <KycModal
      open={open}
      onClose={onAddNew}
      // A choice has to be made, so there is no silent dismiss.
      preventClose
      icon={Landmark}
      title="Confirm your bank details"
      description="This is the bank account linked to your records. Payouts and refunds go here unless you add a different one."
      footer={
        <KycModalActions
          stacked
          primary="Use this bank account"
          onPrimary={onUse}
          secondary="Add new bank details"
          onSecondary={onAddNew}
          secondaryProps={{ leftIcon: Plus }}
        />
      }
    >
      <KycDetailCard
        items={[
          { label: 'Bank', value: bank.bankName },
          { label: 'Account number', value: maskAccountNumber(bank.accountNumber) },
          { label: 'IFSC', value: bank.ifsc },
          { label: 'Account type', value: bank.accountType },
          { label: 'Branch', value: bank.branch, span: true },
        ]}
      />
    </KycModal>
  );
}
