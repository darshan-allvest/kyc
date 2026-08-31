// ─────────────────────────────────────────────────────────────────────────────
// Dummy data for the KYC onboarding demo. Everything here is fake test data —
// no real person, PAN, bank account or credential appears in this file.
//
// Two demo accounts drive the two journeys:
//   • Rahul Sharma  → KYC already completed  (Scenario A: fetch & review)
//   • Priya Mehta   → no KYC yet             (Scenario B: DigiLocker)
// Any other valid mobile number behaves like a new user.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_OTP = '123456';

// The simulated DigiLocker portal: mobile → OTP → 6-digit security PIN.
export const MOCK_DIGILOCKER = {
  otp: '123456',
  pin: '112233',
  portalName: 'DigiLocker (simulated)',
};
export const DEMO_PASSWORD = 'Test@1234';
// Suggested on the "set your password" screen — it satisfies every rule.
export const DEMO_NEW_PASSWORD = 'Qwerty@123';
// Suggested on the "set your MPIN" screen.
export const DEMO_MPIN = '123456';

// ─── Account A — existing KYC ────────────────────────────────────────────────
const accountWithKyc = {
  id: 'existing-kyc',
  label: 'Existing KYC',
  scenario: 'A',
  kycCompleted: true,
  mobile: '9876543210',
  email: 'rahul.sharma@example.com',
  password: DEMO_PASSWORD,
  name: 'Rahul Sharma',

  existingKyc: {
    source: 'Existing KYC record',
    referenceId: 'KYC-TEST-4821',
    completedOn: '12/02/2026',
    fullName: 'Rahul Sharma',
    dateOfBirth: '15/08/1995',
    pan: 'ABCDE1234F',
    gender: 'Male',
    email: 'rahul.sharma@example.com',
    mobile: '9876543210',
    address: '123 Test Street, Andheri East, Mumbai, Maharashtra - 400001',
  },

  panDetails: {
    pan: 'ABCDE1234F',
    name: 'Rahul Sharma',
    status: 'Active',
    category: 'Individual',
    aadhaarSeeded: true,
  },

  personalDetails: {
    fullName: 'Rahul Sharma',
    dateOfBirth: '15/08/1995',
    gender: 'Male',
    fathersName: 'Suresh Sharma',
    mothersName: 'Anita Sharma',
    maritalStatus: 'Single',
    occupation: 'Private Sector',
    incomeRange: '₹10 - 25 lakh',
    tradingExperience: '1 - 5 Years',
    sourceOfWealth: 'Salary',
    address: '123 Test Street, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    email: 'rahul.sharma@example.com',
    mobile: '9876543210',
  },

  bankDetails: {
    bankName: 'Test Bank',
    accountNumber: '123456789012',
    ifsc: 'TEST0001234',
    accountType: 'Savings',
    branch: 'Andheri East, Mumbai',
    accountHolder: 'Rahul Sharma',
  },

  digiLocker: {
    source: 'DigiLocker (simulated)',
    aadhaarNumber: '123456784321',
    linkedMobile: '9876543210',
    documents: [
      { id: 'aadhaar', name: 'Aadhaar', issuer: 'UIDAI', number: 'XXXX XXXX 4321', status: 'Verified' },
      { id: 'pan', name: 'PAN Card', issuer: 'Income Tax Department', number: 'ABCDE1234F', status: 'Verified' },
      { id: 'driving', name: 'Driving Licence', issuer: 'Maharashtra RTO', number: 'MH-XXXXXXXX', status: 'Verified' },
    ],
    personalDetails: {
      fullName: 'Rahul Sharma',
      dateOfBirth: '15/08/1995',
      gender: 'Male',
      fathersName: 'Suresh Sharma',
      address: '123 Test Street, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
  },
};

// ─── Account B — no KYC yet ──────────────────────────────────────────────────
const accountWithoutKyc = {
  id: 'new-kyc',
  label: 'No KYC yet',
  scenario: 'B',
  kycCompleted: false,
  mobile: '9123456780',
  email: 'priya.mehta@example.com',
  password: DEMO_PASSWORD,
  name: 'Priya Mehta',

  existingKyc: null,

  panDetails: {
    pan: 'FGHIJ5678K',
    name: 'Priya Mehta',
    status: 'Active',
    category: 'Individual',
    aadhaarSeeded: true,
  },

  personalDetails: {
    fullName: 'Priya Mehta',
    dateOfBirth: '22/11/1992',
    gender: 'Female',
    fathersName: 'Rakesh Mehta',
    mothersName: 'Sunita Mehta',
    maritalStatus: 'Married',
    occupation: 'Business',
    incomeRange: '₹5 - 10 lakh',
    tradingExperience: 'Less than 1 Year',
    sourceOfWealth: 'Business income',
    address: '45 Sample Road, Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    email: 'priya.mehta@example.com',
    mobile: '9123456780',
  },

  bankDetails: {
    bankName: 'Demo Bank',
    accountNumber: '987654321098',
    ifsc: 'DEMO0005678',
    accountType: 'Savings',
    branch: 'Kothrud, Pune',
    accountHolder: 'Priya Mehta',
  },

  digiLocker: {
    source: 'DigiLocker (simulated)',
    aadhaarNumber: '987654328765',
    linkedMobile: '9123456780',
    documents: [
      { id: 'aadhaar', name: 'Aadhaar', issuer: 'UIDAI', number: 'XXXX XXXX 8765', status: 'Verified' },
      { id: 'pan', name: 'PAN Card', issuer: 'Income Tax Department', number: 'FGHIJ5678K', status: 'Verified' },
    ],
    personalDetails: {
      fullName: 'Priya Mehta',
      dateOfBirth: '22/11/1992',
      gender: 'Female',
      fathersName: 'Rakesh Mehta',
      address: '45 Sample Road, Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
    },
  },
};

export const MOCK_ACCOUNTS = [accountWithKyc, accountWithoutKyc];

/** Unknown mobile numbers / emails are treated as brand-new users. */
export const FALLBACK_ACCOUNT = accountWithoutKyc;

const digits = (value) => (value || '').replace(/\D/g, '').slice(-10);

export const findAccountByMobile = (mobile) =>
  MOCK_ACCOUNTS.find((account) => account.mobile === digits(mobile)) || null;

export const findAccountByEmail = (email) =>
  MOCK_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === (email || '').trim().toLowerCase()
  ) || null;

