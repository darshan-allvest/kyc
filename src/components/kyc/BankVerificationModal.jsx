'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommonModal from '@/components/common/CommonModal';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Spinner from '@/components/ui/Spinner';
import KycAlert from '@/components/kyc/KycAlert';
import KycDetailCard from '@/components/kyc/KycDetailCard';
import { KYC_TYPO } from '@/constants/kycConstants';
import { maskAccountNumber } from '@/lib/kyc/kycFormatters';

export const BANK_MODAL_STATE = {
  PAID: 'PAID',
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

/**
 * BankVerificationModal — the simulated ₹1 penny-drop check.
 *
 * @param {string} state   — BANK_MODAL_STATE value
 * @param {object} bank    — submitted bank details
 * @param {string} error   — failure message when state is ERROR
 */
export default function BankVerificationModal({
  open,
  state,
  bank,
  payment,
  error,
  onRetry,
  onContinue,
  onClose,
}) {
  const isBusy = state === BANK_MODAL_STATE.VERIFYING;

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      preventClose={isBusy}
      hideClose={isBusy}
      title={
        state === BANK_MODAL_STATE.PAID
          ? 'Payment received'
          : state === BANK_MODAL_STATE.SUCCESS
            ? 'Bank account verified'
            : 'Verifying your bank account'
      }
      maxWidth="max-w-md"
      footer={
        state === BANK_MODAL_STATE.PAID || state === BANK_MODAL_STATE.SUCCESS ? (
          <Button
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="text-[14px]"
            onClick={onContinue}
          >
            Continue
          </Button>
        ) : state === BANK_MODAL_STATE.ERROR ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="authSubmit"
              size="lg"
              fullWidth
              weight="bold"
              className="text-[14px]"
              onClick={onRetry}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              weight="semibold"
              className="text-[14px]"
              onClick={onClose}
            >
              Edit details
            </Button>
          </div>
        ) : null
      }
    >
      {state === BANK_MODAL_STATE.VERIFYING && (
        <div className="py-2" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <Spinner className="size-5 text-brand-500" />
            <Text className={KYC_TYPO.subtitle} color="text-homepage-lightWhite">
              Verifying bank account...
            </Text>
          </div>
          <Text className={cn(KYC_TYPO.body, 'mt-2')} color="text-homepage-darkGrey">
            &#8377;1 is being deposited into the account to confirm the details. It is
            refunded automatically.
          </Text>
          {bank && (
            <KycDetailCard
              className="mt-4"
              items={[
                { label: 'Account number', value: maskAccountNumber(bank.accountNumber) },
                { label: 'IFSC', value: bank.ifsc },
                { label: 'Account type', value: bank.accountType },
              ]}
            />
          )}
        </div>
      )}

      {state === BANK_MODAL_STATE.PAID && (
        <div className="flex flex-col items-center py-2 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-500/15">
            <CheckCircle2 className="size-7 text-brand-500" aria-hidden="true" />
          </span>
          <Text className={cn(KYC_TYPO.title, 'lining-nums tabular-nums')} color="text-white">
            {payment?.currency ?? '₹'}
            {payment?.amount ?? 1} paid
          </Text>
          <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-homepage-softGray">
            Ref {payment?.reference ?? '-'}
          </Text>
          <Text className={cn(KYC_TYPO.body, 'mt-3')} color="text-homepage-darkGrey">
            Debited from {maskAccountNumber(bank?.accountNumber)} — your bank account is
            verified.
          </Text>
        </div>
      )}

      {state === BANK_MODAL_STATE.SUCCESS && (
        <div className="py-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-brand-500" aria-hidden="true" />
            <Text className={KYC_TYPO.title} color="text-white">
              Bank account verified successfully
            </Text>
          </span>
          {bank && (
            <KycDetailCard
              className="mt-4"
              items={[
                { label: 'Bank', value: bank.bankName },
                { label: 'Account number', value: maskAccountNumber(bank.accountNumber) },
                { label: 'IFSC', value: bank.ifsc },
                { label: 'Account type', value: bank.accountType },
              ]}
            />
          )}
        </div>
      )}

      {state === BANK_MODAL_STATE.ERROR && <KycAlert tone="error">{error}</KycAlert>}
    </CommonModal>
  );
}
