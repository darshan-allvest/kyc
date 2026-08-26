// Shapes the flow state into the sections used by both the on-screen document
// preview and the generated PDF, so the two can never drift apart.

import { maskAccountNumber, maskPan, formatMobile } from '@/lib/kyc/kycFormatters';
import { maskEmail } from '@/utils/textHelpers';
import {
  NOMINEE_OPT_OUT_DECLARATION,
  NOMINEE_STATEMENT_OPTIONS,
} from '@/constants/kycConstants';
import {
  TRADING_SEGMENT_DECLARATIONS,
  mockConsents,
  mockDeclarations,
  mockFinalDocument,
} from '@/services/kyc/mockKycData';

export function buildKycDocument(flow) {
  const {
    personalDetails,
    panDetails,
    submittedBankDetails,
    bankDetails,
    existingKyc,
    mobileNumber,
    account,
    location,
    fnoSelected,
    optionalDeclarations = [],
    declarations: rawDeclarations,
    segments: rawSegments,
    payment,
    nominees: rawNominees,
    nomineeOptOut,
    nomineeOptOutAcknowledged,
    nomineeStatementPreferences,
    nomineeStatementFlag,
    consents: rawConsents,
    runningAccountSettlement,
  } = flow;

  const bank = submittedBankDetails || bankDetails;
  const name =
    personalDetails?.fullName || existingKyc?.fullName || account?.name || '-';

  // The flow initialises these as null, so a plain default would not apply.
  const declarations = rawDeclarations ?? [];
  const segments = rawSegments ?? [];
  const nominees = rawNominees ?? [];
  const consents = rawConsents ?? [];

  const sections = [
    {
      id: 'personal',
      title: 'Personal details',
      rows: [
        ['Full name', name],
        ['Date of birth', personalDetails?.dateOfBirth || existingKyc?.dateOfBirth || '-'],
        ['Gender', personalDetails?.gender || existingKyc?.gender || '-'],
        ["Father's name", personalDetails?.fathersName || '-'],
        ["Mother's name", personalDetails?.mothersName || '-'],
        ['Occupation', personalDetails?.occupation || '-'],
        ['Marital status', personalDetails?.maritalStatus || '-'],
        ['Gross annual income', personalDetails?.incomeRange || '-'],
        ['Trading experience', personalDetails?.tradingExperience || '-'],
        ['Source of wealth', personalDetails?.sourceOfWealth || '-'],
        ['Email', maskEmail(personalDetails?.email || account?.email || '')],
        ['Mobile', formatMobile(personalDetails?.mobile || mobileNumber)],
        [
          'Address',
          personalDetails
            ? `${personalDetails.address}, ${personalDetails.city}, ${personalDetails.state} - ${personalDetails.pincode}`
            : existingKyc?.address || '-',
        ],
      ],
    },
    {
      id: 'pan',
      title: 'PAN details',
      rows: [
        ['PAN', maskPan(panDetails?.pan || existingKyc?.pan)],
        ['Name as per PAN', panDetails?.name || name],
        ['PAN status', panDetails?.status || '-'],
      ],
    },
  ];

  if (bank) {
    sections.push({
      id: 'bank',
      title: 'Bank details',
      rows: [
        ['Bank name', bank.bankName || '-'],
        ['Account number', maskAccountNumber(bank.accountNumber)],
        ['IFSC', bank.ifsc || '-'],
        ['Account type', bank.accountType || '-'],
      ],
    });
  }

  sections.push({
    id: 'segments',
    title: 'Segments activated',
    rows: TRADING_SEGMENT_DECLARATIONS.map((segment) => [
      segment.label,
      (segments.length ? segments : fnoSelected ? ['cashMf', 'fno'] : ['cashMf']).includes(
        segment.id
      )
        ? 'Activated'
        : 'Not activated',
    ]),
  });

  // Declarations as signed on the Confirm screen, each with its outcome.
  sections.push({
    id: 'declarations',
    title: 'Declarations',
    rows: [
      ...(flow.fnoSelected
        ? [['Derivatives risk disclosure', flow.riskDisclosureAccepted ? 'Acknowledged' : 'Pending']]
        : []),
      ...mockDeclarations.map((declaration) => [
        declaration.control === 'settlement'
          ? `${declaration.text} ${runningAccountSettlement || ''}`.trim()
          : declaration.text,
        declarations.includes(declaration.id) ? 'Accepted' : 'Declined',
      ]),
    ],
  });

  // Nomination — either the nominees and their shares, or the recorded opt-out.
  sections.push({
    id: 'nominee',
    title: 'Nomination',
    rows: nomineeOptOut
      ? [
          ['Nomination', 'Opted out'],
          [
            NOMINEE_OPT_OUT_DECLARATION.title,
            nomineeOptOutAcknowledged ? 'Accepted' : 'Not accepted',
          ],
        ]
      : nominees.length
        ? [
            ...nominees.flatMap((nominee, index) => [
              [`Nominee ${index + 1}`, nominee.name],
              ['Relationship', nominee.relationship],
              ['Date of birth', nominee.dateOfBirth],
              ['Share of holdings', `${nominee.sharePercentage}%`],
              ...(nominee.mobile ? [['Nominee mobile', formatMobile(nominee.mobile)]] : []),
              ...(nominee.email ? [['Nominee email', maskEmail(nominee.email)]] : []),
              ...(nominee.idDocument && nominee.idNumber
                ? [[nominee.idDocument, nominee.idNumber]]
                : []),
            ]),
            [
              'Printed in holding statements',
              NOMINEE_STATEMENT_OPTIONS.filter((option) =>
                (nomineeStatementPreferences ?? []).includes(option.id)
              )
                .map((option) =>
                  option.id === 'FLAG' && nomineeStatementFlag
                    ? `Whether nomination given: ${nomineeStatementFlag}`
                    : option.label
                )
                .join('; ') || 'Not selected',
            ],
          ]
        : [['Nomination', 'Not provided']],
  });

  if (flow.digiLockerSelection?.length && flow.digiLockerData) {
    const shared = flow.digiLockerData.documents.filter((document) =>
      flow.digiLockerSelection.includes(document.id)
    );
    sections.push({
      id: 'digilocker',
      title: 'Documents from DigiLocker',
      rows: shared.map((document) => [document.name, `${document.issuer} · ${document.number}`]),
    });
  }

  if (flow.aadhaarEsign || flow.signatureUpload) {
    sections.push({
      id: 'esign',
      title: 'Aadhaar e-sign',
      rows: [
        ...(flow.aadhaarEsign
          ? [
              ['Provider', flow.aadhaarEsign.esp],
              ['Signature reference', flow.aadhaarEsign.reference],
              ['Signed', flow.aadhaarEsign.signedAt || '-'],
            ]
          : []),
        ...(flow.signatureUpload
          ? [['Uploaded signature', flow.signatureUpload.fileName]]
          : []),
      ],
    });
  }

  if (payment) {
    sections.push({
      id: 'payment',
      title: 'Account opening payment',
      rows: [
        ['Amount', `Rs. ${payment.amount}`],
        ['Method', payment.method === 'UPI' ? `UPI${payment.app ? ` (${payment.app})` : ''}` : `Net banking${payment.bank ? ` (${payment.bank})` : ''}`],
        ['Reference', payment.reference || '-'],
      ],
    });
  }

  if (consents.length) {
    sections.push({
      id: 'consent',
      title: 'Application kit',
      rows: mockConsents.map((consent) => [
        consent.label,
        consents.includes(consent.id) ? 'Accepted' : 'Declined',
      ]),
    });
  }

  if (location) {
    sections.push({
      id: 'location',
      title: 'Verification location',
      rows: [
        ['Latitude', location.latitude],
        ['Longitude', location.longitude],
        ['Place', `${location.city}, ${location.state}`],
      ],
    });
  }

  const declarationLines = mockDeclarations
    .filter((item) => item.required || optionalDeclarations.includes(item.id))
    .map((item) => item.text);

  return {
    meta: {
      documentId: mockFinalDocument.documentId,
      documentName: mockFinalDocument.documentName,
      generatedOn: mockFinalDocument.generatedOn,
      applicantName: name,
    },
    sections,
    declarations: declarationLines,
  };
}

export default buildKycDocument;