export const findAccountById = (id) =>
  MOCK_ACCOUNTS.find((account) => account.id === id) || FALLBACK_ACCOUNT;

/** Resolves the account a flow is running as, from whatever identity is known. */
export const resolveAccount = ({ accountId, mobile, email } = {}) =>
  (accountId && MOCK_ACCOUNTS.find((account) => account.id === accountId)) ||
  findAccountByEmail(email) ||
  findAccountByMobile(mobile) ||
  FALLBACK_ACCOUNT;

// ─── Shared, account-independent data ────────────────────────────────────────
// Stages shown on the "Getting your details from Govt. Database" screen. Bank
// details still come back with the fetch — they are just not surfaced here,
// since the applicant enters and verifies the account on the Bank step.
export const mockFetchStages = [
  { id: 'pan', label: 'Pan Card Details' },
  { id: 'personal', label: 'Personal Details' },
];

// Statutory documents a broker must place in front of the applicant before
// e-signing. Sizes are illustrative — no file is actually served.
export const mockStatutoryDocuments = [
  { id: 'rights', name: 'Rights & Obligations of Stock Brokers and Clients', size: '210 KB' },
  { id: 'rdd', name: 'Risk Disclosure Document (RDD)', size: '186 KB' },
  { id: 'guidance', name: 'Guidance Note — Do’s and Don’ts for Investors', size: '94 KB' },
  { id: 'policies', name: 'Policies & Procedures', size: '132 KB' },
  { id: 'tariff', name: 'Tariff Sheet — Brokerage and Charges', size: '78 KB' },
];

// Consents captured on the Consent step. `required: false` items are optional
// authorisations the user can decline without blocking the application.
export const mockConsents = [
  {
    id: 'documents',
    required: true,
    label: 'I have read and accept the documents above',
    description:
      'Rights & Obligations, Risk Disclosure Document, Guidance Note, Policies & Procedures and the Tariff Sheet.',
  },
  {
    id: 'tariff',
    required: true,
    label: 'I accept the tariff and charges',
    description:
      'Brokerage, DP charges, and statutory levies as listed in the tariff sheet above.',
  },
];

