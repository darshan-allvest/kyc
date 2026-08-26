'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycTextField from '@/components/kyc/KycTextField';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import BankVerificationModal, {
  BANK_MODAL_STATE,
} from '@/components/kyc/BankVerificationModal';
import ConfirmBankModal from '@/components/kyc/ConfirmBankModal';
import {
  ACCOUNT_NUMBER_REGEX,
  ACCOUNT_TYPES,
  IFSC_REGEX,
  KYC_STEP,
  KYC_TYPO,
} from '@/constants/kycConstants';
import {
  fetchBankStatement,
  payAccountOpeningFee,
  verifyBankAccount,
} from '@/services/kyc/mockKycService';
import { mockPayment, resolveAccount } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const EMPTY_FORM = {
  accountNumber: '',
  confirmAccountNumber: '',
  ifsc: '',
  accountType: ACCOUNT_TYPES[0],
};

/**
 * Step 10 — bank details form plus the ₹1 verification modal.
 */
export default function BankDetailsStep() {
  const {
    goToStep,
    updateFlow,
    bankDetails,
    submittedBankDetails,
    paymentMethod,
    segments,
    fnoSelected,
    bankStatement,
    accountId,
    mobileNumber,
    account,
  } = useKycFlow();
  // The fetched record is what the user is confirming; fall back to the demo
  // account when this screen is reached without a fetch (forced scenarios).
  const demoBank =
    bankDetails ??
    resolveAccount({ accountId, mobile: mobileNumber, email: account?.email }).bankDetails;
  const prefilledForm = demoBank
    ? {
        accountNumber: demoBank.accountNumber,
        confirmAccountNumber: demoBank.accountNumber,
        ifsc: demoBank.ifsc,
        accountType: demoBank.accountType || ACCOUNT_TYPES[0],
      }
    : EMPTY_FORM;

  // Coming back shows the account that was already submitted.
  const [form, setForm] = useState(() =>
    submittedBankDetails?.accountNumber
      ? {
          accountNumber: submittedBankDetails.accountNumber,
          confirmAccountNumber: submittedBankDetails.accountNumber,
          ifsc: submittedBankDetails.ifsc,
          accountType: submittedBankDetails.accountType || ACCOUNT_TYPES[0],
        }
      : EMPTY_FORM
  );
  // Paying by UPI means the payout account is the one already on record, so
  // this screen has nothing to ask: it verifies that account straight away and
  // only ever shows the modal. The form appears only if that check fails.
  const paysFromBank = paymentMethod === 'BANK';
  const [skipForm, setSkipForm] = useState(
    !paysFromBank && Boolean(demoBank) && !submittedBankDetails
  );
  // Offer the account on record first; the applicant reuses it or adds another.
  // Skipped only when they have already been through this screen.
  const [showBankChoice, setShowBankChoice] = useState(
    Boolean(demoBank) && !submittedBankDetails && paysFromBank
  );
  const [errors, setErrors] = useState({});
  const [modalState, setModalState] = useState(null);
  const [modalError, setModalError] = useState('');
  const [verifiedBank, setVerifiedBank] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  // Paying by UPI skips the payment screen's statement fetch, so F&O applicants
  // are asked for the income proof here, right after the account is verified.
  const [statement, setStatement] = useState(bankStatement);
  const [fetchingStatement, setFetchingStatement] = useState(false);
  const [statementError, setStatementError] = useState('');
  const needsStatement = Boolean(
    (fnoSelected || segments?.includes('fno')) && !statement
  );

  const handleFetchStatement = async () => {
    setStatementError('');
    setFetchingStatement(true);
    const result = await fetchBankStatement(form, {
      accountId,
      mobile: mobileNumber,
      email: account?.email,
    });
    setFetchingStatement(false);

    if (!result.success) {
      setStatementError(result.error);
      return;
    }

    setStatement(result.data);
    updateFlow({ bankStatement: result.data });
  };

  const useRecordedBank = () => {
    setForm(prefilledForm);
    setErrors({});
    setShowBankChoice(false);
  };

  const addNewBank = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowBankChoice(false);
  };

  const setField = (key) => (event) => {
    const raw = event.target.value;
    const value =
      key === 'ifsc'
        ? raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
        : raw.replace(/\D/g, '').slice(0, 18);

    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.accountNumber) next.accountNumber = 'Enter your account number.';
    else if (!ACCOUNT_NUMBER_REGEX.test(form.accountNumber))
      next.accountNumber = 'Account number must be 9-18 digits.';

    if (!form.confirmAccountNumber) next.confirmAccountNumber = 'Re-enter your account number.';
    else if (form.accountNumber !== form.confirmAccountNumber)
      next.confirmAccountNumber = 'Account numbers do not match.';

    if (!form.ifsc) next.ifsc = 'Enter the IFSC code.';
    else if (!IFSC_REGEX.test(form.ifsc)) next.ifsc = 'Enter a valid IFSC (e.g. TEST0001234).';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setModalError('');
    // No extra confirm step — Submit starts the ₹1 check straight away.
    runVerification();
  };

  const runVerification = useCallback(
    async (details = form) => {
    setModalState(BANK_MODAL_STATE.VERIFYING);
    const result = await verifyBankAccount(details, {
      accountId,
      mobile: mobileNumber,
      email: account?.email,
    });

    if (!result.success) {
      setModalError(result.error);
      setModalState(BANK_MODAL_STATE.ERROR);
      return;
    }

    setVerifiedBank(result.data);

    if (!paysFromBank) {
      setModalState(BANK_MODAL_STATE.SUCCESS);
      return;
    }

    const paid = await payAccountOpeningFee({ method: 'BANK', bank: result.data.bankName });
    if (!paid.success) {
      setModalError(paid.error);
      setModalState(BANK_MODAL_STATE.ERROR);
      return;
    }

    setPaymentResult({ ...paid.data, currency: mockPayment.currency });
    setModalState(BANK_MODAL_STATE.PAID);
    },
    [form, paysFromBank, accountId, mobileNumber, account?.email]
  );

  // UPI path: verify the recorded account as soon as the screen opens, so the
  // applicant only ever sees the modal.
  useEffect(() => {
    if (!skipForm || modalState) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setForm(prefilledForm);
      runVerification(prefilledForm);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipForm]);

  const handleContinue = () => {
    updateFlow({
      submittedBankDetails: verifiedBank,
      bankVerified: true,
      ...(paymentResult ? { payment: paymentResult } : {}),
      ...(statement ? { bankStatement: statement } : {}),
    });
    setModalState(null);
    goToStep(KYC_STEP.NOMINEE);
  };

  // Skipping the income proof still carries on to the nominee screen.
  const handleSkipStatement = () => {
    setStatementError('');
    updateFlow({ bankStatement: null });
    handleContinue();
  };

  return (
    <>
      <KycLayout
        title={skipForm ? 'Confirming your bank account' : 'Add your bank details'}
        subtitle={
          skipForm
            ? 'We are verifying the account already on your KYC record.'
            : 'Payouts and refunds are sent to this account.'
        }
        showStepper
        currentStep={KYC_STEP.BANK_DETAILS}
        onBack={skipForm ? undefined : () => goToStep(KYC_STEP.PAYMENT)}
      >
        {skipForm ? (
          <div className="flex items-center gap-3 py-6" role="status" aria-live="polite">
            <Spinner className="size-5 text-brand-500" />
            <Text className={KYC_TYPO.subtitle} color="text-gray-700 dark:text-homepage-lightWhite">
              Checking {demoBank.bankName} ···{demoBank.accountNumber.slice(-4)}
            </Text>
          </div>
        ) : (
          <>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <KycTextField
            label="Account number"
            placeholder="Enter account number"
            inputMode="numeric"
            autoComplete="off"
            required
            value={form.accountNumber}
            error={errors.accountNumber}
            onChange={setField('accountNumber')}
          />

          <KycTextField
            label="Confirm account number"
            placeholder="Re-enter account number"
            inputMode="numeric"
            autoComplete="off"
            required
            value={form.confirmAccountNumber}
            error={errors.confirmAccountNumber}
            onChange={setField('confirmAccountNumber')}
          />

          <KycTextField
            label="IFSC code"
            placeholder="Enter IFSC code"
            autoComplete="off"
            spellCheck={false}
            required
            value={form.ifsc}
            error={errors.ifsc}
            className="uppercase"
            onChange={setField('ifsc')}
          />

          <fieldset>
            <legend className="mb-1.5">
              <Text as="span" className={KYC_TYPO.label} color="text-gray-700 dark:text-white">
                Account type
              </Text>
            </legend>
            <div className="flex gap-2">
              {ACCOUNT_TYPES.map((type) => {
                const isSelected = form.accountType === type;
                return (
                  <label
                    key={type}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 transition-colors',
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-shade'
                        : 'border-gray-200 dark:border-homepage-borderColor'
                    )}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={type}
                      checked={isSelected}
                      onChange={() => setForm((prev) => ({ ...prev, accountType: type }))}
                      className="size-4 accent-brand-500"
                    />
                    <Text as="span" className={KYC_TYPO.subtitle} weight={isSelected ? 'semibold' : 'normal'}>
                      {type}
                    </Text>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Button
            type="submit"
            variant="authSubmit"
            size="lg"
            fullWidth
            weight="bold"
            className="text-[14px]"
          >
            Submit
          </Button>
        </form>

        {/* A way back to the account on record, once the modal is closed. */}
        <button
          type="button"
          onClick={() => setShowBankChoice(true)}
          className="mt-3 inline-flex min-h-11 items-center rounded-full px-2 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Use the bank account on record
        </button>

        <KycDemoHint className="mt-3">
          {demoBank.accountNumber} · {demoBank.ifsc} — nothing is sent to a bank.
        </KycDemoHint>
          </>
        )}
      </KycLayout>

      <ConfirmBankModal
        open={showBankChoice}
        bank={demoBank}
        onUse={useRecordedBank}
        onAddNew={addNewBank}
      />

      <BankVerificationModal
        open={Boolean(modalState)}
        state={modalState}
        bank={verifiedBank || form}
        payment={paymentResult}
        error={modalError}
        onRetry={runVerification}
        onContinue={handleContinue}
        onClose={() => {
          setModalState(null);
          setSkipForm(false);
        }}
        needsStatement={needsStatement}
        statement={statement}
        fetchingStatement={fetchingStatement}
        statementError={statementError}
        onFetchStatement={handleFetchStatement}
        onSkipStatement={handleSkipStatement}
      />
    </>
  );
}
