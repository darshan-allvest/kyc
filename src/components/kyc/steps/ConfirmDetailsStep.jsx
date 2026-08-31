'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import PersonalDetailsSection from '@/components/kyc/PersonalDetailsSection';
import Declaration from '@/components/kyc/Declaration';
import FnoOfferModal from '@/components/kyc/FnoOfferModal';
import RiskDisclosureModal from '@/components/kyc/RiskDisclosureModal';
import PepBlockModal from '@/components/kyc/PepBlockModal';
import SebiActionModal from '@/components/kyc/SebiActionModal';
import {
  KYC_STEP,
  KYC_TYPO,
  PROFILE_FIELDS,
  RUNNING_ACCOUNT_SETTLEMENT,
} from '@/constants/kycConstants';
import { updatePersonalDetails } from '@/services/kyc/mockKycService';
import {
  TRADING_SEGMENT_DECLARATIONS,
  mockDeclarations,
  mockPepBlock,
} from '@/services/kyc/mockKycData';
import useKycFlow from '@/hooks/kyc/useKycFlow';
import useKycToast from '@/hooks/kyc/useKycToast';

const REQUIRED_IDS = mockDeclarations.filter((item) => item.required).map((item) => item.id);
// Every declaration starts ticked — including DDPI — so the applicant reads and
// un-ticks only what they disagree with. Optional ones can still be declined.
const DEFAULT_ACCEPTED = mockDeclarations.map((item) => item.id);
const DEFAULT_SEGMENTS = TRADING_SEGMENT_DECLARATIONS.filter((s) => s.defaultChecked).map(
  (s) => s.id
);

/**
 * Step 9 — confirm details + declaration. Confirm stays disabled until every
 * required declaration is ticked; the F&O offer appears right after.
 */
