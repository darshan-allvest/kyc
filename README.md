# KYC Onboarding Demo (frontend only)

A complete, production-styled KYC onboarding journey built as a standalone
Next.js app. **Everything runs on dummy data in the browser** — no backend, no
database, no DigiLocker / PAN / bank / e-sign / OTP provider is contacted.

The visual language (colors, fonts, spacing, buttons, inputs, cards, dialogs) is
taken from the existing `user-frontend` application so the flow looks native to
it. That project was used as a read-only theme reference and was not modified.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000  → redirects to /kyc
```

Open **http://localhost:3000** (use `localhost`, not `127.0.0.1`, unless you add
that host to `allowedDevOrigins` in `next.config.mjs`).

```bash
npm run build && npm start   # production build
npm run lint                 # eslint (clean)
```

## The flow

`/kyc` runs the whole journey in one client-side state machine:

1. **Mobile number** — validation, empty / invalid / loading states
2. **OTP** — 6 digits, auto-advance, paste, backspace, resend countdown (demo OTP `123456`)
3. **Stepper** — Basic Details → PAN → Verify Details → Additional → Bank → Nominee → Consent
4. **Account details** — simulated Google sign-in or email + password
5. **KYC status** — an existing record goes straight to PAN (flagged on that screen);
   no record shows the Upload documents / DigiLocker choice
6. **Basic details** — the PAN screen; PAN is the only thing asked here
7. **Getting your details from Govt. Database** — Pan Card / Personal / Bank stages
8. **Review** → **Confirm + declaration** (Confirm stays disabled until ticked) → **F&O offer modal**
9. **Additional details** — occupation, gross annual income, trading experience, marital
   status, contact-ownership declaration, segment selection (F&O / currency gated on an
   income proof), PEP declaration
10. **Bank details** → ₹1 verification modal
11. **Nominee** — up to 3 nominees with shares totalling 100%, or a recorded opt-out
    with its own acknowledgement
12. **Consent** — application kit (Rights & Obligations, RDD, Guidance Note, Policies,
    Tariff), Running Account Authorisation with settlement frequency, optional DDPI and
    e-communication consents
13. **E-Sign** → **location** → **selfie** (with the walkthrough video) → **signature pad**
14. **Document** — preview + a real client-side generated PDF (`View Document` / `Download PDF`),
    now including additional details, segments, nomination and consents
15. **Success** → Go to Dashboard

## The two demo accounts

The journey follows the account you sign in with — no toggle needed:

| | Account A — **has KYC** | Account B — **no KYC** |
|---|---|---|
| Mobile | `9876543210` | `9123456780` |
| Email | `rahul.sharma@example.com` | `priya.mehta@example.com` |
| Password | `Test@1234` | `Test@1234` |
| Name | Rahul Sharma | Priya Mehta |
| PAN | `ABCDE1234F` | `FGHIJ5678K` |
| Bank | Test Bank · `123456789012` · `TEST0001234` | Demo Bank · `987654321098` · `DEMO0005678` |
| City | Mumbai | Pune |
| KYC step shows | "Existing KYC record found" banner on the PAN screen, PAN pre-filled | "Complete your KYC" → Upload documents / DigiLocker |

OTP for both: `123456`. Any other valid 10-digit number behaves like a new user
(Scenario B). Signing in with the wrong email for a number is rejected with a
message naming the right one.

## Switching scenarios (no code edits needed)

Click the **beaker button** (bottom-right) to open the demo switchboard. It can
flip, mid-flow:

| Group | Switches |
|---|---|
| KYC scenario | `By account` (default) / `Has KYC` / `No KYC` — the last two override the account |
| Account & OTP | send-OTP failure, wrong OTP, expired OTP, sign-in failure |
| KYC & PAN | KYC status failure, DigiLocker failure, upload failure, basic-details save failure, PAN failure, details-fetch failure |
| Bank, nominee & consent | additional-details save failure, nominee save failure, consent save failure, name mismatch, bank verification failure, e-sign failure, document generation failure |
| Permissions | location + camera: granted / denied / unavailable |
| Device | use the real webcam, or a placeholder capture |
| Timing | simulated API delay slider (0–3000 ms) |

The same switches live in **`src/services/kyc/kycTestConfig.js`** — edit
`DEFAULT_KYC_TEST_CONFIG` (e.g. `kycScenario: 'existing'`) if you want a
scenario to be the default on load.
(Panel changes are in-memory, so a page reload returns to those defaults.)

All demo data is clearly fake and lives in `src/services/kyc/mockKycData.js`
(`MOCK_ACCOUNTS`).

## Structure

```
src/
  app/
    layout.js                  # fonts + dark theme, same as the reference app
    page.jsx                   # → /kyc
    kyc/page.jsx               # the flow
    dashboard/page.jsx         # placeholder landing spot for the final CTA
  components/
    common/, ui/               # theme components copied from user-frontend
    kyc/
      KycOnboardingFlow.jsx    # step machine + provider
      KycLayout.jsx            # page shell (logo, stepper, card)
      KycStepper.jsx           # 7 milestones, mobile-friendly
      KycTestPanel.jsx         # demo switchboard
      KycAlert / KycDetailCard / KycTextField / KycOtpInput / KycProgressStages
      KycMethodSelection / Declaration / DocumentPreview / KycGuideVideo
      SignaturePad.jsx         # mouse + touch + stylus, clear, empty-state guard
      FnoOfferModal / BankVerificationModal / EsignModal / LocationPermissionModal
      steps/                   # one component per screen (incl. BasicDetails,
                               # AdditionalDetails, Nominee, Consent)
  contexts/KycFlowContext.jsx  # centralized flow state (context + reducer)
  hooks/kyc/                   # useKycFlow, useKycCamera, useKycTestConfig, useResendTimer
  lib/kyc/                     # formatters, document builder, PDF writer
  services/kyc/                # mock data, mock service, test switchboard
```

## Notes

- **State** is React context + reducer only. Nothing is written to
  localStorage/sessionStorage, so the selfie, signature and personal details
  live in memory for the session only. A refresh restarts the journey.
- **PDF** is written by hand in `src/lib/kyc/generateKycPdf.js` (no dependency):
  Helvetica text plus the signature and selfie embedded as JPEG image objects,
  selfie on the last page.
- **Masking** — PAN, account numbers, email and mobile are masked on screen the
  way they would be in production, even though the values are fake.
- **Assets** — `public/assets/logo/allvest-horizontal-logo.avif` (provided logo)
  and `public/assets/video/kyc-guide.mp4` (provided KYC screen recording,
  transcoded to 960×540 for the web).
