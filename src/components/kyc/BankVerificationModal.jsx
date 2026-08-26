'use client';

import { CheckCircle2, FileText } from 'lucide-react';
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
  // Income proof — asked for here when F&O is on and the statement was not
  // already pulled on the payment screen.
  needsStatement = false,
  statement = null,
  fetchingStatement = false,
  statementError = '',
  onFetchStatement,
  onSkipStatement,
}) {
  const isBusy = state === BANK_MODAL_STATE.VERIFYING;
  const isVerified =
    state === BANK_MODAL_STATE.PAID || state === BANK_MODAL_STATE.SUCCESS;
  // Only ask while the statement is still missing.
  const askForStatement = isVerified && needsStatement && !statement;

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
        askForStatement ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="authSubmit"
              size="lg"
              fullWidth
              weight="bold"
              leftIcon={FileText}
              loading={fetchingStatement}
              className="text-[14px]"
              onClick={onFetchStatement}
            >
              {fetchingStatement ? 'Fetching statement...' : 'Fetch bank statement'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              weight="semibold"
              className="text-[14px]"
              onClick={onSkipStatement}
            >
              Skip, do it later
            </Button>
          </div>
        ) : isVerified ? (
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

      {isVerified && statement && (
        <KycDetailCard
          className="mt-4"
          title="Income proof"
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 px-2.5 py-1">
              <CheckCircle2 className="size-3.5 text-brand-500" aria-hidden="true" />
              <Text as="span" className={KYC_TYPO.body} color="text-brand-500">
                Fetched
              </Text>
            </span>
          }
          items={[
            { label: 'Document', value: statement.incomeProof },
            { label: 'Bank', value: statement.bankName },
            { label: 'Period', value: statement.period },
            { label: 'Average balance', value: statement.averageBalance },
          ]}
        />
      )}

      {askForStatement && (
        <Text className={cn(KYC_TYPO.body, 'mt-4')} color="text-homepage-darkGrey">
          You activated F&amp;O, which needs a bank statement as income proof. Fetch it
          now from the account above, or skip and add it later from your profile.
        </Text>
      )}

      {statementError && (
        <KycAlert tone="error" className="mt-3">
          {statementError}
        </KycAlert>
      )}

      {state === BANK_MODAL_STATE.ERROR && <KycAlert tone="error">{error}</KycAlert>}
    </CommonModal>
  );
}
