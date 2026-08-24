'use client';

import { Landmark, Plus } from 'lucide-react';
import CommonModal from '@/components/common/CommonModal';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycDetailCard from '@/components/kyc/KycDetailCard';
import { KYC_TYPO } from '@/constants/kycConstants';
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
    <CommonModal
      open={open}
      onClose={onAddNew}
      // A choice has to be made, so there is no silent dismiss.
      preventClose
      hideClose
      title="Confirm your bank details"
      maxWidth="max-w-md"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="text-[14px]"
            onClick={onUse}
          >
            Use this bank account
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            weight="semibold"
            leftIcon={Plus}
            className="text-[14px]"
            onClick={onAddNew}
          >
            Add new bank details
          </Button>
        </div>
      }
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-500/15">
        <Landmark className="size-5 text-brand-500" aria-hidden="true" />
      </span>

      <Text className={KYC_TYPO.subtitle} color="text-homepage-lightWhite">
        This is the bank account linked to your records. Payouts and refunds go
        here unless you add a different one.
      </Text>

      <KycDetailCard
        className="mt-4"
        items={[
          { label: 'Bank', value: bank.bankName },
          { label: 'Account number', value: maskAccountNumber(bank.accountNumber) },
          { label: 'IFSC', value: bank.ifsc },
          { label: 'Account type', value: bank.accountType },
          { label: 'Branch', value: bank.branch, span: true },
        ]}
      />
    </CommonModal>
  );
}
