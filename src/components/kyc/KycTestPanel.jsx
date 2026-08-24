'use client';

import { useState } from 'react';
import { FlaskConical, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import Button from '@/components/common/button/Button';
import Checkbox from '@/components/common/Checkbox';
import { KYC_TYPO, PERMISSION_STATE } from '@/constants/kycConstants';
import useKycTestConfig from '@/hooks/kyc/useKycTestConfig';
import useKycFlow from '@/hooks/kyc/useKycFlow';
import { MOCK_ACCOUNTS, MOCK_OTP } from '@/services/kyc/mockKycData';

const SCENARIO_OPTIONS = [
  { value: 'auto', label: 'By account' },
  { value: 'existing', label: 'Has KYC' },
  { value: 'new', label: 'No KYC' },
];

const TOGGLE_GROUPS = [
  {
    title: 'Account & OTP',
    items: [
      { key: 'failSendOtp', label: 'Sending OTP fails' },
      { key: 'failOtp', label: 'Any OTP is incorrect' },
      { key: 'expireOtp', label: 'OTP expired' },
      { key: 'failAccount', label: 'Account sign-in fails' },
    ],
  },
  {
    title: 'KYC & PAN',
    items: [
      { key: 'failKycStatus', label: 'KYC status lookup fails' },
      { key: 'failDigiLockerOtp', label: 'DigiLocker OTP fails' },
      { key: 'failDigiLockerPin', label: 'DigiLocker PIN rejected' },
      { key: 'failDigiLocker', label: 'DigiLocker fetch fails' },
      { key: 'failDocumentUpload', label: 'Document upload fails' },
      { key: 'failPan', label: 'PAN verification fails' },
      { key: 'failGovernmentFetch', label: 'Details fetch fails' },
    ],
  },
  {
    title: 'Bank, nominee & consent',
    items: [
      { key: 'failPersonalDetailsUpdate', label: 'Edit details save fails' },
      { key: 'failNominee', label: 'Nominee save fails' },
      { key: 'failConsent', label: 'Consent save fails' },
      { key: 'bankNameMismatch', label: 'Bank account name mismatch' },
      { key: 'failBankVerification', label: 'Bank verification fails' },
      { key: 'failPayment', label: 'Payment fails' },
      { key: 'failEsign', label: 'E-Sign verification fails' },
      { key: 'failAadhaarOtp', label: 'Aadhaar OTP fails' },
      { key: 'failAadhaarEsign', label: 'Aadhaar e-sign rejected' },
      { key: 'failDocumentGeneration', label: 'Document generation fails' },
    ],
  },
  {
    title: 'Device',
    items: [{ key: 'useRealDeviceCamera', label: 'Use real device camera' }],
  },
];

const OUTCOME_OPTIONS = [
  PERMISSION_STATE.GRANTED,
  PERMISSION_STATE.DENIED,
  PERMISSION_STATE.UNAVAILABLE,
];

/**
 * KycTestPanel — on-screen switchboard for the demo.
 *
 * Mirrors src/services/kyc/kycTestConfig.js so every happy path and negative
 * case can be exercised without editing code or touching browser settings.
 */
export default function KycTestPanel() {
  const [open, setOpen] = useState(false);
  const { config, setConfig, resetConfig } = useKycTestConfig();
  const { resetFlow } = useKycFlow();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="kyc-test-panel"
        className="fixed bottom-4 right-4 z-[10090] flex size-11 items-center justify-center rounded-full bg-homepage-purple text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {open ? <X className="size-5" /> : <FlaskConical className="size-5" />}
        <span className="sr-only">{open ? 'Close test panel' : 'Open test panel'}</span>
      </button>

      {open && (
        <aside
          id="kyc-test-panel"
          className="fixed bottom-20 right-4 z-[10090] max-h-[70vh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-homepage-borderColor bg-homepage-buyModal p-4 shadow-xl"
        >
          <Text className={cn(KYC_TYPO.title, 'text-white')} font="sora">
            Demo switchboard
          </Text>
          <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-homepage-lightWhite">
            Flip any scenario mid-flow. Same switches live in
            <code className="mx-1 rounded bg-black/40 px-1">kycTestConfig.js</code>.
          </Text>

          <div className="mt-3 space-y-2 rounded-lg border border-homepage-borderColor p-2.5">
            <Text className={KYC_TYPO.body} color="text-homepage-lightWhite">
              Test OTP <span className="font-semibold text-brand-500">{MOCK_OTP}</span>
            </Text>
            {MOCK_ACCOUNTS.map((account) => (
              <Text key={account.id} className={KYC_TYPO.body} color="text-homepage-darkGrey">
                {account.mobile} · {account.email} —{' '}
                <span className="text-homepage-lightWhite">{account.label}</span>
              </Text>
            ))}
          </div>

          <div className="mt-4">
            <Text className={cn(KYC_TYPO.label, 'mb-2 uppercase tracking-wide')} color="text-homepage-darkGrey">
              KYC scenario
            </Text>
            <div className="flex flex-wrap gap-1.5">
              {SCENARIO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setConfig({ kycScenario: option.value })}
                  aria-pressed={config.kycScenario === option.value}
                  className={cn(
                    'min-h-11 rounded-full border px-3 text-[10px] font-medium transition-colors duration-200',
                    config.kycScenario === option.value
                      ? 'border-brand-500 bg-brand-500 text-black'
                      : 'border-homepage-borderColor text-homepage-lightWhite hover:border-brand-500'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {TOGGLE_GROUPS.map((group) => (
            <div key={group.title} className="mt-4">
              <Text className={cn(KYC_TYPO.label, 'mb-2 uppercase tracking-wide')} color="text-homepage-darkGrey">
                {group.title}
              </Text>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <Checkbox
                    key={item.key}
                    checked={Boolean(config[item.key])}
                    onChange={(checked) => setConfig({ [item.key]: checked })}
                    label={item.label}
                    labelProps={{ className: 'text-[12px]' }}
                    className="w-full items-start"
                  />
                ))}
              </div>
            </div>
          ))}

          {[
            { key: 'locationOutcome', title: 'Location permission' },
            { key: 'cameraOutcome', title: 'Camera permission' },
          ].map(({ key, title }) => (
            <div key={key} className="mt-4">
              <Text className={cn(KYC_TYPO.label, 'mb-2 uppercase tracking-wide')} color="text-homepage-darkGrey">
                {title}
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {OUTCOME_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setConfig({ [key]: option })}
                    aria-pressed={config[key] === option}
                    className={cn(
                      'min-h-11 rounded-full border px-3 text-[10px] font-medium transition-colors duration-200',
                      config[key] === option
                        ? 'border-brand-500 bg-brand-500 text-black'
                        : 'border-homepage-borderColor text-homepage-lightWhite hover:border-brand-500'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <Text className={cn(KYC_TYPO.label, 'mb-2 uppercase tracking-wide')} color="text-homepage-darkGrey">
              API delay: {config.delay}ms
            </Text>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={config.delay}
              onChange={(event) => setConfig({ delay: Number(event.target.value) })}
              className="w-full accent-brand-500"
              aria-label="Simulated API delay in milliseconds"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              fullWidth
              leftIcon={RotateCcw}
              className="text-[12px]"
              onClick={() => {
                resetConfig();
                resetFlow();
              }}
            >
              Restart demo
            </Button>
          </div>
        </aside>
      )}
    </>
  );
}