export const TRADING_SEGMENT_DECLARATIONS = [
  { id: 'cashMf', label: 'Cash/MF', defaultChecked: true },
  // F&O stays off by default: activating it triggers the risk disclosure.
  { id: 'fno', label: 'F&O', defaultChecked: false },
  // Derivative segments are opt-in, like F&O.
  { id: 'commodity', label: 'Commodities', defaultChecked: false },
  { id: 'currency', label: 'Currency Derivatives', defaultChecked: false },
  { id: 'debt', label: 'Debt Instrument', defaultChecked: false },
];

// The declaration block on the Confirm Details screen. `required: true` items
// gate the Confirm button; the rest are authorisations the applicant may
// decline. `detail` renders in an expandable row where the wording matters.
export const mockDeclarations = [
  // Charges lead the block: the applicant sees what the account costs before
  // working through the statutory declarations below.
  {
    id: 'tariff',
    required: true,
    control: 'tariff',
    text: 'I have reviewed the tariff structure and consent to the applicable charges.',
    // Hosted on ImageKit. A blob: URL cannot be hardcoded here: it is a runtime
    // handle tied to the document that created it, and browsers block top-level
    // navigation to blob: from another document.
    tariffUrl: 'https://ik.imagekit.io/bwbg5zxzq5/12c8dc3f-2220-4d40-a01b-4286e12fd20c.pdf',
  },
  {
    // Worded as a negative statement, so un-ticking is the admission: PEP
    // status cannot be taken online, and un-ticking raises the block modal.
    id: 'pep',
    required: true,
    text: 'I am not a Politically Exposed Person.',
  },
  {
    id: 'runningAccount',
    required: true,
    text: 'Running Account Authorisation for',
    control: 'settlement',
  },
  {
    id: 'residency',
    required: true,
    text: "I'm an Indian Resident. I'm neither a specified US person, US citizen/green card holder nor a Tax resident of any other country",
  },
  {
    id: 'ddpi',
    required: false,
    text: 'I Accept DDPI',
    detail:
      'Demat Debit and Pledge Instruction lets us debit only the securities you sell or pledge, so you do not need a TPIN for every trade. It is used for these purposes only:',
    // The four DDPI purposes permitted by the depositories.
    detailPoints: [
      'Transfer of securities held in the beneficial owner accounts of the client towards Stock Exchange related deliveries / settlement obligations arising out of trades executed by clients on the Stock Exchange through the same stock broker.',
      'Pledging / re-pledging of securities in favour of trading member (TM) / clearing member (CM) for the purpose of meeting margin requirements of the clients in connection with the trades executed by the clients on the Stock Exchange.',
      'Mutual Fund transactions being executed on stock exchange order entry platforms.',
      'Tendering shares in open offers through Stock Exchange platforms.',
    ],
  },
  {
    id: 'bseStar',
    required: false,
    text: 'I accept BSE StAR MF',
    linkLabel: 'T&C',
  },
  {
    id: 'ecn',
    required: false,
    text: 'I wish to receive ECN and other communications on my email',
  },
  {
    id: 'capacity',
    required: true,
    text: 'I declare that I am not incapacitated and am capable of operating my account on my own.',
  },
  {
    // Same shape: un-ticking admits an action and asks for the details.
    id: 'pastActions',
    required: true,
    text: 'I do not have any Past Actions from SEBI/Exchange in last 3 years',
  },
];

// Shown after F&O is activated, before the segment is confirmed.
export const mockRiskDisclosure = {
  title: 'Risk Disclosure on Derivatives',
  summary:
    '9 out of 10 individual traders in equity Futures and Options segment, incurred net losses.',
  points: [
    'On an average, loss makers registered net trading loss close to ₹50,000.',
    'Over and above the net trading losses incurred, loss makers expended an additional 28% of net trading losses as transaction costs.',
    'Those making net trading profits, incurred between 15% to 50% of such profits as transaction cost.',
  ],
  // The source line links out to the study itself; only the link text is
  // highlighted, the rest of the sentence stays plain.
  reference: {
    prefix: 'Source: ',
    linkLabel: 'SEBI study',
    href: 'https://www.sebi.gov.in/reports-and-statistics/research/jan-2023/study-analysis-of-profit-and-loss-of-individual-traders-dealing-in-equity-fando-segment_67525.html?trappable=true',
    suffix:
      ' dated January 25, 2023 on “Analysis of Profit and Loss of Individual Traders dealing in equity Futures and Options (F&O) Segment”, wherein Aggregate Level findings are based on annual Profit/Loss incurred by individual traders in equity F&O during FY 2021-22.',
  },
  acknowledgement:
    'I have read and understood the above-mentioned Risk Disclosure and acknowledge the same.',
};