export default function ConfirmDetailsStep() {
  const {
    personalDetails,
    panDetails,
    goToStep,
    updateFlow,
    declarations,
    segments: savedSegments,
    runningAccountSettlement,
    riskDisclosureAccepted,
    pastActionDetails,
    resetFlow,
  } = useKycFlow();
  const { showToast } = useKycToast();

  const [accepted, setAccepted] = useState(declarations ?? DEFAULT_ACCEPTED);
  const [segments, setSegments] = useState(savedSegments ?? DEFAULT_SEGMENTS);
  const [settlement, setSettlement] = useState(
    runningAccountSettlement ?? RUNNING_ACCOUNT_SETTLEMENT[0]
  );
  const [showFno, setShowFno] = useState(false);
  // Where the disclosure was triggered from decides what happens on accept:
  // ticking F&O keeps the applicant here, Confirm carries on to payment.
  const [riskTrigger, setRiskTrigger] = useState(null);
  const [riskAccepted, setRiskAccepted] = useState(Boolean(riskDisclosureAccepted));
  // Un-ticking "I am not a Politically Exposed Person" declares PEP status,
  // which cannot be taken online — the modal is the only way forward.
  const [showPepBlock, setShowPepBlock] = useState(false);
  // Same shape for past actions, except the admission is allowed: the applicant
  // types what the action was and the application carries on with it recorded.
  const [showSebiAction, setShowSebiAction] = useState(false);
  const [sebiDetails, setSebiDetails] = useState(pastActionDetails ?? '');

  // 'pastActions' is answered either way: ticked (nothing to declare) or
  // un-ticked with the action disclosed in the modal.
  const allRequiredAccepted = REQUIRED_IDS.every(
    (id) => accepted.includes(id) || (id === 'pastActions' && Boolean(sebiDetails))
  );
  // The government fetch does not carry these, so they are filled in here
  // through Edit Details before the application can be confirmed.
  const missingProfile = PROFILE_FIELDS.filter((field) => !personalDetails?.[field.key]);
  const canConfirm =
    allRequiredAccepted && segments.length > 0 && missingProfile.length === 0;

  // "Edit Details" only touches the profile fields; identity stays as fetched.
  const handleSaveDetails = async (patch) => {
    const result = await updatePersonalDetails({ ...personalDetails, ...patch });
    if (result.success) updateFlow({ personalDetails: result.data });
    return result;
  };

  const handleToggle = (id, checked) => {
    setAccepted(checked ? [...accepted, id] : accepted.filter((item) => item !== id));
    if (id === 'pep' && !checked) setShowPepBlock(true);
    if (id === 'pastActions') {
      if (checked) setSebiDetails('');
      else setShowSebiAction(true);
    }
  };

  // Close withdraws the admission: the box goes back on and the flow carries on
  // as a non-PEP application.
  const dismissPepBlock = () => {
    setShowPepBlock(false);
    setAccepted((prev) => (prev.includes('pep') ? prev : [...prev, 'pep']));
  };

  // Confirm ends the journey: the application is rejected and the applicant is
  // dropped back on the first screen, told why on the way out.
  const confirmPepBlock = () => {
    setShowPepBlock(false);
    showToast({
      tone: 'error',
      title: mockPepBlock.rejectedTitle,
      message: mockPepBlock.rejectedMessage,
    });
    resetFlow();
  };

  // Close without disclosing withdraws the admission — the box goes back on.
  const dismissSebiAction = () => {
    setShowSebiAction(false);
    if (!sebiDetails) {
      setAccepted((prev) => (prev.includes('pastActions') ? prev : [...prev, 'pastActions']));
    }
  };

  const confirmSebiAction = (details) => {
    setSebiDetails(details);
    setShowSebiAction(false);
  };

  const persistWith = (extra = {}) =>
    updateFlow({
      declarationAccepted: true,
      declarations: accepted,
      optionalDeclarations: accepted.filter((id) => !REQUIRED_IDS.includes(id)),
      segments,
      runningAccountSettlement: settlement,
      ddpiAccepted: accepted.includes('ddpi'),
      pastActionDetails: sebiDetails,
      fnoSelected: segments.includes('fno'),
      riskDisclosureAccepted: riskAccepted,
      ...extra,
    });

  const toggleSegment = (id) => {
    const wasSelected = segments.includes(id);
    const nextSegments = wasSelected
      ? segments.filter((segment) => segment !== id)
      : [...segments, id];
    setSegments(nextSegments);

    if (id !== 'fno') return;

    // F&O cannot be activated without acknowledging the derivatives risk
    // disclosure — ticking the box asks for it there and then.
    if (!wasSelected) {
      if (!riskAccepted) setRiskTrigger('segment');
      return;
    }
    // Un-ticking F&O withdraws the acknowledgement with it.
    setRiskAccepted(false);
    persistWith({
      segments: nextSegments,
      fnoSelected: false,
      riskDisclosureAccepted: false,
    });
  };

  const handleConfirm = () => {
    persistWith();
    // Anyone who left F&O off gets the offer first — that nudge is about F&O
    // alone, not about the other derivative segments.
    if (!segments.includes('fno')) {
      setShowFno(true);
      return;
    }
    // F&O on but the disclosure never acknowledged (modal dismissed earlier):
    // it has to be signed off before moving on.
    if (!riskAccepted) {
      setRiskTrigger('confirm');
      return;
    }
    goToStep(KYC_STEP.PAYMENT);
  };

  // "Activate F&O" ticks the segment and keeps the applicant on this screen, so
  // they can see the change — then the risk disclosure has to be acknowledged.
  const activateFno = () => {
    const nextSegments = [...new Set([...segments, 'fno'])];
    setSegments(nextSegments);
    persistWith({ segments: nextSegments, fnoSelected: true });
    setShowFno(false);
    setRiskTrigger('offer');
  };

  const skipFno = () => {
    setShowFno(false);
    persistWith();
    goToStep(KYC_STEP.PAYMENT);
  };

  const acceptRisk = () => {
    const trigger = riskTrigger;
    setRiskAccepted(true);
    setRiskTrigger(null);
    persistWith({
      segments: [...new Set([...segments, 'fno'])],
      fnoSelected: true,
      riskDisclosureAccepted: true,
    });
    // Only the Confirm route was on its way somewhere.
    if (trigger === 'confirm') goToStep(KYC_STEP.PAYMENT);
  };

  // Declining the disclosure backs the activation out again.
  const declineRisk = () => {
    const nextSegments = segments.filter((segment) => segment !== 'fno');
    setSegments(nextSegments);
    setRiskAccepted(false);
    persistWith({ segments: nextSegments, fnoSelected: false, riskDisclosureAccepted: false });
    setRiskTrigger(null);
  };

  return (
    <>
      <KycLayout
        title="Confirm Details"
        subtitle="Check what we fetched, then accept the declarations below."
        showStepper
        currentStep={KYC_STEP.CONFIRM_DETAILS}
        maxWidth="max-w-[34rem]"
        onBack={() => goToStep(KYC_STEP.GOVERNMENT_FETCH)}
        footer={
          <>
            <Button
              variant="authSubmit"
              size="lg"
              fullWidth
              weight="bold"
              disabled={!canConfirm}
              className="text-[14px]"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
            {!canConfirm && (
              <Text
                className={cn(KYC_TYPO.body, 'mt-2')}
                align="center"
                color="text-gray-500 dark:text-homepage-darkGrey"
              >
                {missingProfile.length
                  ? `Add your ${missingProfile
                      .map((field) => field.label.toLowerCase())
                      .join(', ')} under Edit Details.`
                  : segments.length === 0
                    ? 'Select at least one segment to activate.'
                    : 'Accept the required declarations to enable Confirm.'}
              </Text>
            )}
          </>
        }
      >
        <PersonalDetailsSection
          details={personalDetails}
          pan={panDetails?.pan}
          missingCount={missingProfile.length}
          onSave={handleSaveDetails}
        />

        <Declaration
          className="mt-3"
          segments={segments}
          onToggleSegment={toggleSegment}
          accepted={accepted}
          onToggle={handleToggle}
          settlement={settlement}
          onSettlementChange={setSettlement}
        />
      </KycLayout>

      <FnoOfferModal
        open={showFno}
        onActivate={activateFno}
        onSkip={skipFno}
        onClose={() => setShowFno(false)}
      />

      <SebiActionModal
        key={String(showSebiAction)}
        open={showSebiAction}
        value={sebiDetails}
        onConfirm={confirmSebiAction}
        onClose={dismissSebiAction}
      />

      <PepBlockModal
        open={showPepBlock}
        onConfirm={confirmPepBlock}
        onClose={dismissPepBlock}
      />

      <RiskDisclosureModal
        open={Boolean(riskTrigger)}
        onAccept={acceptRisk}
        onDecline={declineRisk}
      />
    </>
  );
}
