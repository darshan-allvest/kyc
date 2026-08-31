'use client';

import { AlertTriangle, CheckCircle2, FileText, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import KycModal, { KycModalActions } from '@/components/kyc/KycModal';
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

// Header per state — the shell is the same everywhere, only the accent, title
// and lead copy change.
const HEADERS = {
  [BANK_MODAL_STATE.VERIFYING]: {
    icon: Landmark,
    tone: 'brand',
    title: 'Verifying your bank account',
    description: '₹1 is being deposited into the account to confirm the details. It is refunded automatically.',
  },
  [BANK_MODAL_STATE.PAID]: {
    icon: CheckCircle2,
    tone: 'brand',
    title: 'Payment received',
  },
  [BANK_MODAL_STATE.SUCCESS]: {
    icon: CheckCircle2,
    tone: 'brand',
    title: 'Bank account verified',
    description: 'The account below is confirmed and linked to your application.',
  },
  [BANK_MODAL_STATE.ERROR]: {
    icon: AlertTriangle,
    tone: 'loss',
    title: 'Bank verification failed',
  },
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
  // Only ask on the SUCCESS (bank-verified) screen — not on the PAID screen.
  // PAID is a payment confirmation step; SUCCESS is where the account is confirmed.
  const askForStatement = state === BANK_MODAL_STATE.SUCCESS && needsStatement && !statement;
  const header = HEADERS[state] ?? HEADERS[BANK_MODAL_STATE.VERIFYING];

  const footer = askForStatement ? (
    <KycModalActions
      stacked
      primary={fetchingStatement ? 'Fetching statement...' : 'Fetch bank statement'}
      onPrimary={onFetchStatement}
      primaryProps={{ leftIcon: FileText, loading: fetchingStatement }}
      secondary="Skip, do it later"
      onSecondary={onSkipStatement}
    />
  ) : isVerified ? (
    <KycModalActions stacked primary="Continue" onPrimary={onContinue} />
  ) : state === BANK_MODAL_STATE.ERROR ? (
    <KycModalActions
      secondary="Edit details"
      onSecondary={onClose}
      primary="Try again"
      onPrimary={onRetry}
    />
  ) : null;

  return (
    <KycModal
      open={open}
      onClose={onClose}
      preventClose={isBusy}
      icon={header.icon}
      tone={header.tone}
      title={header.title}
      description={header.description}
      footer={footer}
    >
      {state === BANK_MODAL_STATE.VERIFYING && (
        <div role="status" aria-live="polite">
          <div className="flex items-center justify-center gap-3">
            <Spinner className="size-5 text-brand-500" />
            <Text className={KYC_TYPO.subtitle} color="text-homepage-lightWhite">
              Verifying bank account...
            </Text>
          </div>
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
        <div className="flex flex-col items-center text-center">
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

      {state === BANK_MODAL_STATE.SUCCESS && bank && (
        <KycDetailCard
          items={[
            { label: 'Bank', value: bank.bankName },
            { label: 'Account number', value: maskAccountNumber(bank.accountNumber) },
            { label: 'IFSC', value: bank.ifsc },
            { label: 'Account type', value: bank.accountType },
          ]}
        />
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
    </KycModal>
  );
}