// Shown when the applicant un-ticks the past-actions declaration, i.e. admits
// to a SEBI/Exchange action in the last 3 years. The details they type are the
// disclosure that lets the application carry on.
export const mockSebiActionDisclosure = {
  title: 'Past Actions',
  message:
    'Tell us what the SEBI/Exchange action was, so we can record it with your application.',
  placeholder: 'ENTER SEBI ACTION DETAILS',
  error: 'Enter the SEBI/Exchange action details to continue.',
};

// Shown when the applicant declares PEP status by un-ticking the PEP
// declaration. PEP accounts cannot be opened online, so confirming ends the
// journey and hands the applicant to a relationship manager.
export const mockPepBlock = {
  title: 'Hi',
  // Shown as a toast on the way back to the first screen.
  rejectedTitle: 'KYC application rejected',
  rejectedMessage:
    'PEP status accounts cannot be opened online. Our relationship manager will connect with you.',
  message:
    'Our relationship manager will connect with you to open your account. At present, PEP status accounts cannot be opened online.',
  note: 'Note: On confirming your journey will be logged out.',
};

export const mockFnoOffer = {
  title: 'Trade without maintenance fees',
  points: [
    'Zero annual maintenance charges for the first year',
    'Futures & Options enabled on the same account',
    'Activate now or any time later from your profile',
  ],
};

// Account-opening payment. Amounts are illustrative; no gateway is involved.
export const mockPayment = {
  currency: '₹',
  total: 1,
  breakdown: [{ label: 'Account verification charge', amount: 1 }],
  note: 'Refunded to the same account within 7 working days.',
  upiId: 'allvest.demo@upi',
  merchant: 'Allvest Securities (Demo)',
  apps: [
    { id: 'gpay', label: 'Google Pay', icon: '/assets/img/GPay.svg' },
    { id: 'phonepe', label: 'PhonePe', icon: '/assets/img/PhonePe.svg' },
    { id: 'paytm', label: 'Paytm', icon: '/assets/img/Paytm.svg' },
  ],
};

// Bank statement pulled on the payment screen — doubles as the income proof
// SEBI requires before F&O is activated.
export const mockBankStatement = {
  period: 'Last 6 months',
  transactions: 148,
  averageBalance: '₹1,24,500',
  highestBalance: '₹3,08,200',
  incomeProof: 'Bank statement (6 months)',
};

// The final Aadhaar-OTP e-sign on the account opening form.
export const MOCK_AADHAAR = {
  number: '123456781234',
  otp: '123456',
  esp: 'NSDL e-Sign (simulated)',
  signatureReference: 'ESIGN-AADHAAR-TEST-3391',
};

export const mockEsign = {
  provider: 'Demo e-Sign (simulated)',
  referenceId: 'ESIGN-TEST-9042',
  documentName: 'Account opening form (test)',
};

export const mockLocation = {
  latitude: '19.0760',
  longitude: '72.8777',
  city: 'Mumbai',
  state: 'Maharashtra',
  capturedAt: 'Captured during verification',
};

// The non-judicial stamp paper the executed form is printed on — the last page
// of the document.
export const mockStampPaper = {
  image: '/assets/img/stamp-paper.jpeg',
  value: 'Rs. 100',
  serial: 'AP 014507',
  state: 'West Bengal',
  kind: 'India Non Judicial',
};

export const mockFinalDocument = {
  documentId: 'AOF-TEST-2026-0001',
  documentName: 'Account_Opening_Form_TEST.pdf',
  generatedOn: '21/08/2026',
  pages: 1,
};
