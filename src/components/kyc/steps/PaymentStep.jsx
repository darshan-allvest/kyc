'use client';

import { useState } from 'react';
import { Building2, CheckCircle2, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import Heading from '@/components/common/Heading';
import Spinner from '@/components/ui/Spinner';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import KycDemoHint from '@/components/kyc/KycDemoHint';
import KycUpiQr from '@/components/kyc/KycUpiQr';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { payAccountOpeningFee } from '@/services/kyc/mockKycService';
import { mockPayment } from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const METHOD = { UPI: 'UPI', BANK: 'BANK' };

/**
 * Step — account opening payment. Two ways to pay: a UPI QR / app hand-off, or
 * net banking. Paying moves on to the bank step, where the payout account is
 * confirmed.
 */
export default function PaymentStep() {
  const { goToStep, updateFlow, paymentMethod, payment } = useKycFlow();

  // Coming back restores the method (and app) already chosen.
  const [method, setMethod] = useState(paymentMethod ?? METHOD.UPI);
  const [app, setApp] = useState(payment?.app ?? null);
  const [status, setStatus] = useState('idle'); // idle | paying | paid
  const [error, setError] = useState('');

  const pay = async (selectedApp = app) => {
    setError('');

    // Paying from a bank account happens on the next screen, once the account
    // is chosen — the ₹1 is debited from it there.
    if (method === METHOD.BANK) {
      updateFlow({ paymentMethod: METHOD.BANK });
      goToStep(KYC_STEP.BANK_DETAILS);
      return;
    }

    setStatus('paying');
    const result = await payAccountOpeningFee({ method, app: selectedApp });

    if (!result.success) {
      setStatus('idle');
      setError(result.error);
      return;
    }

    setStatus('paid');
    updateFlow({ payment: result.data, paymentMethod: METHOD.UPI });
  };

  if (status === 'paid') {
    return (
      <KycLayout showStepper currentStep={KYC_STEP.PAYMENT}>
        <div className="flex flex-col items-center py-2 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-500/15">
            <CheckCircle2 className="size-7 text-brand-500" aria-hidden="true" />
          </span>
          <Heading as="h1" size="base" font="sora" weight="semibold" className={cn(KYC_TYPO.title, 'md:text-[16px]')}>
            Payment received
          </Heading>
          <Text className={cn(KYC_TYPO.subtitle, 'mt-2')} color="text-gray-600 dark:text-homepage-softGray">
            {mockPayment.currency}
            {mockPayment.total} paid · Ref PAY-TEST-58120
          </Text>
        </div>

        <Button
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          className="mt-5 text-[14px]"
          onClick={() => goToStep(KYC_STEP.BANK_DETAILS)}
        >
          Continue
        </Button>
      </KycLayout>
    );
  }

  return (
    <KycLayout
      title={`Pay ${mockPayment.currency}${mockPayment.total} to continue`}
      subtitle={`A one-time ${mockPayment.currency}${mockPayment.total} payment confirms the account you pay from. ${mockPayment.note}`}
      showStepper
      currentStep={KYC_STEP.PAYMENT}
      maxWidth="max-w-[30rem]"
      onBack={status === 'paying' ? undefined : () => goToStep(KYC_STEP.CONFIRM_DETAILS)}
    >
      {/* Amount */}
      <section className="rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20">
        {mockPayment.breakdown.map((line) => (
          <div key={line.label} className="flex items-center justify-between gap-3 py-1">
            <Text className={KYC_TYPO.body} color="text-gray-600 dark:text-homepage-softGray">
              {line.label}
            </Text>
            <Text className={cn(KYC_TYPO.body, 'lining-nums tabular-nums')}>
              {mockPayment.currency}
              {line.amount}
            </Text>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-gray-200 pt-2 dark:border-white/10">
          <Text className={cn(KYC_TYPO.subtitle, 'font-semibold')}>Total payable</Text>
          <Text className={cn(KYC_TYPO.title, 'lining-nums tabular-nums')} color="text-brand-500">
            {mockPayment.currency}
            {mockPayment.total}
          </Text>
        </div>
        {mockPayment.note && (
          <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-gray-500 dark:text-homepage-darkGrey">
            {mockPayment.note}
          </Text>
        )}
      </section>

      {/* Method picker */}
      <fieldset className="mt-4">
        <legend className="sr-only">Choose a payment method</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: METHOD.UPI, label: 'UPI / Scan & pay', icon: QrCode },
            { id: METHOD.BANK, label: 'Pay using bank', icon: Building2 },
          ].map((option) => {
            const Icon = option.icon;
            const isSelected = method === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors',
                  isSelected
                    ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-shade'
                    : 'border-gray-200 dark:border-white/10'
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => {
                    setMethod(option.id);
                    setError('');
                  }}
                  className="sr-only"
                />
                <Icon
                  className={cn('size-4 shrink-0', isSelected ? 'text-brand-500' : 'text-gray-500')}
                  aria-hidden="true"
                />
                <Text as="span" className={KYC_TYPO.body} weight={isSelected ? 'semibold' : 'normal'}>
                  {option.label}
                </Text>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* UPI */}
      {method === METHOD.UPI && (
        <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20">
          <div className="flex flex-col items-center text-center">
            <KycUpiQr value={mockPayment.upiId} />
            <Text className={cn(KYC_TYPO.body, 'mt-3')} color="text-gray-600 dark:text-homepage-softGray">
              Scan with any UPI app, or pay to
            </Text>
            <Text className={cn(KYC_TYPO.subtitle, 'font-semibold')}>{mockPayment.upiId}</Text>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {mockPayment.apps.map((upiApp) => (
              <button
                key={upiApp.id}
                type="button"
                disabled={status === 'paying'}
                onClick={() => {
                  setApp(upiApp.id);
                  pay(upiApp.id);
                }}
                className={cn(
                  'flex min-h-11 flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-colors duration-200',
                  'border-gray-200 hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/10',
                  app === upiApp.id && 'border-brand-500 bg-brand-500/5 dark:bg-brand-shade',
                  status === 'paying' && 'pointer-events-none opacity-60'
                )}
              >
                {/* Local brand SVGs: next/image would route them through the
                    image optimizer, which rejects SVG. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={upiApp.icon} alt="" aria-hidden="true" className="h-5 w-auto" />
                <Text as="span" className="text-[10px]" color="text-gray-700 dark:text-homepage-lightWhite">
                  {upiApp.label}
                </Text>
              </button>
            ))}
          </div>
        </div>
      )}

      {method === METHOD.BANK && (
        <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-white/10 dark:bg-black/20">
          <Text className={cn(KYC_TYPO.subtitle, 'font-medium')}>
            Pay from your bank account
          </Text>
          <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-gray-600 dark:text-homepage-softGray">
            Choose the account on the next screen and we will debit{' '}
            {mockPayment.currency}
            {mockPayment.total} from it to verify it.
          </Text>
        </div>
      )}

      {error && <KycAlert tone="error" className="mt-4">{error}</KycAlert>}

      {status === 'paying' && (
        <div className="mt-4 flex items-center gap-2" role="status" aria-live="polite">
          <Spinner className="size-4 text-brand-500" />
          <Text className={KYC_TYPO.body} color="text-gray-700 dark:text-homepage-lightWhite">
            {method === METHOD.UPI
              ? 'Waiting for the payment to complete...'
              : 'Redirecting to your bank...'}
          </Text>
        </div>
      )}

      <Button
        variant="authSubmit"
        size="lg"
        fullWidth
        weight="bold"
        loading={status === 'paying'}
        className="mt-4 text-[14px]"
        onClick={() => pay()}
      >
        {status === 'paying'
          ? 'Processing payment...'
          : method === METHOD.BANK
            ? 'Continue'
            : `Pay ${mockPayment.currency}${mockPayment.total}`}
      </Button>

      <KycDemoHint className="mt-4">
        Simulated payment — no gateway, no money moves. The QR is decorative.
      </KycDemoHint>
    </KycLayout>
  );
}
